from __future__ import annotations

from datetime import date

from sqlalchemy.orm import Session

from .. import crud
from ..schemas import DashboardBucket, DashboardSummary


def build_dashboard_summary(db: Session) -> DashboardSummary:
    today = date.today()

    todays_interactions = crud.get_todays_interactions(db, today)
    pending_follow_ups = crud.get_pending_follow_ups(db, today)
    completed_visits = crud.get_completed_visits(db)
    recent_interactions = crud.get_recent_interactions(db, limit=5)
    total_interactions = crud.get_total_interactions(db)

    return DashboardSummary(
        total_interactions=total_interactions,
        todays_interactions=DashboardBucket(
            count=len(todays_interactions),
            items=todays_interactions,
        ),
        pending_follow_ups=DashboardBucket(
            count=len(pending_follow_ups),
            items=pending_follow_ups,
        ),
        completed_visits=DashboardBucket(
            count=len(completed_visits),
            items=completed_visits,
        ),
        recent_interactions=recent_interactions,
    )

