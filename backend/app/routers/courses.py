from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app import schemas, services
from app.database import get_db


router = APIRouter(prefix="/courses", tags=["Курсы"])


@router.get("", response_model=list[schemas.CourseRead])
def get_courses(db: Session = Depends(get_db)):
    return services.list_courses(db)


@router.post(
    "",
    response_model=schemas.CourseRead,
    status_code=status.HTTP_201_CREATED,
)
def create_course(
    data: schemas.CourseCreate,
    db: Session = Depends(get_db),
):
    return services.create_course(db, data)


@router.get("/{course_id}", response_model=schemas.CourseDetail)
def get_course(course_id: int, db: Session = Depends(get_db)):
    return services.get_course_with_assignments(db, course_id)


@router.put("/{course_id}", response_model=schemas.CourseRead)
def update_course(
    course_id: int,
    data: schemas.CourseUpdate,
    db: Session = Depends(get_db),
):
    return services.update_course(db, course_id, data)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    services.delete_course(db, course_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

