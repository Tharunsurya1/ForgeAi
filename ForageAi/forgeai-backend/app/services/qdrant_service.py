"""
Production-grade Qdrant Vector Database Service for ForgeAI RAG.
Manages collections, vector indexing, metadata filtering, and similarity search.
Supports both real hosted/local Qdrant instances and in-memory mode (for testing).
"""

import logging
from typing import Any, Dict, List, Optional, Sequence, Union
import uuid

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchAny,
    MatchValue,
    PointStruct,
    VectorParams,
)

from app.core.config import settings

logger = logging.getLogger("forgeai.qdrant_service")


class QdrantServiceError(Exception):
    """Base exception for Qdrant operations."""
    pass


class QdrantService:
    """
    Service wrapper around QdrantClient providing robust collection management,
    vector upsert, filtering, similarity search, and health monitoring.
    """

    def __init__(
        self,
        url: Optional[str] = None,
        api_key: Optional[str] = None,
        default_collection: Optional[str] = None,
        client: Optional[QdrantClient] = None,
    ):
        self.url = url or settings.QDRANT_URL or "http://localhost:6333"
        self.api_key = api_key or settings.QDRANT_API_KEY or None
        self.default_collection = default_collection or settings.QDRANT_COLLECTION or "forgeai_knowledge"
        self._client = client

    def get_client(self) -> QdrantClient:
        """Lazily initialize and return the Qdrant client with graceful in-memory fallback."""
        if self._client is None:
            if self.url == ":memory:":
                logger.info("Initializing QdrantClient in :memory: mode")
                self._client = QdrantClient(":memory:")
            else:
                logger.info(f"Connecting to Qdrant at {self.url}")
                try:
                    c = QdrantClient(
                        url=self.url,
                        api_key=self.api_key,
                        timeout=2.0,
                    )
                    # Quick connectivity check
                    c.get_collections()
                    self._client = c
                except Exception as conn_err:
                    logger.warning(
                        f"Unable to connect to Qdrant at {self.url} ({conn_err}). "
                        "Falling back to local in-memory Qdrant client."
                    )
                    self._client = QdrantClient(":memory:")
        return self._client

    def ensure_collection(
        self,
        collection_name: Optional[str] = None,
        vector_size: Optional[int] = None,
        distance: Distance = Distance.COSINE,
    ) -> bool:
        """
        Verify collection exists. If not, create it with specified dimension and distance metric.
        """
        col = collection_name or self.default_collection
        dim = vector_size or settings.EMBEDDING_DIMENSION or 1536
        client = self.get_client()

        try:
            collections_res = client.get_collections()
            existing_names = {c.name for c in collections_res.collections}
            if col in existing_names:
                return True

            logger.info(f"Creating Qdrant collection '{col}' with dim={dim}, distance={distance}")
            client.create_collection(
                collection_name=col,
                vectors_config=VectorParams(size=dim, distance=distance),
            )
            return True
        except Exception as e:
            logger.error(f"Failed to ensure Qdrant collection '{col}': {e}")
            raise QdrantServiceError(f"Failed to ensure collection '{col}': {e}") from e

    def upsert_points(
        self,
        points: List[PointStruct],
        collection_name: Optional[str] = None,
        batch_size: int = 64,
    ) -> bool:
        """
        Upsert a list of PointStruct items in batches.
        """
        if not points:
            return True

        col = collection_name or self.default_collection
        client = self.get_client()
        self.ensure_collection(col)

        try:
            for i in range(0, len(points), batch_size):
                batch = points[i : i + batch_size]
                client.upsert(collection_name=col, points=batch)
            return True
        except Exception as e:
            logger.error(f"Failed to upsert {len(points)} points into '{col}': {e}")
            raise QdrantServiceError(f"Failed to upsert points into '{col}': {e}") from e

    def search(
        self,
        query_vector: List[float],
        collection_name: Optional[str] = None,
        query_filter: Optional[Filter] = None,
        limit: int = 5,
        score_threshold: Optional[float] = None,
    ) -> List[Any]:
        """
        Perform vector similarity search with optional metadata filtering.
        Returns a list of ScoredPoint objects with id, score, and payload.
        """
        col = collection_name or self.default_collection
        client = self.get_client()

        try:
            # Modern qdrant-client uses query_points
            if hasattr(client, "query_points"):
                response = client.query_points(
                    collection_name=col,
                    query=query_vector,
                    query_filter=query_filter,
                    limit=limit,
                    score_threshold=score_threshold,
                    with_payload=True,
                )
                return response.points

            # Fallback for older client versions
            if hasattr(client, "search"):
                return client.search(
                    collection_name=col,
                    query_vector=query_vector,
                    query_filter=query_filter,
                    limit=limit,
                    score_threshold=score_threshold,
                    with_payload=True,
                )

            raise QdrantServiceError("QdrantClient does not support query_points or search")
        except Exception as e:
            logger.warning(f"Qdrant search on '{col}' failed: {e}")
            # If search fails because collection does not exist yet, return empty list
            if "not found" in str(e).lower() or "doesn't exist" in str(e).lower():
                return []
            raise QdrantServiceError(f"Vector search failed on '{col}': {e}") from e

    def delete_points(
        self,
        point_ids: Sequence[Union[str, int, uuid.UUID]],
        collection_name: Optional[str] = None,
    ) -> bool:
        """
        Delete specific point IDs from the collection.
        """
        if not point_ids:
            return True

        col = collection_name or self.default_collection
        client = self.get_client()

        try:
            # Convert UUID objects to strings if needed
            str_ids = [str(pid) if isinstance(pid, uuid.UUID) else pid for pid in point_ids]
            client.delete(
                collection_name=col,
                points_selector=qmodels.PointIdsList(points=str_ids),
            )
            return True
        except Exception as e:
            logger.error(f"Failed to delete points from '{col}': {e}")
            raise QdrantServiceError(f"Failed to delete points from '{col}': {e}") from e

    def delete_by_filter(
        self,
        filter_condition: Filter,
        collection_name: Optional[str] = None,
    ) -> bool:
        """
        Delete points matching a metadata filter condition (e.g. by artifact_id or blueprint_id).
        """
        col = collection_name or self.default_collection
        client = self.get_client()

        try:
            client.delete(
                collection_name=col,
                points_selector=qmodels.FilterSelector(filter=filter_condition),
            )
            return True
        except Exception as e:
            logger.error(f"Failed to delete points by filter from '{col}': {e}")
            raise QdrantServiceError(f"Failed to delete points by filter: {e}") from e

    def health(self) -> Dict[str, Any]:
        """
        Check connectivity to Qdrant and retrieve collection metrics.
        """
        try:
            client = self.get_client()
            res = client.get_collections()
            existing_names = [c.name for c in res.collections]
            is_our_col_present = self.default_collection in existing_names

            points_count = 0
            if is_our_col_present:
                info = client.get_collection(self.default_collection)
                points_count = getattr(info, "points_count", 0) or 0

            return {
                "status": "healthy",
                "url": self.url if self.url != ":memory:" else "in-memory",
                "collections_total": len(existing_names),
                "target_collection": self.default_collection,
                "collection_exists": is_our_col_present,
                "points_count": points_count,
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "url": self.url if self.url != ":memory:" else "in-memory",
                "error": str(e),
                "target_collection": self.default_collection,
                "collection_exists": False,
            }


# Singleton service instance
qdrant_service = QdrantService()
