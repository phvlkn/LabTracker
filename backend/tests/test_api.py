from fastapi.testclient import TestClient

from app.main import app


def test_course_and_assignment_crud():
    with TestClient(app) as client:
        course_response = client.post(
            "/api/courses",
            json={
                "title": "Тестовый курс",
                "description": "Создан автоматическим тестом",
            },
        )
        assert course_response.status_code == 201
        course_id = course_response.json()["id"]

        assignment_response = client.post(
            "/api/assignments",
            json={
                "course_id": course_id,
                "title": "Лабораторная работа",
                "type": "lab",
                "status": "in_progress",
                "max_grade": 10,
            },
        )
        assert assignment_response.status_code == 201
        assignment_id = assignment_response.json()["id"]

        filtered_response = client.get(
            "/api/assignments",
            params={"course_id": course_id, "status": "in_progress"},
        )
        assert filtered_response.status_code == 200
        assert [item["id"] for item in filtered_response.json()] == [assignment_id]

        update_response = client.patch(
            f"/api/assignments/{assignment_id}",
            json={"status": "graded", "grade": 8.5},
        )
        assert update_response.status_code == 200
        assert update_response.json()["grade"] == "8.5"

        invalid_response = client.patch(
            f"/api/assignments/{assignment_id}",
            json={"max_grade": 5},
        )
        assert invalid_response.status_code == 422

        course_detail_response = client.get(f"/api/courses/{course_id}")
        assert course_detail_response.status_code == 200
        assert len(course_detail_response.json()["assignments"]) == 1

        delete_response = client.delete(f"/api/courses/{course_id}")
        assert delete_response.status_code == 204

        missing_response = client.get(f"/api/assignments/{assignment_id}")
        assert missing_response.status_code == 404
        assert missing_response.json()["detail"] == "Задание не найдено"

