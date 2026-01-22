from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import json


def get_moscow_time() -> datetime:
    """Получение текущего времени в московском часовом поясе (UTC+3)"""
    moscow_tz = timezone(timedelta(hours=3))
    return datetime.now(moscow_tz)

from . import models, schemas
from .utils.calculations import (
    calculate_mediterranean_diet_index,
    interpret_score,
)
from .auth import get_password_hash
from .services.gigachat import gigachat_service


# ======================
# User CRUD
# ======================

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise ValueError("User with this email already exists")

    hashed_password = (
        get_password_hash(user.password) if user.password else None
    )

    db_user = models.User(
        full_name=user.full_name,
        birth_date=user.birth_date,
        phone=user.phone,
        email=user.email,
        hashed_password=hashed_password,
        created_at=get_moscow_time(),
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(
    db: Session, user_id: int, user_update: schemas.UserUpdate
) -> Optional[models.User]:
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None

    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user


# ======================
# Calculations CRUD
# ======================

def create_calculation(
    db: Session,
    user_id: int,
    calculation: schemas.CalculationCreate,
) -> models.Calculation:
    """
    Создание расчёта.
    Используем GigaChat.
    Если он упал — fallback на локальный расчёт.
    """

    score: float
    interpretation: dict

    try:
        prompt = _build_gigachat_prompt(calculation.answers)
        gc_text = gigachat_service.analyze_diet(prompt)

        parsed = json.loads(gc_text)

        score = float(parsed["score"])
        interpretation = parsed["interpretation"]

        score = max(0, min(100, score))

        print("✓ GigaChat calculation success")

    except Exception as e:
        print("⚠ GigaChat failed, fallback used:", e)

        score = calculate_mediterranean_diet_index(calculation.answers)
        interpretation = interpret_score(score)

    db_calculation = models.Calculation(
        user_id=user_id,
        score=score,
        interpretation=json.dumps(interpretation, ensure_ascii=False),
        calculation_data=json.dumps(
            calculation.answers.model_dump(),
            ensure_ascii=False
        ),
        created_at=get_moscow_time(),
    )

    db.add(db_calculation)
    db.commit()
    db.refresh(db_calculation)
    return db_calculation


def _build_gigachat_prompt(answers: schemas.CalculatorAnswers) -> str:
    return f"""
Ты — профессиональный диетолог, эксперт по средиземноморской диете.

Данные пользователя за неделю:
- Овощи: {answers.vegetables} порций/неделю (норма: 35 порций/неделю)
- Фрукты: {answers.fruits} порций/неделю (норма: 35 порций/неделю)
- Бобовые: {answers.legumes} порций/неделю (норма: 3 порций/неделю)
- Злаки: {answers.cereals} порций/неделю (норма: 35 порций/неделю)
- Рыба: {answers.fish} порций/неделю (норма: 3 порций/неделю)
- Мясо: {answers.meat} порций/неделю (норма: менее 2 порций/неделю, меньше лучше)
- Молочные продукты: {answers.dairy} порций/неделю (норма: 14 порций/неделю)
- Алкоголь: {answers.alcohol} бокалов/неделю (норма: 14 бокалов/неделю)
- Оливковое масло: {answers.oliveOil} столовых ложек/неделю (норма: 28 ст.л./неделю)
- Орехи: {answers.nuts} порций/неделю (норма: 3 порций/неделю)

Верни СТРОГО JSON без markdown:

{{
  "score": число от 0 до 100,
  "interpretation": {{
    "level": "Отлично | Хорошо | Удовлетворительно | Требует улучшения",
    "description": "Краткое описание",
    "recommendations": [
      "Рекомендация 1",
      "Рекомендация 2",
      "Рекомендация 3",
      "Рекомендация 4",
      "Рекомендация 5"
    ]
  }}
}}
"""


def get_calculations_by_user_id(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
) -> List[models.Calculation]:
    return (
        db.query(models.Calculation)
        .filter(models.Calculation.user_id == user_id)
        .order_by(models.Calculation.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_calculation_by_id(
    db: Session, calculation_id: int
) -> Optional[models.Calculation]:
    return (
        db.query(models.Calculation)
        .filter(models.Calculation.id == calculation_id)
        .first()
    )


def get_user_statistics(
    db: Session, user_id: int
) -> schemas.UserStatistics:
    result = (
        db.query(
            func.count(models.Calculation.id),
            func.min(models.Calculation.created_at),
            func.max(models.Calculation.created_at),
            func.avg(models.Calculation.score),
        )
        .filter(models.Calculation.user_id == user_id)
        .first()
    )

    return schemas.UserStatistics(
        total_calculations=result[0] or 0,
        first_calculation=result[1],
        last_calculation=result[2],
        average_score=float(result[3]) if result[3] else None,
    )


# ======================
# Admin CRUD
# ======================

def get_all_users(
    db: Session, skip: int = 0, limit: int = 100
) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()


def get_all_calculations(
    db: Session, skip: int = 0, limit: int = 100
) -> List[models.Calculation]:
    return (
        db.query(models.Calculation)
        .order_by(models.Calculation.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ======================
# System Statistics
# ======================

# ======================
# Draft CRUD
# ======================

def get_draft_by_user_id(db: Session, user_id: int) -> Optional[models.Draft]:
    """Получение черновика пользователя"""
    return db.query(models.Draft).filter(models.Draft.user_id == user_id).first()


def create_or_update_draft(
    db: Session,
    user_id: int,
    draft: schemas.DraftCreate,
) -> models.Draft:
    """Создание или обновление черновика"""
    existing_draft = get_draft_by_user_id(db, user_id)
    
    if existing_draft:
        # Обновляем существующий черновик
        existing_draft.draft_data = json.dumps(
            draft.answers.model_dump(), ensure_ascii=False
        )
        existing_draft.updated_at = get_moscow_time()
        db.commit()
        db.refresh(existing_draft)
        return existing_draft
    else:
        # Создаем новый черновик
        db_draft = models.Draft(
            user_id=user_id,
            draft_data=json.dumps(
                draft.answers.model_dump(), ensure_ascii=False
            ),
            updated_at=get_moscow_time(),
        )
        db.add(db_draft)
        db.commit()
        db.refresh(db_draft)
        return db_draft


def delete_draft(db: Session, user_id: int) -> bool:
    """Удаление черновика пользователя"""
    draft = get_draft_by_user_id(db, user_id)
    if draft:
        db.delete(draft)
        db.commit()
        return True
    return False


# ======================
# System Statistics (Интеграция - Задание 7)
# ======================

def get_system_statistics(db: Session) -> schemas.SystemStatistics:
    total_users = db.query(func.count(models.User.id)).scalar() or 0

    active_users = (
        db.query(func.count(func.distinct(models.Calculation.user_id)))
        .scalar() or 0
    )

    total_calculations = (
        db.query(func.count(models.Calculation.id)).scalar() or 0
    )

    avg_score = db.query(func.avg(models.Calculation.score)).scalar()
    average_score = float(avg_score) if avg_score else None

    score_distribution = db.query(
        func.sum(case((models.Calculation.score >= 80, 1), else_=0)),
        func.sum(case(
            (and_(models.Calculation.score >= 60, models.Calculation.score < 80), 1),
            else_=0
        )),
        func.sum(case(
            (and_(models.Calculation.score >= 40, models.Calculation.score < 60), 1),
            else_=0
        )),
        func.sum(case((models.Calculation.score < 40, 1), else_=0)),
    ).first()

    distribution = schemas.ScoreDistribution(
        excellent=score_distribution[0] or 0,
        good=score_distribution[1] or 0,
        satisfactory=score_distribution[2] or 0,
        needs_improvement=score_distribution[3] or 0,
    )

    now = get_moscow_time()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    return schemas.SystemStatistics(
        total_users=total_users,
        active_users=active_users,
        total_calculations=total_calculations,
        average_score=average_score,
        score_distribution=distribution,
        calculations_today=db.query(models.Calculation)
            .filter(models.Calculation.created_at >= today)
            .count(),
        calculations_this_week=db.query(models.Calculation)
            .filter(models.Calculation.created_at >= today - timedelta(days=7))
            .count(),
        calculations_this_month=db.query(models.Calculation)
            .filter(models.Calculation.created_at >= today - timedelta(days=30))
            .count(),
        first_calculation_date=db.query(func.min(models.Calculation.created_at)).scalar(),
        last_calculation_date=db.query(func.max(models.Calculation.created_at)).scalar(),
    )
