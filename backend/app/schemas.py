from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class AssignmentType(str, Enum):
    LAB = "lab"
    HOMEWORK = "homework"
    OTHER = "other"


class AssignmentStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"


class AssignmentSort(str, Enum):
    DEADLINE_ASC = "deadline_asc"
    DEADLINE_DESC = "deadline_desc"
    CREATED_AT_DESC = "created_at_desc"


class CourseBase(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Название курса не должно быть пустым")
        return value


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Название курса не должно быть пустым")
        return value


class CourseRead(CourseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssignmentBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=4000)
    type: AssignmentType
    status: AssignmentStatus = AssignmentStatus.NOT_STARTED
    deadline: datetime | None = None
    max_grade: int = Field(default=10, gt=0, le=1000)
    grade: Decimal | None = Field(default=None, ge=0, decimal_places=1)

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Название задания не должно быть пустым")
        return value

    @model_validator(mode="after")
    def grade_must_fit_scale(self) -> "AssignmentBase":
        if self.grade is not None and self.grade > self.max_grade:
            raise ValueError("Оценка не может быть больше максимальной")
        return self


class AssignmentCreate(AssignmentBase):
    course_id: int = Field(gt=0)


class AssignmentUpdate(BaseModel):
    course_id: int | None = Field(default=None, gt=0)
    title: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = Field(default=None, max_length=4000)
    type: AssignmentType | None = None
    status: AssignmentStatus | None = None
    deadline: datetime | None = None
    max_grade: int | None = Field(default=None, gt=0, le=1000)
    grade: Decimal | None = Field(default=None, ge=0, decimal_places=1)

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("Название задания не должно быть пустым")
        return value


class AssignmentRead(AssignmentBase):
    id: int
    course_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CourseDetail(CourseRead):
    assignments: list[AssignmentRead]

