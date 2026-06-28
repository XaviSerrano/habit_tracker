from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import HabitLogCreate, HabitLogResponse
from ..services import log_service
from ..utils.jwt_utils import decode_access_token
from typing import Optional

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


@router.get("/", response_model=list[HabitLogResponse])
def get_logs(
    user_id: str = Depends(get_current_user_id),
    habit_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    if habit_id:
        logs = log_service.get_logs_by_habit(db, user_id, habit_id, start_date, end_date)
    else:
        logs = log_service.get_all_logs_in_range(db, user_id, start_date or "2000-01-01", end_date or "2099-12-31")

    return logs


@router.post("/", response_model=HabitLogResponse)
def create_log(log_data: HabitLogCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    log = log_service.create_or_update_log(db, user_id, log_data)

    if log is None:
        from fastapi.responses import Response
        return Response(status_code=204)

    return log


@router.get("/{habit_id}/{date}", response_model=HabitLogResponse)
def get_log(habit_id: str, date: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    log = log_service.get_log(db, user_id, habit_id, date)

    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    return log


@router.delete("/{log_id}")
def delete_log(log_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    success = log_service.delete_log(db, user_id, log_id)

    if not success:
        raise HTTPException(status_code=404, detail="Log not found")

    return {"message": "Log deleted"}
