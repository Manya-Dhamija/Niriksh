from fastapi import APIRouter

from ..data_sites import DEMO_SITES
from ..schemas import DemoSiteSummary

router = APIRouter(prefix="/api/sites", tags=["sites"])


@router.get("", response_model=list[DemoSiteSummary])
def list_sites():
    return [
        DemoSiteSummary(
            id=site_id,
            name=site["name"],
            state=site["state"],
            lat=site["lat"],
            lng=site["lng"],
            description=site["description"],
        )
        for site_id, site in DEMO_SITES.items()
    ]
