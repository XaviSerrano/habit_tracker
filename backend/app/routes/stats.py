from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import StreakInfo, DashboardStats, HeatmapData
from ..services import stats_service
from ..utils.jwt_utils import decode_access_token

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


@router.get("/habits/{habit_id}", response_model=StreakInfo)
def get_habit_stats(habit_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    streaks = stats_service.calculate_streaks(db, user_id, habit_id)
    completion_rate = stats_service.calculate_completion_rate(db, user_id, habit_id)

    return {
        "current_streak": streaks["current_streak"],
        "longest_streak": streaks["longest_streak"],
        "completion_rate": completion_rate
    }


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    stats = stats_service.get_dashboard_stats(db, user_id)

    return stats


@router.get("/heatmap", response_model=list[HeatmapData])
def get_heatmap(
    start_date: str = Query(...),
    end_date: str = Query(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    heatmap_data = stats_service.get_heatmap_data(db, user_id, start_date, end_date)

    return [
        {"date": date, "intensity": intensity}
        for date, intensity in sorted(heatmap_data.items())
    ]
