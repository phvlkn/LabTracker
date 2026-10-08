from fastapi import APIRouter

from app import schemas
from app.dependencies import CurrentUser


router = APIRouter(prefix="/users", tags=["Пользователи"])


@router.get("/me", response_model=schemas.UserRead)
def get_me(current_user: CurrentUser):
    return current_user
