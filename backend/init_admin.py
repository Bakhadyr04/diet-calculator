"""
Скрипт для создания администратора
"""
import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app import models, crud, schemas
from app.auth import get_password_hash

# Создание таблиц
Base.metadata.create_all(bind=engine)

def create_admin(email: str, password: str, full_name: str = "Admin"):
    """Создание администратора"""
    db: Session = SessionLocal()
    try:
        # Проверка существования
        existing_user = crud.get_user_by_email(db, email)
        if existing_user:
            if existing_user.role == models.UserRole.ADMIN:
                print(f"Администратор с email {email} уже существует")
                return
            else:
                # Обновление роли
                existing_user.role = models.UserRole.ADMIN
                if password:
                    existing_user.hashed_password = get_password_hash(password)
                db.commit()
                print(f"Пользователь {email} теперь администратор")
                return
        
        # Создание нового администратора
        user_create = schemas.UserCreate(
            full_name=full_name,
            birth_date="2000-01-01",
            phone="+7 (999) 000-00-00",
            email=email,
            password=password
        )
        
        db_user = crud.create_user(db, user_create)
        db_user.role = models.UserRole.ADMIN
        db.commit()
        db.refresh(db_user)
        
        print(f"Администратор {email} успешно создан")
    except Exception as e:
        print(f"Ошибка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Использование: python init_admin.py <email> <password> [full_name]")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    full_name = sys.argv[3] if len(sys.argv) > 3 else "Admin"
    
    create_admin(email, password, full_name)
