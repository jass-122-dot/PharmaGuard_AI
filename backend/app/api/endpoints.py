import os
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db, Base, engine
from app.models.complaint import Complaint
from app.agents.graph import run_intake_pipeline
from app.agents.groq_client import answer_complaint_chat_llm

# Initialize DB tables automatically
Base.metadata.create_all(bind=engine)

router = APIRouter()

class TextIntakeRequest(BaseModel):
    text: str
    api_key: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    complaint_data: dict
    chat_history: Optional[List[dict]] = []
    api_key: Optional[str] = None

class SaveComplaintRequest(BaseModel):
    complaint_source: Optional[str] = ""
    customer_name: Optional[str] = ""
    product_name: Optional[str] = ""
    product_strength_grade: Optional[str] = ""
    batch_lot_number: Optional[str] = ""
    manufacturing_date: Optional[str] = ""
    expiry_date: Optional[str] = ""
    quantity_affected: Optional[str] = ""
    complaint_type: Optional[str] = ""
    complaint_date: Optional[str] = ""
    detailed_description: Optional[str] = ""
    initial_severity: Optional[str] = "Major"
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Pending Triage"
    risk_summary: Optional[str] = ""
    suggested_capa: Optional[str] = ""
    raw_intake_text: Optional[str] = ""

@router.post("/intake/text")
async def extract_from_text(req: TextIntakeRequest, x_groq_api_key: Optional[str] = Header(None)):
    api_key = req.api_key or x_groq_api_key or os.getenv("GROQ_API_KEY")
    result = run_intake_pipeline(raw_text=req.text, api_key=api_key)
    return {
        "success": True,
        "progress": result.get("progress", 100),
        "current_step": result.get("current_step", "Completed"),
        "data": result.get("extracted_data", {})
    }

@router.post("/intake/upload")
async def extract_from_file(
    file: UploadFile = File(...),
    x_groq_api_key: Optional[str] = Header(None)
):
    contents = await file.read()
    filename = file.filename
    api_key = x_groq_api_key or os.getenv("GROQ_API_KEY")
    
    result = run_intake_pipeline(file_bytes=contents, filename=filename, api_key=api_key)
    return {
        "success": True,
        "filename": filename,
        "progress": result.get("progress", 100),
        "current_step": result.get("current_step", "Completed"),
        "data": result.get("extracted_data", {})
    }

@router.post("/intake/chat")
async def chat_with_assistant(req: ChatRequest, x_groq_api_key: Optional[str] = Header(None)):
    api_key = req.api_key or x_groq_api_key or os.getenv("GROQ_API_KEY")
    reply = answer_complaint_chat_llm(
        text=req.message,
        complaint_data=req.complaint_data,
        chat_history=req.chat_history or [],
        api_key=api_key
    )
    return {
        "success": True,
        "reply": reply
    }

@router.post("/complaints")
async def save_complaint(req: SaveComplaintRequest, db: Session = Depends(get_db)):
    complaint = Complaint(
        complaint_source=req.complaint_source,
        customer_name=req.customer_name,
        product_name=req.product_name,
        product_strength_grade=req.product_strength_grade,
        batch_lot_number=req.batch_lot_number,
        manufacturing_date=req.manufacturing_date,
        expiry_date=req.expiry_date,
        quantity_affected=req.quantity_affected,
        complaint_type=req.complaint_type,
        complaint_date=req.complaint_date,
        detailed_description=req.detailed_description,
        initial_severity=req.initial_severity,
        priority=req.priority,
        status=req.status or "Pending Triage",
        risk_summary=req.risk_summary,
        suggested_capa=req.suggested_capa,
        raw_intake_text=req.raw_intake_text
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return {
        "success": True,
        "message": "Complaint logged successfully in QMS Database",
        "complaint": complaint.to_dict()
    }

@router.get("/complaints")
async def list_complaints(db: Session = Depends(get_db)):
    complaints = db.query(Complaint).order_by(Complaint.id.desc()).all()
    return {
        "success": True,
        "count": len(complaints),
        "complaints": [c.to_dict() for c in complaints]
    }

@router.get("/complaints/{complaint_id}")
async def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint record not found")
    return {
        "success": True,
        "complaint": complaint.to_dict()
    }

@router.delete("/complaints/{complaint_id}")
async def delete_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint record not found")
    db.delete(complaint)
    db.commit()
    return {"success": True, "message": f"Complaint #{complaint_id} removed"}
