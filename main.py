from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, Date, TIMESTAMP, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os
from typing import Optional, List

app = FastAPI()

# Allow CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to database (defaults to XAMPP local mysql, configurable via Vercel env variables)
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost/tumekuja_certificates")

db_available = False
try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()

    class Student(Base):
        __tablename__ = "students"
        id = Column(Integer, primary_key=True, index=True)
        student_name = Column(String(255), nullable=False)
        course = Column(String(255), nullable=False)
        teacher_name = Column(String(255), nullable=False)
        photo = Column(Text, nullable=True)
        registration_date = Column(Date, nullable=False)
        created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
        updated_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    # Create table if it doesn't exist
    Base.metadata.create_all(bind=engine)
    db_available = True
except Exception as e:
    print("Database connection failed:", e)

class StudentCreate(BaseModel):
    student_name: str
    course: str
    teacher_name: str
    photo: Optional[str] = None

def get_db():
    if not db_available:
        raise HTTPException(status_code=500, detail="Database not configured or unavailable. Set DATABASE_URL properly.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/students")
def get_students(id: Optional[int] = None):
    db = next(get_db())
    if id is not None:
        student = db.query(Student).filter(Student.id == id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        return student
    else:
        students = db.query(Student).order_by(Student.created_at.desc()).all()
        return students

@app.post("/api/students")
def add_student(student: StudentCreate):
    db = next(get_db())
    new_student = Student(
        student_name=student.student_name,
        course=student.course,
        teacher_name=student.teacher_name,
        photo=student.photo,
        registration_date=datetime.date.today()
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return {"success": True, "id": new_student.id, "message": "Student added successfully"}

@app.put("/api/students")
def update_student(student: StudentCreate, id: int):
    db = next(get_db())
    db_student = db.query(Student).filter(Student.id == id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db_student.student_name = student.student_name
    db_student.course = student.course
    db_student.teacher_name = student.teacher_name
    if student.photo is not None:
        db_student.photo = student.photo
        
    db.commit()
    return {"success": True, "message": "Student updated successfully"}

@app.delete("/api/students")
def delete_student(id: int):
    db = next(get_db())
    db_student = db.query(Student).filter(Student.id == id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(db_student)
    db.commit()
    return {"success": True, "message": "Student deleted successfully"}
