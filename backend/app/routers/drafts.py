from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
from .. import schemas, crud, models
from ..database import get_db
from ..auth import get_current_active_user

router = APIRouter(prefix="/drafts", tags=["drafts"])


@router.get("/", response_model=schemas.DraftResponse)
def get_my_draft(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Получение черновика текущего пользователя"""
    draft = crud.get_draft_by_user_id(db, current_user.id)
    if draft is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found"
        )
    
    draft_data = schemas.CalculatorAnswers.model_validate(
        json.loads(draft.draft_data)
    )
    
    return schemas.DraftResponse(
        id=draft.id,
        user_id=draft.user_id,
        draft_data=draft_data,
        updated_at=draft.updated_at
    )


@router.post("/", response_model=schemas.DraftResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_draft(
    draft: schemas.DraftCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Создание или обновление черновика"""
    db_draft = crud.create_or_update_draft(db, current_user.id, draft)
    
    draft_data = schemas.CalculatorAnswers.model_validate(
        json.loads(db_draft.draft_data)
    )
    
    return schemas.DraftResponse(
        id=db_draft.id,
        user_id=db_draft.user_id,
        draft_data=draft_data,
        updated_at=db_draft.updated_at
    )


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def delete_draft(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Удаление черновика текущего пользователя"""
    deleted = crud.delete_draft(db, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found"
        )
    return None
