from pydantic import BaseModel, EmailStr
from typing import Optional, List


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    created_at: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    frequency: str
    specific_days: List[int]
    target: int
    target_unit: str
    color: str


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    frequency: Optional[str] = None
    specific_days: Optional[List[int]] = None
    target: Optional[int] = None
    target_unit: Optional[str] = None
    color: Optional[str] = None


class HabitResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    category: str
    frequency: str
    specific_days: List[int]
    target: int
    target_unit: str
    created_at: str
    archived: bool
    color: str

    class Config:
        from_attributes = True


class HabitLogCreate(BaseModel):
    habit_id: str
    date: str  # YYYY-MM-DD
    value: int
    note: Optional[str] = None


class HabitLogResponse(BaseModel):
    id: str
    habit_id: str
    date: str
    value: int
    note: Optional[str] = None
    timestamp: str

    class Config:
        from_attributes = True


class StreakInfo(BaseModel):
    current_streak: int
    longest_streak: int
    completion_rate: float


class DailyProgress(BaseModel):
    completed: int
    total: int
    percent: float


class DashboardStats(BaseModel):
    max_current_streak: int
    max_longest_streak: int
    avg_completion_rate: float


class HeatmapData(BaseModel):
    date: str
    intensity: float  # 0.0 to 1.0
