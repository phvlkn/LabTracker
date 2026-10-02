from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.schemas import AssignmentStatus, AssignmentType


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    assignments: Mapped[list["Assignment"]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Assignment(Base):
    __tablename__ = "assignments"
    __table_args__ = (
        CheckConstraint("max_grade > 0", name="ck_assignment_max_grade_positive"),
        CheckConstraint("grade >= 0", name="ck_assignment_grade_non_negative"),
        CheckConstraint("grade <= max_grade", name="ck_assignment_grade_not_above_max"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    type: Mapped[AssignmentType] = mapped_column(
        Enum(
            AssignmentType,
            name="assignment_type",
            values_callable=lambda enum: [item.value for item in enum],
        ),
        nullable=False,
    )
    status: Mapped[AssignmentStatus] = mapped_column(
        Enum(
            AssignmentStatus,
            name="assignment_status",
            values_callable=lambda enum: [item.value for item in enum],
        ),
        default=AssignmentStatus.NOT_STARTED,
        nullable=False,
    )
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    max_grade: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    grade: Mapped[Decimal | None] = mapped_column(Numeric(6, 1))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    course: Mapped[Course] = relationship(back_populates="assignments")
