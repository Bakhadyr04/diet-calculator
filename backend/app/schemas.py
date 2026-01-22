from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


# User Schemas
class UserBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    birth_date: str
    phone: str
    email: EmailStr


class UserCreate(UserBase):
    password: Optional[str] = None  # Опционально для обратной совместимости


class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    birth_date: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: Optional[str] = None  # Опционально для обратной совместимости


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Calculation Schemas
# Все значения теперь в неделю
class CalculatorAnswers(BaseModel):
    vegetables: float = Field(..., ge=0, le=35)  # 5 порций/день * 7 дней = 35
    fruits: float = Field(..., ge=0, le=35)  # 5 порций/день * 7 дней = 35
    legumes: float = Field(..., ge=0, le=3)  # порций в неделю
    cereals: float = Field(..., ge=0, le=35)  # 5 порций/день * 7 дней = 35
    fish: float = Field(..., ge=0, le=3)  # порций в неделю
    meat: float = Field(..., ge=0, le=2)  # порций в неделю (меньше лучше)
    dairy: float = Field(..., ge=0, le=14)  # 2 порций/день * 7 дней = 14
    alcohol: float = Field(..., ge=0, le=14)  # 2 бокала/день * 7 дней = 14
    oliveOil: float = Field(..., ge=0, le=28)  # 4 ст.л./день * 7 дней = 28
    nuts: float = Field(..., ge=0, le=3)  # порций в неделю


class Interpretation(BaseModel):
    level: str
    description: str
    recommendations: List[str]


class CalculationCreate(BaseModel):
    answers: CalculatorAnswers


class CalculationResponse(BaseModel):
    id: int
    user_id: int
    score: float
    interpretation: Interpretation
    calculation_data: CalculatorAnswers
    created_at: datetime
    
    model_config = {"from_attributes": True}


# Statistics Schemas
class UserStatistics(BaseModel):
    total_calculations: int
    first_calculation: Optional[datetime] = None
    last_calculation: Optional[datetime] = None
    average_score: Optional[float] = None


# Result Schemas
class CalculationResult(BaseModel):
    score: float
    interpretation: Interpretation


# System Statistics Schemas (для интеграции - Задание 7)
class ScoreDistribution(BaseModel):
    """Распределение индексов по категориям"""
    excellent: int = 0  # 80-100
    good: int = 0  # 60-79
    satisfactory: int = 0  # 40-59
    needs_improvement: int = 0  # 0-39


class SystemStatistics(BaseModel):
    """Системная статистика использования приложения"""
    total_users: int
    active_users: int  # Пользователи с хотя бы одним расчетом
    total_calculations: int
    average_score: Optional[float] = None
    score_distribution: ScoreDistribution
    calculations_today: int
    calculations_this_week: int
    calculations_this_month: int
    first_calculation_date: Optional[datetime] = None
    last_calculation_date: Optional[datetime] = None


# Draft Schemas
class DraftCreate(BaseModel):
    answers: CalculatorAnswers


class DraftResponse(BaseModel):
    id: int
    user_id: int
    draft_data: CalculatorAnswers
    updated_at: datetime
    
    model_config = {"from_attributes": True}
