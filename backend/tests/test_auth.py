from uuid import uuid4

import jwt
from fastapi.testclient import TestClient
from sqlalchemy import delete

from app.config import settings
from app.database import SessionLocal
from app.main import app
from app.models import User


def test_registration_refresh_rotation_and_logout():
    email = f"auth-{uuid4().hex[:8]}@example.com"
    password = "strong-password"
    try:
        with TestClient(app) as client:
            registration = client.post(
                "/api/auth/register",
                json={"email": email, "username": "Студент", "password": password},
            )
            assert registration.status_code == 201

            with SessionLocal() as db:
                stored_user = db.query(User).filter(User.email == email).one()
                assert stored_user.password_hash != password
                assert stored_user.password_hash.startswith("$argon2")

            duplicate = client.post(
                "/api/auth/register",
                json={"email": email, "username": "Дубль", "password": password},
            )
            assert duplicate.status_code == 409

            wrong_password = client.post(
                "/api/auth/login",
                json={"email": email, "password": "wrong-password"},
            )
            assert wrong_password.status_code == 401

            login = client.post(
                "/api/auth/login", json={"email": email, "password": password}
            )
            assert login.status_code == 200
            first_tokens = login.json()

            current_user = client.get(
                "/api/users/me",
                headers={"Authorization": f"Bearer {first_tokens['access_token']}"},
            )
            assert current_user.status_code == 200
            assert current_user.json()["email"] == email

            refresh = client.post(
                "/api/auth/refresh",
                json={"refresh_token": first_tokens["refresh_token"]},
            )
            assert refresh.status_code == 200
            second_tokens = refresh.json()
            assert second_tokens["refresh_token"] != first_tokens["refresh_token"]

            reused_token = client.post(
                "/api/auth/refresh",
                json={"refresh_token": first_tokens["refresh_token"]},
            )
            assert reused_token.status_code == 401

            logout = client.post(
                "/api/auth/logout",
                json={"refresh_token": second_tokens["refresh_token"]},
            )
            assert logout.status_code == 204

            refresh_after_logout = client.post(
                "/api/auth/refresh",
                json={"refresh_token": second_tokens["refresh_token"]},
            )
            assert refresh_after_logout.status_code == 401

            expired_access_token = jwt.encode(
                {
                    "sub": str(first_tokens["user"]["id"]),
                    "type": "access",
                    "exp": 0,
                },
                settings.secret_key,
                algorithm="HS256",
            )
            expired_access = client.get(
                "/api/users/me",
                headers={"Authorization": f"Bearer {expired_access_token}"},
            )
            assert expired_access.status_code == 401
    finally:
        with SessionLocal() as db:
            db.execute(delete(User).where(User.email == email))
            db.commit()
