"""
Unit and integration tests for Workflow database models (Phase 4B).
Validates WorkflowExecution, AgentRun, and WorkflowEvent models,
relationships, cascade deletions, constraints, and foreign-key behaviors.
"""

import uuid
import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.blueprint import Blueprint
from app.models.organization import Organization
from app.models.project import Project
from app.models.user import User
from app.models.workflow_execution import WorkflowExecution
from app.models.agent_run import AgentRun
from app.models.workflow_event import WorkflowEvent


def _create_test_hierarchy(db: Session):
    """Helper to provision test User, Organization, and Project."""
    user = User(
        email=f"wf_test_{uuid.uuid4().hex[:8]}@testforgeai.com",
        password_hash=get_password_hash("Password123!"),
        full_name="Workflow Model Tester",
        is_active=True,
    )
    db.add(user)
    db.flush()

    org = Organization(
        name=f"WF Org {uuid.uuid4().hex[:6]}",
        slug=f"wf-org-{uuid.uuid4().hex[:8]}",
        billing_email=user.email,
    )
    db.add(org)
    db.flush()

    project = Project(
        organization_id=org.id,
        created_by=user.id,
        name="Workflow Test Project",
        slug=f"wf-proj-{uuid.uuid4().hex[:8]}",
        tech_stack={"backend": "FastAPI", "database": "PostgreSQL"},
    )
    db.add(project)
    db.flush()

    return user, org, project


def test_workflow_execution_creation_and_defaults(db: Session):
    """Test creating a WorkflowExecution record with proper defaults."""
    user, org, project = _create_test_hierarchy(db)

    wf = WorkflowExecution(
        project_id=project.id,
        triggered_by_user_id=user.id,
        prompt="Design a microservices e-commerce platform",
        tech_stack={"backend": "FastAPI"},
        metadata_={"source": "test_suite"},
    )
    db.add(wf)
    db.commit()
    db.refresh(wf)

    assert wf.id is not None
    assert wf.status == "pending"
    assert wf.workflow_name == "full_blueprint_generation"
    assert wf.progress_percentage == 0
    assert wf.current_agent is None
    assert wf.error_message is None
    assert wf.started_at is None
    assert wf.completed_at is None
    assert wf.created_at is not None
    assert wf.updated_at is not None
    assert wf.metadata_["source"] == "test_suite"


def test_workflow_execution_status_constraint(db: Session):
    """Test that invalid status values are rejected by check constraint."""
    user, org, project = _create_test_hierarchy(db)

    wf = WorkflowExecution(
        project_id=project.id,
        triggered_by_user_id=user.id,
        prompt="Test constraint",
        status="invalid_status_value",  # Should fail check constraint
    )
    db.add(wf)
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_workflow_execution_progress_constraint(db: Session):
    """Test that progress percentage > 100 or < 0 is rejected by check constraint."""
    user, org, project = _create_test_hierarchy(db)

    wf = WorkflowExecution(
        project_id=project.id,
        triggered_by_user_id=user.id,
        prompt="Test constraint",
        progress_percentage=150,  # > 100
    )
    db.add(wf)
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_agent_run_relationship_and_cascade(db: Session):
    """Test AgentRun creation linked to WorkflowExecution and cascade deletion."""
    user, org, project = _create_test_hierarchy(db)

    wf = WorkflowExecution(
        project_id=project.id,
        triggered_by_user_id=user.id,
        prompt="Multi-agent execution workflow",
        status="running",
    )
    db.add(wf)
    db.flush()

    run1 = AgentRun(
        workflow_execution_id=wf.id,
        agent_name="RequirementsAgent",
        status="completed",
        execution_time_ms=350,
        input_payload={"prompt": wf.prompt},
        output_payload={"personas": ["Admin", "Customer"]},
    )
    run2 = AgentRun(
        workflow_execution_id=wf.id,
        agent_name="DatabaseAgent",
        status="running",
        retry_count=1,
        input_payload={"requirements_ready": True},
    )
    db.add_all([run1, run2])
    db.commit()
    db.refresh(wf)

    assert len(wf.agent_runs) == 2
    agent_names = [r.agent_name for r in wf.agent_runs]
    assert "RequirementsAgent" in agent_names
    assert "DatabaseAgent" in agent_names

    # Test cascade: deleting the workflow execution must cascade delete the agent runs
    wf_id = wf.id
    db.delete(wf)
    db.commit()

    remaining_runs = db.query(AgentRun).filter(AgentRun.workflow_execution_id == wf_id).all()
    assert len(remaining_runs) == 0


def test_workflow_event_ordering_and_cascade(db: Session):
    """Test WorkflowEvent creation, sequence ordering, and cascade deletion."""
    user, org, project = _create_test_hierarchy(db)

    wf = WorkflowExecution(
        project_id=project.id,
        triggered_by_user_id=user.id,
        prompt="Workflow for event testing",
        status="running",
    )
    db.add(wf)
    db.flush()

    ev1 = WorkflowEvent(
        workflow_execution_id=wf.id,
        event_type="workflow_started",
        sequence_number=1,
        payload={"step": "init"},
    )
    ev2 = WorkflowEvent(
        workflow_execution_id=wf.id,
        event_type="agent_started",
        agent_name="RequirementsAgent",
        sequence_number=2,
        payload={"stage": "extraction"},
    )
    ev3 = WorkflowEvent(
        workflow_execution_id=wf.id,
        event_type="agent_completed",
        agent_name="RequirementsAgent",
        sequence_number=3,
        payload={"duration_ms": 280},
    )
    db.add_all([ev1, ev2, ev3])
    db.commit()
    db.refresh(wf)

    assert len(wf.events) == 3
    assert [e.sequence_number for e in wf.events] == [1, 2, 3]

    # Deleting workflow must cascade delete events
    wf_id = wf.id
    db.delete(wf)
    db.commit()

    remaining_events = db.query(WorkflowEvent).filter(WorkflowEvent.workflow_execution_id == wf_id).all()
    assert len(remaining_events) == 0


def test_foreign_key_set_null_on_user_and_blueprint_delete(db: Session):
    """Test that deleting the triggering user or linked blueprint sets foreign key to NULL without deleting the workflow."""
    owner, org, project = _create_test_hierarchy(db)

    # Separate user who triggers the workflow
    trigger_user = User(
        email=f"wf_trigger_{uuid.uuid4().hex[:8]}@testforgeai.com",
        password_hash=get_password_hash("Password123!"),
        full_name="Trigger User",
        is_active=True,
    )
    db.add(trigger_user)
    db.flush()

    blueprint = Blueprint(
        project_id=project.id,
        title="Test Blueprint",
        summary="Summary",
        status="completed",
    )
    db.add(blueprint)
    db.flush()

    wf = WorkflowExecution(
        project_id=project.id,
        triggered_by_user_id=trigger_user.id,
        blueprint_id=blueprint.id,
        prompt="Preserve workflow on user deletion",
    )
    db.add(wf)
    db.commit()
    db.refresh(wf)

    assert wf.triggered_by_user_id == trigger_user.id
    assert wf.blueprint_id == blueprint.id

    # Delete the blueprint -> blueprint_id should become NULL
    db.delete(blueprint)
    db.commit()
    db.refresh(wf)
    assert wf.blueprint_id is None

    # Delete the triggering user -> triggered_by_user_id should become NULL
    db.delete(trigger_user)
    db.commit()
    db.refresh(wf)
    assert wf.triggered_by_user_id is None
    assert wf.id is not None
