from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import json
from . import models, schemas
from .utils.calculations import calculate_mediterranean_diet_index, interpret_score
from .auth import get_password_hash


# User CRUD
def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Получение пользователя по email"""
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """Получение пользователя по ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Создание нового пользователя"""
    # Проверка существования пользователя
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise ValueError("User with this email already exists")
    
    hashed_password = None
    if user.password:
        hashed_password = get_password_hash(user.password)
    
    db_user = models.User(
        full_name=user.full_name,
        birth_date=user.birth_date,
        phone=user.phone,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
    """Обновление пользователя"""
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user


# Calculation CRUD
def create_calculation(
    db: Session,
    user_id: int,
    calculation: schemas.CalculationCreate
) -> models.Calculation:
    """Создание нового расчета"""
    # Расчет индекса
    score = calculate_mediterranean_diet_index(calculation.answers)
    interpretation = interpret_score(score)
    
    db_calculation = models.Calculation(
        user_id=user_id,
        score=score,
        interpretation=json.dumps(interpretation, ensure_ascii=False),
        calculation_data=json.dumps(calculation.answers.model_dump(), ensure_ascii=False)
    )
    db.add(db_calculation)
    db.commit()
    db.refresh(db_calculation)
    return db_calculation


def get_calculations_by_user_id(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[models.Calculation]:
    """Получение расчетов пользователя"""
    return db.query(models.Calculation)\
        .filter(models.Calculation.user_id == user_id)\
        .order_by(models.Calculation.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()


def get_calculation_by_id(db: Session, calculation_id: int) -> Optional[models.Calculation]:
    """Получение расчета по ID"""
    return db.query(models.Calculation).filter(models.Calculation.id == calculation_id).first()


def get_user_statistics(db: Session, user_id: int) -> schemas.UserStatistics:
    """Получение статистики пользователя"""
    result = db.query(
        func.count(models.Calculation.id).label('total_calculations'),
        func.min(models.Calculation.created_at).label('first_calculation'),
        func.max(models.Calculation.created_at).label('last_calculation'),
        func.avg(models.Calculation.score).label('average_score')
    ).filter(models.Calculation.user_id == user_id).first()
    
    return schemas.UserStatistics(
        total_calculations=result.total_calculations or 0,
        first_calculation=result.first_calculation,
        last_calculation=result.last_calculation,
        average_score=float(result.average_score) if result.average_score else None
    )


# Admin CRUD
def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """Получение всех пользователей (только для админов)"""
    return db.query(models.User).offset(skip).limit(limit).all()


def get_all_calculations(db: Session, skip: int = 0, limit: int = 100) -> List[models.Calculation]:
    """Получение всех расчетов (только для админов)"""
    return db.query(models.Calculation)\
        .order_by(models.Calculation.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
