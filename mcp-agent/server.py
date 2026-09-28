"""
Greenlugg Trip-Planning MCP Server

Exposes four read-only tools over real Supabase data: hotels, attractions,
experiences, and tour companies, each scoped to a destination. See
DESIGN.md for the reasoning behind the tool set and data model.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client
from mcp.server.mcpserver import MCPServer

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

mcp = MCPServer("greenlugg-trip-planner")


def resolve_destination(destination: str) -> dict | None:
    """Look up a destination by (partial, case-insensitive) name and return
    its id plus every region under it. Returns None if no match is found."""
    dest_res = (
        supabase.table("destinations")
        .select("id, name")
        .ilike("name", f"%{destination}%")
        .limit(1)
        .execute()
    )
    if not dest_res.data:
        return None
    dest = dest_res.data[0]

    regions_res = (
        supabase.table("regions")
        .select("id, name")
        .eq("destination_id", dest["id"])
        .execute()
    )
    regions = regions_res.data

    return {
        "destination_id": dest["id"],
        "destination_name": dest["name"],
        "region_ids": [r["id"] for r in regions],
        "regions": regions,
    }


@mcp.tool()
def get_hotels(destination: str) -> dict:
    """Get all hotels for a destination, grouped by region.

    Args:
        destination: Destination name (e.g. "Slovenia", "Bali"). Partial,
            case-insensitive match is fine.
    """
    resolved = resolve_destination(destination)
    if resolved is None:
        return {"error": f"No destination found matching '{destination}'"}
    if not resolved["region_ids"]:
        return {"destination": resolved["destination_name"], "hotels": []}

    res = (
        supabase.table("hotels")
        .select("id, name, region_id, description, image, price_min, price_max, pillars, certified")
        .in_("region_id", resolved["region_ids"])
        .execute()
    )
    return {
        "destination": resolved["destination_name"],
        "regions": resolved["regions"],
        "hotels": res.data,
    }


@mcp.tool()
def get_attractions(destination: str) -> dict:
    """Get all attractions for a destination, grouped by region. Each
    attraction has a `tier` of "must_visit" or "additional" — prioritize
    must_visit attractions when building a day-by-day plan.

    Args:
        destination: Destination name (e.g. "Slovenia", "Bali"). Partial,
            case-insensitive match is fine.
    """
    resolved = resolve_destination(destination)
    if resolved is None:
        return {"error": f"No destination found matching '{destination}'"}
    if not resolved["region_ids"]:
        return {"destination": resolved["destination_name"], "attractions": []}

    res = (
        supabase.table("attractions")
        .select("id, name, region_id, tier, description, duration, entry_fee")
        .in_("region_id", resolved["region_ids"])
        .execute()
    )
    return {
        "destination": resolved["destination_name"],
        "regions": resolved["regions"],
        "attractions": res.data,
    }


@mcp.tool()
def get_experiences(destination: str) -> dict:
    """Get all multi-day experiences (treks, add-on trips) for a destination,
    grouped by region. Each experience has a `days` count — if included in
    an itinerary, it occupies that many *consecutive* days as a single block,
    not separate unrelated days.

    Args:
        destination: Destination name (e.g. "Slovenia", "Bali"). Partial,
            case-insensitive match is fine.
    """
    resolved = resolve_destination(destination)
    if resolved is None:
        return {"error": f"No destination found matching '{destination}'"}
    if not resolved["region_ids"]:
        return {"destination": resolved["destination_name"], "experiences": []}

    res = (
        supabase.table("experiences")
        .select("id, title, region_id, description, days, suggest_tour")
        .in_("region_id", resolved["region_ids"])
        .execute()
    )
    return {
        "destination": resolved["destination_name"],
        "regions": resolved["regions"],
        "experiences": res.data,
    }


@mcp.tool()
def get_tours(destination: str) -> dict:
    """Get all tour companies available for a destination — both
    destination-wide companies and companies scoped to a specific region.

    Args:
        destination: Destination name (e.g. "Slovenia", "Bali"). Partial,
            case-insensitive match is fine.
    """
    resolved = resolve_destination(destination)
    if resolved is None:
        return {"error": f"No destination found matching '{destination}'"}

    destination_wide_res = (
        supabase.table("tour_companies")
        .select("id, name, description, url, region_id, destination_id")
        .eq("destination_id", resolved["destination_id"])
        .is_("region_id", "null")
        .execute()
    )

    region_scoped = []
    if resolved["region_ids"]:
        region_scoped_res = (
            supabase.table("tour_companies")
            .select("id, name, description, url, region_id, destination_id")
            .in_("region_id", resolved["region_ids"])
            .execute()
        )
        region_scoped = region_scoped_res.data

    return {
        "destination": resolved["destination_name"],
        "regions": resolved["regions"],
        "tours": destination_wide_res.data + region_scoped,
    }


if __name__ == "__main__":
    mcp.run()
