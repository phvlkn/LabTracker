from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app import schemas, services
from app.database import get_db
from app.dependencies import CurrentUser


router = APIRouter(prefix="/courses", tags=["Курсы"])


@router.get("", response_model=list[schemas.CourseRead])
def get_courses(current_user: CurrentUser, db: Session = Depends(get_db)):
    return services.list_courses(db, current_user.id)


@router.post(
    "",
    response_model=schemas.CourseRead,
    status_code=status.HTTP_201_CREATED,
)
def create_course(
    data: schemas.CourseCreate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return services.create_course(db, data, current_user.id)


@router.get("/{course_id}", response_model=schemas.CourseDetail)
def get_course(
    course_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return services.get_course_with_assignments(db, course_id, current_user.id)


@router.put("/{course_id}", response_model=schemas.CourseRead)
def update_course(
    course_id: int,
    data: schemas.CourseUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return services.update_course(db, course_id, data, current_user.id)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    services.delete_course(db, course_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
