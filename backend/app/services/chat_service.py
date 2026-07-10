from __future__ import annotations

import re
from datetime import date, datetime, timedelta
from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session

from .. import crud
from ..models import Interaction
from ..schemas import ChatRequest, ChatResponse, InteractionCreate, InteractionUpdate


KEY_ALIASES = {
    "doctor": "doctor_name",
    "hcp": "doctor_name",
    "hcp name": "doctor_name",
    "doctor name": "doctor_name",
    "hospital": "hospital",
    "specialization": "specialization",
    "speciality": "specialization",
    "specialty": "specialization",
    "visit date": "visit_date",
    "purpose": "purpose",
    "discussion": "discussion",
    "summary": "summary",
    "follow up date": "follow_up_date",
    "follow-up date": "follow_up_date",
    "status": "status",
}


def parse_context(context: str | None) -> dict[str, str]:
    if not context:
        return {}

    parsed: dict[str, str] = {}
    for raw_line in context.splitlines():
        line = raw_line.strip()
        if not line or ":" not in line:
            continue

        key, value = line.split(":", 1)
        normalized_key = KEY_ALIASES.get(key.strip().lower())
        if normalized_key:
            parsed[normalized_key] = value.strip()

    return parsed


def infer_intent(message: str) -> str:
    normalized = message.lower()
    if any(keyword in normalized for keyword in ["summarize", "summary", "short note"]):
        return "summarize"
    if any(keyword in normalized for keyword in ["follow up", "follow-up", "next step", "next action"]):
        return "follow_up"
    if any(keyword in normalized for keyword in ["log", "save", "create record", "record this", "add interaction"]):
        return "log_interaction"
    if any(keyword in normalized for keyword in ["update", "edit", "change", "correct"]):
        return "update_interaction"
    if any(keyword in normalized for keyword in ["extract", "fields", "missing"]):
        return "extract_fields"
    return "general_help"


def _clean_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _parse_explicit_date(value: str | None) -> date | None:
    if not value:
        return None

    cleaned = value.strip().lower()
    for pattern, formatter in (
        (r"^\d{4}-\d{2}-\d{2}$", date.fromisoformat),
        (
            r"^\d{1,2}/\d{1,2}/\d{2,4}$",
            lambda item: datetime.strptime(item, "%m/%d/%Y").date()
            if len(item.split("/")[-1]) == 4
            else datetime.strptime(item, "%m/%d/%y").date(),
        ),
        (
            r"^\d{1,2}-\d{1,2}-\d{2,4}$",
            lambda item: datetime.strptime(item, "%m-%d-%Y").date()
            if len(item.split("-")[-1]) == 4
            else datetime.strptime(item, "%m-%d-%y").date(),
        ),
    ):
        if re.match(pattern, cleaned):
            try:
                return formatter(cleaned)
            except ValueError:
                return None

    return None


def _weekday_delta(reference: date, target_weekday: int, *, allow_same_day: bool = False) -> int:
    delta = (target_weekday - reference.weekday()) % 7
    if delta == 0 and not allow_same_day:
        delta = 7
    return delta


def _extract_relative_date(text: str, reference: date, *, for_follow_up: bool = False) -> date | None:
    normalized = text.lower()

    if "today" in normalized:
        return reference
    if "tomorrow" in normalized:
        return reference + timedelta(days=1)
    if "yesterday" in normalized:
        return reference - timedelta(days=1)

    if for_follow_up and "next week" in normalized:
        return reference + timedelta(days=7)

    in_days = re.search(r"\bin\s+(\d+)\s+days?\b", normalized)
    if in_days:
        return reference + timedelta(days=int(in_days.group(1)))

    after_days = re.search(r"\bafter\s+(\d+)\s+days?\b", normalized)
    if after_days:
        return reference + timedelta(days=int(after_days.group(1)))

    in_weeks = re.search(r"\bin\s+(\d+)\s+weeks?\b", normalized)
    if in_weeks:
        return reference + timedelta(days=int(in_weeks.group(1)) * 7)

    after_weeks = re.search(r"\bafter\s+(\d+)\s+weeks?\b", normalized)
    if after_weeks:
        return reference + timedelta(days=int(after_weeks.group(1)) * 7)

    weekday_match = re.search(
        r"\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        normalized,
    )
    if weekday_match:
        target_weekday = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ].index(weekday_match.group(1))
        return reference + timedelta(days=_weekday_delta(reference, target_weekday))

    return None


