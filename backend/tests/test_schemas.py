from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas import AssignmentCreate, AssignmentStatus, AssignmentType


def valid_assignment(**changes):
    data = {
        "course_id": 1,
        "title": "Лабораторная работа №2",
        "type": AssignmentType.LAB,
        "status": AssignmentStatus.IN_PROGRESS,
        "max_grade": 10,
    }
    data.update(changes)
    return AssignmentCreate(**data)


def test_assignment_accepts_grade_inside_scale():
    assignment = valid_assignment(grade=Decimal("8.5"))
    assert assignment.grade == Decimal("8.5")


def test_assignment_rejects_grade_above_scale():
    with pytest.raises(ValidationError, match="максимальной"):
        valid_assignment(grade=Decimal("10.5"))


def test_assignment_rejects_blank_title():
    with pytest.raises(ValidationError, match="не должно быть пустым"):
        valid_assignment(title="   ")

