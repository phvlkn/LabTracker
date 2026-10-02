from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import Select, asc, desc, select
from sqlalchemy.orm import Session, selectinload

from app import models, schemas


def get_course_or_404(db: Session, course_id: int) -> models.Course:
    course = db.get(models.Course, course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден",
        )
    return course


def list_courses(db: Session) -> list[models.Course]:
    query = select(models.Course).order_by(models.Course.created_at.desc())
    return list(db.scalars(query).all())


def get_course_with_assignments(db: Session, course_id: int) -> models.Course:
    query = (
        select(models.Course)
        .options(selectinload(models.Course.assignments))
        .where(models.Course.id == course_id)
    )
    course = db.scalar(query)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Курс не найден",
        )
    return course


def create_course(db: Session, data: schemas.CourseCreate) -> models.Course:
    course = models.Course(**data.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def update_course(
    db: Session,
    course_id: int,
    data: schemas.CourseUpdate,
) -> models.Course:
    course = get_course_or_404(db, course_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return course


def delete_course(db: Session, course_id: int) -> None:
    course = get_course_or_404(db, course_id)
    db.delete(course)
    db.commit()


def get_assignment_or_404(db: Session, assignment_id: int) -> models.Assignment:
    assignment = db.get(models.Assignment, assignment_id)
    if assignment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Задание не найдено",
        )
    return assignment


def list_assignments(
    db: Session,
    course_id: int | None,
    assignment_status: schemas.AssignmentStatus | None,
    assignment_type: schemas.AssignmentType | None,
    sort: schemas.AssignmentSort,
) -> list[models.Assignment]:
    query: Select[tuple[models.Assignment]] = select(models.Assignment)

    if course_id is not None:
        get_course_or_404(db, course_id)
        query = query.where(models.Assignment.course_id == course_id)
    if assignment_status is not None:
        query = query.where(models.Assignment.status == assignment_status)
    if assignment_type is not None:
        query = query.where(models.Assignment.type == assignment_type)

    if sort == schemas.AssignmentSort.DEADLINE_DESC:
        query = query.order_by(desc(models.Assignment.deadline).nulls_last())
    elif sort == schemas.AssignmentSort.CREATED_AT_DESC:
        query = query.order_by(desc(models.Assignment.created_at))
    else:
        query = query.order_by(asc(models.Assignment.deadline).nulls_last())

    return list(db.scalars(query).all())


def validate_grade(grade: Decimal | None, max_grade: int) -> None:
    if grade is not None and grade > max_grade:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Оценка должна быть от 0 до максимальной оценки включительно",
        )


def create_assignment(
    db: Session,
    data: schemas.AssignmentCreate,
) -> models.Assignment:
    get_course_or_404(db, data.course_id)
    validate_grade(data.grade, data.max_grade)
    assignment = models.Assignment(**data.model_dump())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def update_assignment(
    db: Session,
    assignment_id: int,
    data: schemas.AssignmentUpdate,
) -> models.Assignment:
    assignment = get_assignment_or_404(db, assignment_id)
    changes = data.model_dump(exclude_unset=True)

    if "course_id" in changes:
        get_course_or_404(db, changes["course_id"])

    next_grade = changes.get("grade", assignment.grade)
    next_max_grade = changes.get("max_grade", assignment.max_grade)
    validate_grade(next_grade, next_max_grade)

    for field, value in changes.items():
        setattr(assignment, field, value)
    db.commit()
    db.refresh(assignment)
    return assignment


def delete_assignment(db: Session, assignment_id: int) -> None:
    assignment = get_assignment_or_404(db, assignment_id)
    db.delete(assignment)
    db.commit()
