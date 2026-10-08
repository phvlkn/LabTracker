from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas
from app.config import settings
from app.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)


def register_user(db: Session, data: schemas.UserCreate) -> models.User:
    existing_user = db.scalar(select(models.User).where(models.User.email == data.email))
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким email уже существует",
        )

    user = models.User(
        email=str(data.email),
        username=data.username,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, data: schemas.LoginRequest) -> models.User:
    user = db.scalar(select(models.User).where(models.User.email == data.email))
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )
    return user


def issue_token_pair(db: Session, user: models.User) -> schemas.AuthResponse:
    raw_refresh_token = create_refresh_token()
    session = models.RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(raw_refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_days),
    )
    db.add(session)
    db.commit()

    return schemas.AuthResponse(
        access_token=create_access_token(user.id),
        refresh_token=raw_refresh_token,
        user=user,
    )


def refresh_session(db: Session, raw_token: str) -> schemas.AuthResponse:
    session = db.scalar(
        select(models.RefreshToken).where(
            models.RefreshToken.token_hash == hash_refresh_token(raw_token)
        )
    )
    now = datetime.now(timezone.utc)
    if session is None or session.revoked_at is not None or session.expires_at <= now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token недействителен, истёк или отозван",
        )

    session.revoked_at = now
    user = session.user
    return issue_token_pair(db, user)


def revoke_session(db: Session, raw_token: str) -> None:
    session = db.scalar(
        select(models.RefreshToken).where(
            models.RefreshToken.token_hash == hash_refresh_token(raw_token)
        )
    )
    if session is None or session.revoked_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token недействителен или уже отозван",
        )

    session.revoked_at = datetime.now(timezone.utc)
    db.commit()
