import os
import io
from typing import Dict, Any, TypedDict, List
from langgraph.graph import StateGraph, END
from app.agents.groq_client import extract_pharma_complaint_llm, answer_complaint_chat_llm

class IntakeState(TypedDict):
    raw_text: str
    file_bytes: bytes
    filename: str
    file_type: str
    api_key: str
    extracted_data: Dict[str, Any]
    progress: int
    current_step: str

# 1. Document parsing node
def parse_intake_node(state: IntakeState) -> Dict[str, Any]:
    text = state.get("raw_text", "")
    filename = state.get("filename", "")
    file_bytes = state.get("file_bytes", None)

    if file_bytes:
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext == "pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                extracted_pages = [page.extract_text() for page in reader.pages if page.extract_text()]
                text = "\n".join(extracted_pages)
            except Exception as e:
                text += f"\n[PDF Extraction note: {str(e)}]"
        elif ext in ["docx", "doc"]:
            try:
                import docx
                doc = docx.Document(io.BytesIO(file_bytes))
                text = "\n".join([p.text for p in doc.paragraphs])
            except Exception as e:
                text += f"\n[DOCX Extraction note: {str(e)}]"
        elif ext in ["txt", "eml", "log"]:
            try:
                text = file_bytes.decode("utf-8", errors="ignore")
            except Exception as e:
                text += f"\n[TXT Extraction note: {str(e)}]"

    return {
        "raw_text": text,
        "progress": 30,
        "current_step": "Document Parsed Successfully"
    }

# 2. Entity Extraction node
def extract_entities_node(state: IntakeState) -> Dict[str, Any]:
    raw_text = state.get("raw_text", "")
    api_key = state.get("api_key", None)
    
    extracted = extract_pharma_complaint_llm(raw_text, api_key=api_key)
    
    return {
        "extracted_data": extracted,
        "progress": 70,
        "current_step": "Pharma Entities & Metadata Extracted"
    }

# 3. Quality Risk Assessment node
def risk_assessment_node(state: IntakeState) -> Dict[str, Any]:
    data = state.get("extracted_data", {})
    
    # Guarantee mandatory fields
    if not data.get("initial_severity"):
        data["initial_severity"] = "Major"
    if not data.get("priority"):
        data["priority"] = "Medium"
        
    return {
        "extracted_data": data,
        "progress": 100,
        "current_step": "QA Risk Matrix & Triage Completed"
    }

# Construct LangGraph State Graph
def build_intake_graph():
    workflow = StateGraph(IntakeState)

    workflow.add_node("parse_intake", parse_intake_node)
    workflow.add_node("extract_entities", extract_entities_node)
    workflow.add_node("risk_assessment", risk_assessment_node)

    workflow.set_entry_point("parse_intake")
    workflow.add_edge("parse_intake", "extract_entities")
    workflow.add_edge("extract_entities", "risk_assessment")
    workflow.add_edge("risk_assessment", END)

    return workflow.compile()

# Instantiated graph runner
intake_agent = build_intake_graph()

def run_intake_pipeline(raw_text: str = "", file_bytes: bytes = None, filename: str = "", api_key: str = None) -> Dict[str, Any]:
    initial_state = {
        "raw_text": raw_text,
        "file_bytes": file_bytes,
        "filename": filename,
        "file_type": filename.split(".")[-1] if "." in filename else "txt",
        "api_key": api_key,
        "extracted_data": {},
        "progress": 10,
        "current_step": "Analyzing document content and extracting key details..."
    }
    
    final_state = intake_agent.invoke(initial_state)
    return final_state
