from typing import Generic, Optional, Type, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    def __init__(self, model: Type[ModelT]) -> None:
        self.model = model

    async def get(self, db: AsyncSession, id: int) -> Optional[ModelT]:
        result = await db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()

    async def get_by_external_id(self, db: AsyncSession, external_id: str) -> Optional[ModelT]:
        result = await db.execute(
            select(self.model).where(self.model.external_id == external_id)
        )
        return result.scalar_one_or_none()

    async def delete(self, db: AsyncSession, instance: ModelT) -> None:
        await db.delete(instance)
        await db.commit()
