from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import HabitCreate, HabitUpdate, HabitResponse
from ..services import habit_service
from ..utils.jwt_utils import decode_access_token
import json

router = APIRouter()
security = HTTPBearer()


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return payload.get("sub")


@router.get("/", response_model=list[HabitResponse])
def get_habits(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    habits = habit_service.get_user_habits(db, user_id, archived=False)

    return [
        {
            "id": h.id,
            "user_id": h.user_id,
            "name": h.name,
            "description": h.description,
            "category": h.category,
            "frequency": h.frequency,
            "specific_days": json.loads(h.specific_days) if h.specific_days else [],
            "target": h.target,
            "target_unit": h.target_unit,
            "created_at": h.created_at,
            "archived": h.archived,
            "color": h.color
        }
        for h in habits
    ]


@router.post("/", response_model=HabitResponse)
def create_habit(habit_data: HabitCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    habit = habit_service.create_habit(db, user_id, habit_data)

    return {
        "id": habit.id,
        "user_id": habit.user_id,
        "name": habit.name,
        "description": habit.description,
        "category": habit.category,
        "frequency": habit.frequency,
        "specific_days": json.loads(habit.specific_days) if habit.specific_days else [],
        "target": habit.target,
        "target_unit": habit.target_unit,
        "created_at": habit.created_at,
        "archived": habit.archived,
        "color": habit.color
    }


@router.get("/{habit_id}", response_model=HabitResponse)
def get_habit(habit_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    habit = habit_service.get_habit(db, user_id, habit_id)

    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    return {
        "id": habit.id,
        "user_id": habit.user_id,
        "name": habit.name,
        "description": habit.description,
        "category": habit.category,
        "frequency": habit.frequency,
        "specific_days": json.loads(habit.specific_days) if habit.specific_days else [],
        "target": habit.target,
        "target_unit": habit.target_unit,
        "created_at": habit.created_at,
        "archived": habit.archived,
        "color": habit.color
    }


@router.put("/{habit_id}", response_model=HabitResponse)
def update_habit(habit_id: str, habit_data: HabitUpdate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    habit = habit_service.update_habit(db, user_id, habit_id, habit_data)

    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    return {
        "id": habit.id,
        "user_id": habit.user_id,
        "name": habit.name,
        "description": habit.description,
        "category": habit.category,
        "frequency": habit.frequency,
        "specific_days": json.loads(habit.specific_days) if habit.specific_days else [],
        "target": habit.target,
        "target_unit": habit.target_unit,
        "created_at": habit.created_at,
        "archived": habit.archived,
        "color": habit.color
    }


@router.patch("/{habit_id}/archive")
def archive_habit(habit_id: str, archive: bool, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    habit = habit_service.archive_habit(db, user_id, habit_id, archive)

    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    return {"message": "Habit archived" if archive else "Habit unarchived"}


@router.delete("/{habit_id}")
def delete_habit(habit_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    success = habit_service.delete_habit(db, user_id, habit_id)

    if not success:
        raise HTTPException(status_code=404, detail="Habit not found")

    return {"message": "Habit deleted"}
