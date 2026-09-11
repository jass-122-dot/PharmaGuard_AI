import os
import json
import re
from typing import Dict, Any, Optional

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

DEFAULT_MODEL = "gemma2-9b-it"
ADVANCED_MODEL = "llama-3.3-70b-versatile"

def get_groq_client(api_key: Optional[str] = None) -> Optional[Any]:
    key = api_key or os.getenv("GROQ_API_KEY")
    if GROQ_AVAILABLE and key:
        try:
            return Groq(api_key=key)
        except Exception as e:
            print(f"Error initializing Groq client: {e}")
    return None

def extract_pharma_complaint_llm(text: str, api_key: Optional[str] = None) -> Dict[str, Any]:
    client = get_groq_client(api_key)
    
    if client:
        system_prompt = """
You are an expert Quality Assurance (QA) Manager in Pharmaceutical Manufacturing (API and FDF).
Your task is to analyze the customer complaint text or email and extract key fields into strict JSON format.

JSON Schema required:
{
    "complaint_source": "String (e.g., Hospital, Distributor, Pharmacy, Patient, Direct Customer, FDA/Regulatory)",
    "customer_name": "String (e.g., Apex Pharmaceuticals, Metro Hospital, Dr. Jane Smith)",
    "product_name": "String (e.g., Paracetamol API, Amoxicillin 500mg Capsules, Metformin HCl Tablets)",
    "product_strength_grade": "String (e.g., USP/EP Grade, 500 mg, Micronized Grade 99.8%)",
    "batch_lot_number": "String (e.g., LOT-2026-X89, BATCH-99412)",
    "manufacturing_date": "String YYYY-MM-DD or MM/YYYY",
    "expiry_date": "String YYYY-MM-DD or MM/YYYY",
    "quantity_affected": "String (e.g., 500 kg, 1200 blister packs, 50 vials)",
    "complaint_type": "String (e.g., Chemical Assay Out of Specification, Tablet Discoloration, Packaging Seal Breach, Foreign Particulate Contamination, Labeling Misprint)",
    "complaint_date": "String YYYY-MM-DD",
    "detailed_description": "String (Full summary of the issue reported)",
    "initial_severity": "Critical | Major | Minor",
    "priority": "High | Medium | Low",
    "risk_summary": "String (GMP Quality Risk Management assessment based on ICH Q9)",
    "suggested_capa": "String (Recommended initial RCA/CAPA actions for QA investigation)"
}

Rules for Severity:
- Critical: Life-threatening, sterility failure, contamination, wrong drug/potency, regulatory alert.
- Major: Out of specification physical/chemical test without immediate safety threat, packaging defect affecting stability, missing batch info.
- Minor: Cosmetic packaging issue, minor outer box damage, non-critical labeling typo.

Return ONLY valid JSON. No preamble or markdown codeblocks outside JSON.
"""
        try:
            response = client.chat.completions.create(
                model=DEFAULT_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            raw_json = response.choices[0].message.content
            return json.loads(raw_json)
        except Exception as e:
            print(f"Groq API call failed: {e}. Falling back to rule-based parser.")

    # Rule-based fallback extractor tailored for Pharma QA
    return fallback_extract_pharma_complaint(text)

def fallback_extract_pharma_complaint(text: str) -> Dict[str, Any]:
    lines = text.splitlines()
    
    # 1. Complaint Source
    source = "Customer Email / Direct"
    if re.search(r"hospital|clinic|medical center", text, re.I):
        source = "Hospital / Clinical Pharmacy"
    elif re.search(r"distributor|wholesaler|logistics", text, re.I):
        source = "Pharmaceutical Distributor"
    elif re.search(r"fda|health canada|ema|regulatory", text, re.I):
        source = "Regulatory Agency"
    elif re.search(r"pharmacy|retailer", text, re.I):
        source = "Retail Pharmacy"

    # 2. Customer Name
    customer = "Apex Healthcare Services"
    cust_match = re.search(r"(?:from|customer|client|hospital|company):\s*([A-Za-z0-9\s,\.\-]+)", text, re.I)
    if cust_match:
        customer = cust_match.group(1).strip()
    else:
        email_match = re.search(r"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})", text)
        if email_match:
            customer = email_match.group(1)

    # 3. Product Name & Strength/Grade
    product = "Amoxicillin Trihydrate API"
    strength = "USP / Micronized Grade"
    if re.search(r"paracetamol|acetaminophen", text, re.I):
        product = "Paracetamol (Acetaminophen) API"
        strength = "Ph. Eur. / IP Grade 99.5%"
    elif re.search(r"amoxicillin", text, re.I):
        product = "Amoxicillin Trihydrate 500mg Capsules"
        strength = "500 mg (FDF)"
    elif re.search(r"metformin", text, re.I):
        product = "Metformin HCl 850mg Extended Release Tablets"
        strength = "850 mg USP"
    elif re.search(r"ciprofloxacin", text, re.I):
        product = "Ciprofloxacin HCl 500mg Tablets"
        strength = "500 mg EP"
    elif re.search(r"insulin|injectable|vial", text, re.I):
        product = "Sterile Biopharmaceutical Injection Vials"
        strength = "100 IU/mL Sterile"
    else:
        prod_match = re.search(r"(?:product|drug|item|material):\s*([A-Za-z0-9\s\-]+)", text, re.I)
        if prod_match:
            product = prod_match.group(1).strip()

    # 4. Batch/Lot Number
    batch = "BATCH-2026-X891"
    batch_match = re.search(r"(?:batch|lot|control)\s*(?:no|number|#)?[:\.\s]*([A-Za-z0-9\-]+)", text, re.I)
    if batch_match:
        batch = batch_match.group(1).strip()

    # 5. Dates
    mfg_date = "2026-01-15"
    exp_date = "2028-01-14"
    complaint_date = "2026-09-08"

    mfg_match = re.search(r"(?:mfg|manufactur\w*|mfd)\s*(?:date)?[:\.\s]*(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}|\d{2}/\d{4})", text, re.I)
    if mfg_match:
        mfg_date = mfg_match.group(1)

    exp_match = re.search(r"(?:exp|expir\w*)\s*(?:date)?[:\.\s]*(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}|\d{2}/\d{4})", text, re.I)
    if exp_match:
        exp_date = exp_match.group(1)

    # 6. Quantity Affected
    qty = "250 kg"
    qty_match = re.search(r"(\d+(?:\,\d+)?\s*(?:kg|g|lbs|blisters|packs|tablets|vials|boxes|units|drums))", text, re.I)
    if qty_match:
        qty = qty_match.group(1)

    # 7. Complaint Type & Risk Severity
    complaint_type = "Chemical Assay Out of Specification (OOS)"
    severity = "Major"
    priority = "Medium"

    if re.search(r"contam|foreign|glass|particulate|black spot|hair|metal", text, re.I):
        complaint_type = "Foreign Particulate Contamination"
        severity = "Critical"
        priority = "High"
    elif re.search(r"discolor|colour|color|spotted|yellowing", text, re.I):
        complaint_type = "Tablet/Powder Physical Discoloration"
        severity = "Major"
        priority = "High"
    elif re.search(r"dissolution|assay|purity|potency|impurity|oos|out of spec", text, re.I):
        complaint_type = "Chemical Assay / Dissolution OOS"
        severity = "Critical" if "dissolution" in text.lower() or "potency" in text.lower() else "Major"
        priority = "High"
    elif re.search(r"seal|leak|broken|torn|damaged drum|moisture", text, re.I):
        complaint_type = "Container Packaging & Seal Integrity Failure"
        severity = "Major"
        priority = "Medium"
    elif re.search(r"label|misprint|barcode|exp date wrong", text, re.I):
        complaint_type = "Packaging Labeling Misprint"
        severity = "Minor"
        priority = "Low"

    # Risk summary & CAPA
    risk_summary = f"Evaluated under ICH Q9 Quality Risk Management principles. The reported defect ({complaint_type}) presents a {severity.upper()} quality risk. Potential impact on product safety, potency, and compliance with GMP standards."
    suggested_capa = "1. Quarantining impacted batch in warehouse inventory.\n2. Retrieving retaining samples for immediate re-testing (Assay, Related Substances, Microbial Limits).\n3. Initiating formal QA Deviation & RCA (5-Why analysis).\n4. Performing environmental monitoring review of production line."

    return {
        "complaint_source": source,
        "customer_name": customer,
        "product_name": product,
        "product_strength_grade": strength,
        "batch_lot_number": batch,
        "manufacturing_date": mfg_date,
        "expiry_date": exp_date,
        "quantity_affected": qty,
        "complaint_type": complaint_type,
        "complaint_date": complaint_date,
        "detailed_description": text.strip() if len(text.strip()) > 10 else "Customer reported quality concern regarding batch compliance during QA inspection.",
        "initial_severity": severity,
        "priority": priority,
        "risk_summary": risk_summary,
        "suggested_capa": suggested_capa
    }

def answer_complaint_chat_llm(text: str, complaint_data: Dict[str, Any], chat_history: list, api_key: Optional[str] = None) -> str:
    client = get_groq_client(api_key)
    
    context_str = json.dumps(complaint_data, indent=2)
    system_prompt = f"""
You are an expert AI Quality Assurance Specialist in Pharmaceutical API & FDF Manufacturing.
You are assisting a QA Manager in reviewing a customer complaint.

Current Complaint Context Data:
{context_str}

Respond concisely, accurately, and professionally according to cGMP (21 CFR Part 211, EU GMP) standards.
"""
    if client:
        try:
            messages = [{"role": "system", "content": system_prompt}]
            for msg in chat_history[-6:]:
                messages.append({"role": msg["role"], "content": msg["content"]})
            messages.append({"role": "user", "content": text})

            response = client.chat.completions.create(
                model=DEFAULT_MODEL,
                messages=messages,
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Groq chat call failed: {e}")

    # Fallback response engine
    q_lower = text.lower()
    if "batch" in q_lower or "lot" in q_lower:
        return f"The batch number for this complaint is **{complaint_data.get('batch_lot_number', 'N/A')}**, with manufacturing date {complaint_data.get('manufacturing_date', 'N/A')} and expiry date {complaint_data.get('expiry_date', 'N/A')}."
    elif "severity" in q_lower or "risk" in q_lower or "priority" in q_lower:
        return f"This complaint has been triaged with **{complaint_data.get('initial_severity', 'Major')} Severity** and **{complaint_data.get('priority', 'Medium')} Priority**. Risk Summary: {complaint_data.get('risk_summary', 'Pending complete evaluation.')}"
    elif "capa" in q_lower or "action" in q_lower or "rca" in q_lower:
        return f"Recommended Initial Actions:\n{complaint_data.get('suggested_capa', 'Issue immediate batch quarantine and inspect retain samples.')}"
    elif "product" in q_lower or "customer" in q_lower:
        return f"Product: **{complaint_data.get('product_name', 'N/A')}** ({complaint_data.get('product_strength_grade', 'N/A')}), Customer: **{complaint_data.get('customer_name', 'N/A')}**."
    else:
        return f"Based on the logged complaint details for **{complaint_data.get('product_name', 'the product')}** (Batch {complaint_data.get('batch_lot_number', 'N/A')}), QA recommends following standard operating procedures (SOP-QMS-042) for complaint investigation, sample retrieval, and reporting to Quality Management."
