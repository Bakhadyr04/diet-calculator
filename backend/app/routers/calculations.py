from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from .. import schemas, crud, models
from ..database import get_db
from ..auth import get_current_active_user, get_current_admin

router = APIRouter(prefix="/calculations", tags=["calculations"])


@router.post("/", response_model=schemas.CalculationResult, status_code=status.HTTP_201_CREATED)
def create_calculation(
    calculation: schemas.CalculationCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Создание нового расчета"""
    db_calculation = crud.create_calculation(db, current_user.id, calculation)
    
    # Парсим интерпретацию из JSON
    interpretation = schemas.Interpretation.model_validate(
        json.loads(db_calculation.interpretation)
    )
    
    return schemas.CalculationResult(
        score=db_calculation.score,
        interpretation=interpretation
    )


@router.get("/", response_model=List[schemas.CalculationResponse])
def get_my_calculations(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получение истории расчетов текущего пользователя"""
    calculations = crud.get_calculations_by_user_id(db, current_user.id, skip=skip, limit=limit)
    
    result = []
    for calc in calculations:
        interpretation = schemas.Interpretation.model_validate(
            json.loads(calc.interpretation)
        )
        calculation_data = schemas.CalculatorAnswers.model_validate(
            json.loads(calc.calculation_data)
        )
        result.append(schemas.CalculationResponse(
            id=calc.id,
            user_id=calc.user_id,
            score=calc.score,
            interpretation=interpretation,
            calculation_data=calculation_data,
            created_at=calc.created_at
        ))
    
    return result


@router.get("/{calculation_id}", response_model=schemas.CalculationResponse)
def get_calculation(
    calculation_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получение расчета по ID"""
    db_calculation = crud.get_calculation_by_id(db, calculation_id)
    if db_calculation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calculation not found"
        )
    
    # Проверка прав доступа
    if db_calculation.user_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    interpretation = schemas.Interpretation.model_validate(
        json.loads(db_calculation.interpretation)
    )
    calculation_data = schemas.CalculatorAnswers.model_validate(
        json.loads(db_calculation.calculation_data)
    )
    
    return schemas.CalculationResponse(
        id=db_calculation.id,
        user_id=db_calculation.user_id,
        score=db_calculation.score,
        interpretation=interpretation,
        calculation_data=calculation_data,
        created_at=db_calculation.created_at
    )


@router.delete("/{calculation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_calculation(
    calculation_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Удаление расчета по ID"""
    db_calculation = crud.get_calculation_by_id(db, calculation_id)
    if db_calculation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calculation not found"
        )
    
    # Проверка прав доступа
    if db_calculation.user_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db.delete(db_calculation)
    db.commit()
    return None


# Admin endpoints
@router.get("/admin/all", response_model=List[schemas.CalculationResponse])
def get_all_calculations(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Получение всех расчетов (только для админов)"""
    calculations = crud.get_all_calculations(db, skip=skip, limit=limit)
    
    result = []
    for calc in calculations:
        interpretation = schemas.Interpretation.model_validate(
            json.loads(calc.interpretation)
        )
        calculation_data = schemas.CalculatorAnswers.model_validate(
            json.loads(calc.calculation_data)
        )
        result.append(schemas.CalculationResponse(
            id=calc.id,
            user_id=calc.user_id,
            score=calc.score,
            interpretation=interpretation,
            calculation_data=calculation_data,
            created_at=calc.created_at
        ))
    
    return result
