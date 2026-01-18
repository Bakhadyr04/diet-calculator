from app.database import SessionLocal
from app.models import User, UserRole
from app.auth import get_password_hash
from app.config import settings

def create_admin():
    db = SessionLocal()

    admin_email = settings.ADMIN_EMAIL
    admin_password = settings.ADMIN_PASSWORD

    if not admin_email or not admin_password:
        print("ADMIN_EMAIL or ADMIN_PASSWORD not set")
        return

    admin = db.query(User).filter(User.email == admin_email).first()
    if admin:
        print("Admin already exists")
        return

    admin = User(
        email=admin_email,
        full_name="Administrator",
        hashed_password=get_password_hash(admin_password),
        role=UserRole.ADMIN,
    )

    db.add(admin)
    db.commit()
    print("Admin created")

if __name__ == "__main__":
    create_admin()
