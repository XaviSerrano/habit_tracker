from sqlalchemy.orm import Session
from models import HabitLog, Habit
from schemas import HabitLogCreate
from datetime import datetime


def create_or_update_log(db: Session, user_id: str, log_data: HabitLogCreate) -> HabitLog:
    """Create or update a habit log. If value=0 and no note, delete the log."""
    habit = db.query(Habit).filter(
        Habit.id == log_data.habit_id,
        Habit.user_id == user_id
    ).first()

    if not habit:
        return None

    # Check if log already exists
    existing_log = db.query(HabitLog).filter(
        HabitLog.habit_id == log_data.habit_id,
        HabitLog.date == log_data.date
    ).first()

    # If value=0 and no note, delete if exists
    if log_data.value == 0 and not log_data.note:
        if existing_log:
            db.delete(existing_log)
            db.commit()
        return None

    if existing_log:
        existing_log.value = log_data.value
        existing_log.note = log_data.note
        existing_log.timestamp = datetime.utcnow().isoformat()
    else:
        existing_log = HabitLog(
            user_id=user_id,
            habit_id=log_data.habit_id,
            date=log_data.date,
            value=log_data.value,
            note=log_data.note,
            timestamp=datetime.utcnow().isoformat()
        )
        db.add(existing_log)

    db.commit()
    db.refresh(existing_log)
    return existing_log


def get_log(db: Session, user_id: str, habit_id: str, date: str) -> HabitLog:
    return db.query(HabitLog).filter(
        HabitLog.user_id == user_id,
        HabitLog.habit_id == habit_id,
        HabitLog.date == date
    ).first()


def get_logs_by_habit(db: Session, user_id: str, habit_id: str, start_date: str = None, end_date: str = None):
    query = db.query(HabitLog).filter(
        HabitLog.user_id == user_id,
        HabitLog.habit_id == habit_id
    )

    if start_date:
        query = query.filter(HabitLog.date >= start_date)
    if end_date:
        query = query.filter(HabitLog.date <= end_date)

    return query.all()


def get_all_logs_in_range(db: Session, user_id: str, start_date: str, end_date: str):
    return db.query(HabitLog).filter(
        HabitLog.user_id == user_id,
        HabitLog.date >= start_date,
        HabitLog.date <= end_date
    ).all()


def delete_log(db: Session, user_id: str, log_id: str) -> bool:
    log = db.query(HabitLog).filter(
        HabitLog.id == log_id,
        HabitLog.user_id == user_id
    ).first()

    if not log:
        return False

    db.delete(log)
    db.commit()
    return True
