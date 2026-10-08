from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.security import decode_access_token


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> models.User:
    error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Требуется действующий access token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise error

    try:
        user_id = decode_access_token(credentials.credentials)
    except (jwt.InvalidTokenError, ValueError):
        raise error from None

    user = db.get(models.User, user_id)
    if user is None:
        raise error
    return user


CurrentUser = Annotated[models.User, Depends(get_current_user)]
