from sqlalchemy.orm import Session
from ..models import Habit
from ..schemas import HabitCreate, HabitUpdate
import json
from datetime import datetime


def create_habit(db: Session, user_id: str, habit_data: HabitCreate) -> Habit:
    habit = Habit(
        user_id=user_id,
        name=habit_data.name,
        description=habit_data.description,
        category=habit_data.category,
        frequency=habit_data.frequency,
        specific_days=json.dumps(habit_data.specific_days),
        target=habit_data.target,
        target_unit=habit_data.target_unit,
        created_at=datetime.utcnow().isoformat(),
        archived=False,
        color=habit_data.color
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


def get_user_habits(db: Session, user_id: str, archived: bool = False):
    return db.query(Habit).filter(
        Habit.user_id == user_id,
        Habit.archived == archived
    ).all()


def get_habit(db: Session, user_id: str, habit_id: str):
    return db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == user_id
    ).first()


def update_habit(db: Session, user_id: str, habit_id: str, habit_data: HabitUpdate) -> Habit:
    habit = get_habit(db, user_id, habit_id)
    if not habit:
        return None

    for key, value in habit_data.dict(exclude_unset=True).items():
        if key == "specific_days" and value is not None:
            setattr(habit, key, json.dumps(value))
        else:
            setattr(habit, key, value)

    db.commit()
    db.refresh(habit)
    return habit


def archive_habit(db: Session, user_id: str, habit_id: str, archive: bool) -> Habit:
    habit = get_habit(db, user_id, habit_id)
    if not habit:
        return None
    habit.archived = archive
    db.commit()
    db.refresh(habit)
    return habit


def delete_habit(db: Session, user_id: str, habit_id: str) -> bool:
    habit = get_habit(db, user_id, habit_id)
    if not habit:
        return False
    db.delete(habit)
    db.commit()
    return True


def is_habit_active_on_day(habit: Habit, day_of_week: int) -> bool:
    """Check if habit is scheduled on the given day of week (0=Sunday, 6=Saturday)"""
    if habit.frequency == "daily":
        return True

    if habit.frequency == "specific_days":
        specific_days = json.loads(habit.specific_days) if habit.specific_days else []
        return day_of_week in specific_days

    return False