def extract_visit_date(text: str | None, *, reference: date | None = None) -> date | None:
    if not text:
        return None

    reference = reference or date.today()
    explicit = _parse_explicit_date(text)
    if explicit:
        return explicit

    return _extract_relative_date(text, reference)


def extract_follow_up_date(text: str | None, *, reference: date | None = None) -> date | None:
    if not text:
        return None

    reference = reference or date.today()
    explicit = _parse_explicit_date(text)
    if explicit:
        return explicit

    normalized = text.lower()
    if "next week" in normalized:
        return reference + timedelta(days=7)

    in_days = re.search(r"\bin\s+(\d+)\s+days?\b", normalized)
    if in_days:
        return reference + timedelta(days=int(in_days.group(1)))

    after_days = re.search(r"\bafter\s+(\d+)\s+days?\b", normalized)
    if after_days:
        return reference + timedelta(days=int(after_days.group(1)))

    in_weeks = re.search(r"\bin\s+(\d+)\s+weeks?\b", normalized)
    if in_weeks:
        return reference + timedelta(days=int(in_weeks.group(1)) * 7)

    after_weeks = re.search(r"\bafter\s+(\d+)\s+weeks?\b", normalized)
    if after_weeks:
        return reference + timedelta(days=int(after_weeks.group(1)) * 7)

    weekday_match = re.search(
        r"\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        normalized,
    )
    if weekday_match:
        target_weekday = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ].index(weekday_match.group(1))
        return reference + timedelta(days=_weekday_delta(reference, target_weekday))

    if "tomorrow" in normalized:
        return reference + timedelta(days=1)
    if "today" in normalized:
        return reference

    return None


