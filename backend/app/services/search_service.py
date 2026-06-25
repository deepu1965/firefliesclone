from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.search_repo import search_repo
from app.schemas.search import SearchResponse


class SearchService:
    async def global_search(
        self,
        db: AsyncSession,
        query: str,
        search_type: str = "all",
        limit: int = 30,
    ) -> SearchResponse:
        return await search_repo.global_search(db, query, search_type=search_type, limit=limit)


search_service = SearchService()
