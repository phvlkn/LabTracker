from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app import auth_service, schemas
from app.database import get_db


router = APIRouter(prefix="/auth", tags=["Авторизация"])


@router.post(
    "/register",
    response_model=schemas.UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register(data: schemas.UserCreate, db: Session = Depends(get_db)):
    return auth_service.register_user(db, data)


@router.post("/login", response_model=schemas.AuthResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, data)
    return auth_service.issue_token_pair(db, user)


@router.post("/refresh", response_model=schemas.AuthResponse)
def refresh(data: schemas.RefreshRequest, db: Session = Depends(get_db)):
    return auth_service.refresh_session(db, data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(data: schemas.LogoutRequest, db: Session = Depends(get_db)):
    auth_service.revoke_session(db, data.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