def extract_purpose(text: str) -> str | None:
    patterns = [
        r"\bdiscussed\s+([^.;!?]+?)(?:\s+(?:and|then)\b|[.;!?]|$)",
        r"\babout\s+([^.;!?]+?)(?:\s+(?:and|then)\b|[.;!?]|$)",
        r"\bregarding\s+([^.;!?]+?)(?:\s+(?:and|then)\b|[.;!?]|$)",
        r"\bfor\s+([^.;!?]+?)(?:\s+(?:and|then)\b|[.;!?]|$)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            purpose = _normalize_space(match.group(1))
            purpose = re.sub(r"^(the|a|an)\s+", "", purpose, flags=re.IGNORECASE)
            if purpose:
                return purpose

    return None


def extract_summary_text(text: str) -> str:
    summary = summarize_text(text)
    return summary if summary else text.strip()


def extract_doctor_name(text: str) -> str | None:
    patterns = [
        r"\b(?:Dr\.?|Doctor)\s+[A-Za-z][A-Za-z0-9'.-]*(?:\s+[A-Za-z][A-Za-z0-9'.-]*){0,2}(?=\s+(?:in|at|from|with|to|for|and|or|on|of|about|regarding|met|meet|visited|visit|discussed|talked|asked|requested|will|would|is|was|are|were|we|she|he|they|the|a|an)\b|[.,;:!?]|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            value = re.sub(r"(?i)^doctor\b", "Dr.", match.group(0))
            value = re.sub(r"(?i)^dr\.?", "Dr.", value)
            return _normalize_space(value.replace("Dr..", "Dr."))
    return None


FIELD_LABELS = {
    "doctor_name": ["hcp name", "doctor name", "doctor"],
    "hospital": ["hospital"],
    "specialization": ["specialization", "speciality", "specialty"],
    "visit_date": ["visit date"],
    "purpose": ["purpose"],
    "discussion": ["discussion"],
    "summary": ["summary"],
    "follow_up_date": ["follow up date", "follow-up date"],
    "status": ["status"],
}

FIELD_BOUNDARIES = {
    "doctor_name": r"\b(?:in|at|from|with|to|for|and|or|on|of|about|regarding|met|meet|visited|visit|discussed|talked|asked|requested|will|would|is|was|are|were|we|she|he|they|the|a|an)\b",
    "hospital": r"\b(?:and|to|for|about|with|where|while|discussed|regarding|met|meet|visited|visit|follow|follow-up|follow up)\b",
    "specialization": r"\b(?:today|yesterday|tomorrow|i|we|met|meet|visited|visit|discussed|discuss|talked|talk|asked|request|requested|hospital|doctor|dr\.?|dr|and|then|follow|follow-up)\b",
    "visit_date": r"\b(?:today|yesterday|tomorrow|i|we|met|meet|visited|visit|discussed|discuss|talked|talk|asked|request|requested|hospital|doctor|dr\.?|dr|and|then|follow|follow-up)\b",
    "purpose": r"\b(?:and|then|with|for|about|regarding|follow|follow-up|follow up|discussion|summary|status)\b",
    "discussion": r"\b(?:summary|follow|follow-up|follow up|status)\b",
    "summary": r"\b(?:follow|follow-up|follow up|status)\b",
    "follow_up_date": r"\b(?:today|yesterday|tomorrow|i|we|met|meet|visited|visit|discussed|discuss|talked|talk|asked|request|requested|hospital|doctor|dr\.?|dr|and|then|follow|follow-up|follow up)\b",
    "status": r"\b(?:and|then|for|with|in|at|from|about|regarding|follow|follow-up|follow up)\b",
}

FIELD_EDIT_PREFIXES = r"(?:edit|add|set|update|change)"


def _extract_instruction_value(text: str, field_name: str) -> str | None:
    labels = FIELD_LABELS.get(field_name, [])
    if not labels:
        return None

    boundary = FIELD_BOUNDARIES.get(field_name, r"$")
    label_pattern = "|".join(re.escape(label) for label in labels)
    patterns = [
        rf"\b{FIELD_EDIT_PREFIXES}\s+(?:{label_pattern})\s*(?:as|to|=|:)\s*(.+?)(?=\s+{boundary}|[.,;:!?]|$)",
        rf"\b(?:{label_pattern})\s*(?:is|as|to|=|:)\s*(.+?)(?=\s+{boundary}|[.,;:!?]|$)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if not match:
            continue
        value = _normalize_space(match.group(1))
        value = re.split(boundary, value, maxsplit=1, flags=re.IGNORECASE)[0]
        value = value.strip(" ,.;:")
        if value:
            return value

    return None


def extract_field_instruction(text: str, field_name: str) -> str | None:
    value = _extract_instruction_value(text, field_name)
    if not value:
        return None

    if field_name == "doctor_name":
        return extract_doctor_name(value) or _normalize_space(value)
    if field_name == "visit_date":
        visit_date = extract_visit_date(value)
        return visit_date.isoformat() if visit_date else value
    if field_name == "follow_up_date":
        follow_up_date = extract_follow_up_date(value)
        return follow_up_date.isoformat() if follow_up_date else value
    if field_name == "status":
        normalized = value.strip().title()
        return normalized if normalized in {"Pending", "Completed"} else value
    return _normalize_space(value)


def extract_field_instructions(text: str) -> dict[str, str]:
    extracted: dict[str, str] = {}
    for field_name in FIELD_LABELS:
        value = extract_field_instruction(text, field_name)
        if value:
            extracted[field_name] = value
    return extracted


def _strip_instruction_clauses(text: str) -> str:
    cleaned = text
    for field_name, labels in FIELD_LABELS.items():
        boundary = FIELD_BOUNDARIES.get(field_name, r"$")
        label_pattern = "|".join(re.escape(label) for label in labels)
        patterns = [
            rf"\b{FIELD_EDIT_PREFIXES}\s+(?:{label_pattern})\s*(?:as|to|=|:)\s*.+?(?=\s+{boundary}|[.,;:!?]|$)",
            rf"\b(?:{label_pattern})\s*(?:is|as|to|=|:)\s*.+?(?=\s+{boundary}|[.,;:!?]|$)",
        ]
        for pattern in patterns:
            cleaned = re.sub(pattern, " ", cleaned, flags=re.IGNORECASE)

    return _normalize_space(cleaned)


def extract_hospital(text: str) -> str | None:
    patterns = [
        r"\b(?:at|in|from)\s+([A-Za-z0-9&\-\s]+?)(?=\s+(?:and|to|for|about|with|where|while|discussed|regarding|met|meet|follow|follow-up)\b|[.,;!?]|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            hospital = match.group(1).strip()
            if hospital and len(hospital.split()) <= 6:
                return hospital
    return None


def extract_date(value: str | None) -> date | None:
    if not value:
        return None

    try:
        return date.fromisoformat(value.strip())
    except ValueError:
        return None


def _looks_like_interaction_note(text: str) -> bool:
    normalized = text.lower()
    signals = [
        "dr ",
        "doctor",
        "hospital",
        "met ",
        "meet ",
        "discuss",
        "follow up",
        "follow-up",
        "product",
        "visit",
    ]
    return any(signal in normalized for signal in signals)


def summarize_text(message: str) -> str:
    text = _clean_text(message) or ""
    if not text:
        return "No interaction details were provided."

    compact = re.sub(r"\s+", " ", text).strip()
    if len(compact) <= 220:
        return compact

    cutoff = compact.rfind(" ", 0, 220)
    if cutoff == -1:
        cutoff = 220
    return compact[:cutoff].rstrip() + "..."


def build_entities(message: str, context_fields: dict[str, str]) -> dict[str, Any]:
    entities: dict[str, Any] = {}
    explicit_instructions = extract_field_instructions(message)
    narrative_text = _strip_instruction_clauses(message)
    combined_text = " ".join(
        part for part in [narrative_text, context_fields.get("discussion"), context_fields.get("summary")] if part
    )
    is_interaction_note = _looks_like_interaction_note(combined_text)

    doctor_name = explicit_instructions.get("doctor_name") or context_fields.get("doctor_name")
    hospital = explicit_instructions.get("hospital") or context_fields.get("hospital")
    visit_date = extract_date(explicit_instructions.get("visit_date") or context_fields.get("visit_date"))
    follow_up_date = extract_date(
        explicit_instructions.get("follow_up_date") or context_fields.get("follow_up_date")
    )
    purpose = explicit_instructions.get("purpose") or context_fields.get("purpose")
    specialization = explicit_instructions.get("specialization") or context_fields.get("specialization")

    if is_interaction_note:
        doctor_name = doctor_name or extract_doctor_name(combined_text)
        hospital = hospital or extract_hospital(combined_text)
        visit_date = visit_date or extract_visit_date(combined_text)
        follow_up_date = follow_up_date or extract_follow_up_date(combined_text)
        purpose = purpose or extract_purpose(combined_text)

    if doctor_name:
        entities["doctor_name"] = doctor_name
    if hospital:
        entities["hospital"] = hospital
    if specialization:
        entities["specialization"] = specialization
    if visit_date:
        entities["visit_date"] = visit_date.isoformat()
    if purpose:
        entities["purpose"] = purpose
    if context_fields.get("discussion"):
        entities["discussion"] = context_fields["discussion"]
    elif is_interaction_note:
        entities["discussion"] = narrative_text or _clean_text(message) or ""

    if context_fields.get("summary"):
        entities["summary"] = context_fields["summary"]
    elif is_interaction_note:
        entities["summary"] = extract_summary_text(narrative_text or message)
    if follow_up_date:
        entities["follow_up_date"] = follow_up_date.isoformat()
    if explicit_instructions.get("status") or context_fields.get("status"):
        entities["status"] = explicit_instructions.get("status") or context_fields["status"]

    return entities


def build_reply(intent: str, entities: dict[str, Any], summary: str, saved: bool) -> str:
    doctor = entities.get("doctor_name", "the HCP")
    hospital = entities.get("hospital", "the hospital")

    if saved:
        follow_up = entities.get("follow_up_date")
        if follow_up:
            return (
                f"Interaction logged successfully for {doctor} at {hospital}. "
                f"I also saved the follow-up date for {follow_up}."
            )
        return f"Interaction logged successfully for {doctor} at {hospital}."

    if intent == "summarize":
        return f"Here is a concise summary: {summary}"
    if intent == "follow_up":
        return "I can help draft a follow-up note, but I need the doctor name, hospital, and visit date to save it."
    if intent == "extract_fields":
        return "I extracted the available fields and filled the draft. Review any missing values and save when ready."
    if intent == "update_interaction":
        return "I can update the interaction once you share the corrected details."
    if entities and intent in {"general_help", "extract_fields", "log_interaction"}:
        return "I extracted the available fields and filled the draft. Review and save when ready."
    return "I understood your note. Add any missing structured fields and I can save it to the CRM."


def _required_fields_present(entities: dict[str, Any]) -> bool:
    required = ["doctor_name", "hospital", "visit_date", "purpose"]
    return all(entities.get(field) for field in required)


def _interaction_payload_from_entities(
    message: str,
    context_fields: dict[str, str],
    entities: dict[str, Any],
) -> InteractionCreate:
    discussion = _clean_text(context_fields.get("discussion")) or _clean_text(message) or ""
    summary = _clean_text(context_fields.get("summary")) or extract_summary_text(message)
    status = context_fields.get("status") or "Pending"

    visit_date = (
        extract_date(context_fields.get("visit_date"))
        or extract_visit_date(message)
        or date.today()
    )
    follow_up_date = extract_date(context_fields.get("follow_up_date")) or extract_follow_up_date(message)

    doctor_name = _clean_text(context_fields.get("doctor_name") or entities.get("doctor_name")) or "Unknown HCP"
    hospital = _clean_text(context_fields.get("hospital") or entities.get("hospital")) or "Unknown Hospital"
    purpose = (
        _clean_text(context_fields.get("purpose"))
        or _clean_text(entities.get("purpose"))
        or "Interaction logged via chat"
    )
    specialization = _clean_text(context_fields.get("specialization") or entities.get("specialization"))

    return InteractionCreate(
        doctor_name=doctor_name,
        hospital=hospital,
        specialization=specialization,
        visit_date=visit_date,
        purpose=purpose,
        discussion=discussion,
        summary=summary,
        follow_up_date=follow_up_date,
        status=status if status in {"Pending", "Completed"} else "Pending",
    )


def process_chat_message(db: Session, payload: ChatRequest) -> ChatResponse:
    intent = infer_intent(payload.message)
    context_fields = parse_context(payload.context)
    entities = build_entities(payload.message, context_fields)
    summary = extract_summary_text(payload.message)
    tool = "local_rules_engine"
    saved_interaction: Interaction | None = None

    if payload.interaction_id is not None:
        try:
            existing_interaction = crud.get_interaction(db, payload.interaction_id)
        except HTTPException:
            existing_interaction = None
        if existing_interaction is not None:
            update_data = InteractionUpdate(
                doctor_name=_clean_text(context_fields.get("doctor_name")) or existing_interaction.doctor_name,
                hospital=_clean_text(context_fields.get("hospital")) or existing_interaction.hospital,
                specialization=_clean_text(context_fields.get("specialization")) or existing_interaction.specialization,
                visit_date=extract_date(context_fields.get("visit_date")) or existing_interaction.visit_date,
                purpose=_clean_text(context_fields.get("purpose")) or existing_interaction.purpose,
                discussion=_clean_text(context_fields.get("discussion")) or existing_interaction.discussion,
                summary=_clean_text(context_fields.get("summary")) or summarize_text(payload.message),
                follow_up_date=extract_date(context_fields.get("follow_up_date")) or existing_interaction.follow_up_date,
                status=(context_fields.get("status") or existing_interaction.status),
            )
            saved_interaction = crud.update_interaction(db, existing_interaction.id, update_data)
            tool = "database.update"

    if saved_interaction is None and intent in {"log_interaction", "update_interaction"} and _required_fields_present(entities):
        create_payload = _interaction_payload_from_entities(payload.message, context_fields, entities)
        saved_interaction = crud.create_interaction(db, create_payload)
        tool = "database.create"

    reply = build_reply(intent, entities, summary, saved_interaction is not None)
    return ChatResponse(
        reply=reply,
        intent=intent,
        tool=tool,
        entities=entities or None,
        summary=summary,
        interaction=saved_interaction,
    )
