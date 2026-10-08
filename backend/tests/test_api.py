from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import delete

from app.database import SessionLocal
from app.main import app
from app.models import User


def create_account(client: TestClient, prefix: str):
    email = f"{prefix}-{uuid4().hex[:8]}@example.com"
    password = "strong-password"
    register_response = client.post(
        "/api/auth/register",
        json={"email": email, "username": prefix, "password": password},
    )
    assert register_response.status_code == 201
    login_response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    tokens = login_response.json()
    return email, tokens, {"Authorization": f"Bearer {tokens['access_token']}"}


def delete_test_users(*emails: str):
    if not emails:
        return
    with SessionLocal() as db:
        db.execute(delete(User).where(User.email.in_(emails)))
        db.commit()


def test_protected_course_and_assignment_crud():
    emails: list[str] = []
    try:
        with TestClient(app) as client:
            first_email, _, first_headers = create_account(client, "student-one")
            second_email, _, second_headers = create_account(client, "student-two")
            emails.extend([first_email, second_email])

            assert client.get("/api/courses").status_code == 401

            course_response = client.post(
                "/api/courses",
                json={"title": "Тестовый курс", "description": "CRUD"},
                headers=first_headers,
            )
            assert course_response.status_code == 201
            course_id = course_response.json()["id"]

            hidden_from_other_user = client.get(
                f"/api/courses/{course_id}", headers=second_headers
            )
            assert hidden_from_other_user.status_code == 404

            assignment_response = client.post(
                "/api/assignments",
                json={
                    "course_id": course_id,
                    "title": "Лабораторная работа",
                    "type": "lab",
                    "status": "in_progress",
                    "max_grade": 10,
                },
                headers=first_headers,
            )
            assert assignment_response.status_code == 201
            assignment_id = assignment_response.json()["id"]

            filtered_response = client.get(
                "/api/assignments",
                params={"course_id": course_id, "status": "in_progress"},
                headers=first_headers,
            )
            assert filtered_response.status_code == 200
            assert [item["id"] for item in filtered_response.json()] == [assignment_id]

            update_response = client.patch(
                f"/api/assignments/{assignment_id}",
                json={"status": "graded", "grade": 8.5},
                headers=first_headers,
            )
            assert update_response.status_code == 200
            assert update_response.json()["grade"] == "8.5"

            invalid_response = client.patch(
                f"/api/assignments/{assignment_id}",
                json={"max_grade": 5},
                headers=first_headers,
            )
            assert invalid_response.status_code == 422

            delete_response = client.delete(
                f"/api/courses/{course_id}", headers=first_headers
            )
            assert delete_response.status_code == 204
            missing_response = client.get(
                f"/api/assignments/{assignment_id}", headers=first_headers
            )
            assert missing_response.status_code == 404
    finally:
        delete_test_users(*emails)

