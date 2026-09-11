import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.db.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_source = Column(String(255), nullable=True)
    customer_name = Column(String(255), nullable=True)
    product_name = Column(String(255), nullable=True)
    product_strength_grade = Column(String(255), nullable=True)
    batch_lot_number = Column(String(255), nullable=True)
    manufacturing_date = Column(String(100), nullable=True)
    expiry_date = Column(String(100), nullable=True)
    quantity_affected = Column(String(100), nullable=True)
    complaint_type = Column(String(255), nullable=True)
    complaint_date = Column(String(100), nullable=True)
    detailed_description = Column(Text, nullable=True)
    initial_severity = Column(String(50), nullable=True) # Critical, Major, Minor
    priority = Column(String(50), nullable=True) # High, Medium, Low
    status = Column(String(50), default="Pending Triage") # Pending Triage, Triaged, Investigation Active, Closed
    risk_summary = Column(Text, nullable=True)
    suggested_capa = Column(Text, nullable=True)
    raw_intake_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "complaint_source": self.complaint_source,
            "customer_name": self.customer_name,
            "product_name": self.product_name,
            "product_strength_grade": self.product_strength_grade,
            "batch_lot_number": self.batch_lot_number,
            "manufacturing_date": self.manufacturing_date,
            "expiry_date": self.expiry_date,
            "quantity_affected": self.quantity_affected,
            "complaint_type": self.complaint_type,
            "complaint_date": self.complaint_date,
            "detailed_description": self.detailed_description,
            "initial_severity": self.initial_severity,
            "priority": self.priority,
            "status": self.status,
            "risk_summary": self.risk_summary,
            "suggested_capa": self.suggested_capa,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
