"""
Read-Only Database and Model Inspection Script for ForgeAI Backend.
This script performs non-destructive schema and model introspection.
"""
import sys
from sqlalchemy import create_engine, inspect, text
from app.core.config import settings
from app.database.base import Base
import app.models  # Load all 14 ORM models

def inspect_all():
    print("=" * 80)
    print(" 1. DATABASE CONNECTION & ALEMBIC VERSION")
    print("=" * 80)
    print(f"Target Database URL: {settings.DATABASE_URL}")
    
    engine = create_engine(settings.DATABASE_URL)
    inspector = inspect(engine)
    
    with engine.connect() as conn:
        try:
            version_res = conn.execute(text("SELECT version_num FROM alembic_version")).fetchall()
            if version_res:
                print(f"alembic_version table: EXISTS | Current Revision: {[r[0] for r in version_res]}")
            else:
                print("alembic_version table: EXISTS | Revision: EMPTY (No revision recorded)")
        except Exception as e:
            print(f"alembic_version table: NOT FOUND or query failed ({e})")

    db_tables = sorted(inspector.get_table_names())
    print(f"\nExisting Database Tables ({len(db_tables)}):")
    for t in db_tables:
        print(f"  • {t}")

    print("\n" + "=" * 80)
    print(" 2. MODEL METADATA REGISTRATION (Base.metadata)")
    print("=" * 80)
    model_tables = sorted(list(Base.metadata.tables.keys()))
    print(f"Registered ORM Tables ({len(model_tables)}):")
    for mt in model_tables:
        print(f"  • {mt}")

    expected_models = [
        "users", "user_sessions", "oauth_accounts", "organizations",
        "organization_members", "teams", "team_members", "projects",
        "project_members", "folders", "documents", "blueprints",
        "blueprint_artifacts", "subscriptions"
    ]
    missing_models = set(expected_models) - set(model_tables)
    if not missing_models:
        print("\nAll 14 expected models are correctly registered in Base.metadata!")
    else:
        print(f"\nMissing models in Base.metadata: {missing_models}")

    print("\n" + "=" * 80)
    print(" 3. DETAILED SCHEMA INTROSPECTION PER TABLE")
    print("=" * 80)
    for table_name in db_tables:
        print(f"\nTABLE: {table_name}")
        
        # Primary Key
        pk = inspector.get_pk_constraint(table_name)
        print(f"  Primary Key : {pk.get('constrained_columns', [])}")
        
        # Columns
        cols = inspector.get_columns(table_name)
        print(f"  Columns ({len(cols)}):")
        for c in cols:
            nullable_str = "NULL" if c['nullable'] else "NOT NULL"
            default_str = f" DEFAULT {c['default']}" if c.get('default') is not None else ""
            print(f"    - {c['name']:<25} {str(c['type']):<20} {nullable_str}{default_str}")
        
        # Foreign Keys
        fks = inspector.get_foreign_keys(table_name)
        if fks:
            print("  Foreign Keys:")
            for fk in fks:
                print(f"    - {fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}")
        
        # Unique Constraints
        uniques = inspector.get_unique_constraints(table_name)
        if uniques:
            print("  Unique Constraints:")
            for uq in uniques:
                print(f"    - {uq['name']}: {uq['column_names']}")
                
        # Check Constraints
        checks = inspector.get_check_constraints(table_name)
        if checks:
            print("  Check Constraints:")
            for ck in checks:
                print(f"    - {ck['name']}: {ck['sqltext']}")
                
        # Indexes
        indexes = inspector.get_indexes(table_name)
        if indexes:
            print("  Indexes:")
            for ix in indexes:
                uniq_flag = " [UNIQUE]" if ix['unique'] else ""
                print(f"    - {ix['name']}: {ix['column_names']}{uniq_flag}")

    print("\n" + "=" * 80)
    print(" INSPECTION COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    inspect_all()
