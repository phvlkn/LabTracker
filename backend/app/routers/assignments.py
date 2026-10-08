from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app import schemas, services
from app.database import get_db
from app.dependencies import CurrentUser


router = APIRouter(prefix="/assignments", tags=["Задания"])


@router.get("", response_model=list[schemas.AssignmentRead])
def get_assignments(
    current_user: CurrentUser,
    course_id: int | None = Query(default=None, gt=0),
    assignment_status: schemas.AssignmentStatus | None = Query(
        default=None,
        alias="status",
    ),
    assignment_type: schemas.AssignmentType | None = Query(
        default=None,
        alias="type",
    ),
    sort: schemas.AssignmentSort = schemas.AssignmentSort.DEADLINE_ASC,
    db: Session = Depends(get_db),
):
    return services.list_assignments(
        db,
        course_id,
        assignment_status,
        assignment_type,
        sort,
        current_user.id,
    )


@router.post(
    "",
    response_model=schemas.AssignmentRead,
    status_code=status.HTTP_201_CREATED,
)
def create_assignment(
    data: schemas.AssignmentCreate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return services.create_assignment(db, data, current_user.id)


@router.get("/{assignment_id}", response_model=schemas.AssignmentRead)
def get_assignment(
    assignment_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return services.get_assignment_or_404(db, assignment_id, current_user.id)


@router.patch("/{assignment_id}", response_model=schemas.AssignmentRead)
def update_assignment(
    assignment_id: int,
    data: schemas.AssignmentUpdate,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    return services.update_assignment(db, assignment_id, data, current_user.id)


@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(
    assignment_id: int,
    current_user: CurrentUser,
    db: Session = Depends(get_db),
):
    services.delete_assignment(db, assignment_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
