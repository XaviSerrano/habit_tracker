from sqlalchemy.orm import Session
from models import Habit, HabitLog
from datetime import datetime, timedelta
from typing import List
import json


def calculate_streaks(db: Session, user_id: str, habit_id: str) -> dict:
    """Calculate current and longest streak for a habit"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == user_id
    ).first()

    if not habit:
        return {"current_streak": 0, "longest_streak": 0}

    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id
    ).order_by(HabitLog.date).all()

    if not logs:
        return {"current_streak": 0, "longest_streak": 0}

    # Calculate longest streak
    longest_streak = 1
    current_longest = 1

    log_dates = [datetime.strptime(log.date, "%Y-%m-%d").date() for log in logs if log.value >= habit.target]

    if not log_dates:
        return {"current_streak": 0, "longest_streak": 0}

    for i in range(1, len(log_dates)):
        if (log_dates[i] - log_dates[i - 1]).days == 1:
            current_longest += 1
            longest_streak = max(longest_streak, current_longest)
        else:
            current_longest = 1

    # Calculate current streak
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)

    current_streak = 0
    check_date = today

    while True:
        date_str = check_date.strftime("%Y-%m-%d")
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == habit_id,
            HabitLog.date == date_str
        ).first()

        if log and log.value >= habit.target:
            current_streak += 1
            check_date -= timedelta(days=1)
        elif check_date == today or check_date == yesterday:
            # Allow starting from yesterday if today is incomplete
            check_date -= timedelta(days=1)
        else:
            break

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak
    }


def calculate_completion_rate(db: Session, user_id: str, habit_id: str, days: int = 30) -> float:
    """Calculate % completion rate over last N days"""
    habit = db.query(Habit).filter(
        Habit.id == habit_id,
        Habit.user_id == user_id
    ).first()

    if not habit:
        return 0.0

    start_date = (datetime.utcnow().date() - timedelta(days=days)).strftime("%Y-%m-%d")
    logs = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.date >= start_date
    ).all()

    completed = sum(1 for log in logs if log.value >= habit.target)
    return round((completed / days) * 100, 1)


def get_daily_progress(db: Session, user_id: str, date: str) -> dict:
    """Get completed/total habits for a specific date"""
    habits = db.query(Habit).filter(
        Habit.user_id == user_id,
        Habit.archived == False
    ).all()

    check_date = datetime.strptime(date, "%Y-%m-%d").date()
    day_of_week = check_date.weekday()  # 0=Monday, 6=Sunday
    # Convert to Sunday=0 format
    day_of_week = (day_of_week + 1) % 7

    completed = 0
    total = 0

    for habit in habits:
        # Check if habit was created before/on this date
        habit_created = datetime.strptime(habit.created_at, "%Y-%m-%dT%H:%M:%S.%f")
        if habit_created.date() > check_date:
            continue

        # Check if habit is scheduled on this day
        from services.habit_service import is_habit_active_on_day
        if not is_habit_active_on_day(habit, day_of_week):
            continue

        total += 1
        log = db.query(HabitLog).filter(
            HabitLog.habit_id == habit.id,
            HabitLog.date == date
        ).first()

        if log and log.value >= habit.target:
            completed += 1

    percent = round((completed / total * 100) if total > 0 else 0, 1)
    return {
        "completed": completed,
        "total": total,
        "percent": percent
    }


def get_heatmap_data(db: Session, user_id: str, start_date: str, end_date: str) -> dict:
    """Get intensity heatmap for date range"""
    heatmap = {}

    current = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()

    while current <= end:
        date_str = current.strftime("%Y-%m-%d")
        progress = get_daily_progress(db, user_id, date_str)

        if progress["total"] > 0:
            intensity = progress["percent"] / 100.0
        else:
            intensity = 0.0

        heatmap[date_str] = intensity
        current += timedelta(days=1)

    return heatmap


def get_dashboard_stats(db: Session, user_id: str) -> dict:
    """Get aggregated stats for dashboard"""
    habits = db.query(Habit).filter(
        Habit.user_id == user_id,
        Habit.archived == False
    ).all()

    if not habits:
        return {
            "max_current_streak": 0,
            "max_longest_streak": 0,
            "avg_completion_rate": 0.0
        }

    streaks = [calculate_streaks(db, user_id, h.id) for h in habits]
    completion_rates = [calculate_completion_rate(db, user_id, h.id) for h in habits]

    max_current = max([s["current_streak"] for s in streaks])
    max_longest = max([s["longest_streak"] for s in streaks])
    avg_completion = round(sum(completion_rates) / len(completion_rates), 1)

    return {
        "max_current_streak": max_current,
        "max_longest_streak": max_longest,
        "avg_completion_rate": avg_completion
    }
