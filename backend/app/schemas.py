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
class CalculatorAnswers(BaseModel):
    vegetables: float = Field(..., ge=0, le=5)
    fruits: float = Field(..., ge=0, le=5)
    legumes: float = Field(..., ge=0, le=3)
    cereals: float = Field(..., ge=0, le=5)
    fish: float = Field(..., ge=0, le=3)
    meat: float = Field(..., ge=0, le=2)
    dairy: float = Field(..., ge=0, le=2)
    alcohol: float = Field(..., ge=0, le=2)
    oliveOil: float = Field(..., ge=0, le=4)
    nuts: float = Field(..., ge=0, le=3)


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
