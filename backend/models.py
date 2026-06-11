from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    created_date = Column(DateTime, default=datetime.utcnow)

    habits = relationship("Habit", back_populates="owner", cascade="all, delete-orphan")
    logs = relationship("HabitLog", back_populates="owner", cascade="all, delete-orphan")


class Habit(Base):
    __tablename__ = "habits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)  # health, mind, focus, body, routine
    frequency = Column(String, nullable=False)  # daily or specific_days
    specific_days = Column(String)  # JSON array as string
    target = Column(Integer, nullable=False)
    target_unit = Column(String, nullable=False)
    created_at = Column(String, nullable=False)
    archived = Column(Boolean, default=False)
    color = Column(String, nullable=False)
    created_date = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    habit_id = Column(String, ForeignKey("habits.id", ondelete="CASCADE"), nullable=False)
    date = Column(String, nullable=False)  # YYYY-MM-DD
    value = Column(Integer, nullable=False)
    note = Column(Text)
    timestamp = Column(String, nullable=False)
    created_date = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="logs")
    habit = relationship("Habit", back_populates="logs")

    __table_args__ = (
        # Unique constraint on (habit_id, date) to ensure one log per habit per day
        # Note: SQLAlchemy handles this via session, but let's keep it simple
    )
