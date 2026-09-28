"""Phase 3: single-call itinerary composer.

Revised from the original "agent decides which tools to call" plan
(DESIGN.md Decision 1) after a real budget constraint (~$5 total OpenAI
credit): Python calls all four MCP tools directly and deterministically
(free, no GPT involved), then exactly ONE gpt-4o-mini call composes the
day-by-day itinerary from the combined results. GPT still does the one
genuinely agentic part of this exercise -- pacing, must-visit priority,
and where multi-day experience blocks go -- it just no longer also has
to decide which tools to call, since that was never actually in doubt."""

import asyncio
import json
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from dotenv import load_dotenv
from openai import OpenAI

from client_adapter import mcp_session, call_mcp_tool

load_dotenv()

MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = """You are a sustainable-travel itinerary planner. You are given real \
hotels, attractions, experiences, and tour companies for one destination, and must \
compose a day-by-day itinerary for the requested number of days using ONLY the \
items provided -- never invent a hotel, attraction, experience, or tour that isn't \
in the data below.

Rules:
- Pick one hotel as the home base (or one per region, for multi-region destinations).
- Prioritize "must_visit" attractions before "additional" ones.
- A multi-day experience (has a "days" field > 1) occupies that many CONSECUTIVE \
days as a single block -- do not split it or double-book those days with anything else.
- Mention at most one tour company suggestion per day, only where it fits naturally.
- Output a clear Day 1, Day 2, ... structure. Be concise."""


async def gather_data(destination: str) -> dict:
    """Deterministically call all four MCP tools for one destination.
    No GPT involved -- this is scripted, not agent-decided."""
    async with mcp_session() as session:
        return {
            "hotels": await call_mcp_tool(session, "get_hotels", {"destination": destination}),
            "attractions": await call_mcp_tool(session, "get_attractions", {"destination": destination}),
            "experiences": await call_mcp_tool(session, "get_experiences", {"destination": destination}),
            "tours": await call_mcp_tool(session, "get_tours", {"destination": destination}),
        }


def build_user_prompt(
    destination: str,
    num_days: int,
    data: dict,
    preferred_regions: list[str] | None = None,
    preferred_hotels: list[str] | None = None,
) -> str:
    constraints = ""
    if preferred_regions:
        constraints += f"\nThe traveler specifically wants to focus on these region(s): {', '.join(preferred_regions)}. Prefer attractions, experiences, and tours in these regions over others."
    if preferred_hotels:
        constraints += f"\nThe traveler has specifically selected these hotel(s) as their home base: {', '.join(preferred_hotels)}. Use only these as the home base -- do not substitute a different hotel."

    return f"""Destination: {destination}
Trip length: {num_days} days
{constraints}

HOTELS:
{data['hotels']}

ATTRACTIONS:
{data['attractions']}

EXPERIENCES:
{data['experiences']}

TOURS:
{data['tours']}

Compose the {num_days}-day itinerary now."""


async def compose_itinerary(
    destination: str,
    num_days: int,
    preferred_regions: list[str] | None = None,
    preferred_hotels: list[str] | None = None,
) -> str:
    """Gather all four tables deterministically (free), then make exactly
    one GPT call to compose the itinerary. `preferred_regions`/`preferred_hotels`
    are optional user selections (e.g. from a form) fed in as constraints --
    they don't add extra tool calls, just extra instructions for the same
    single completion request."""
    data = await gather_data(destination)

    for label, payload in data.items():
        count = len(json.loads(payload).get(label, []))
        print(f"[fetched] {label}: {count} items", file=sys.stderr)

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(destination, num_days, data, preferred_regions, preferred_hotels)},
        ],
    )
    return response.choices[0].message.content


if __name__ == "__main__":
    destination = sys.argv[1] if len(sys.argv) > 1 else "Slovenia"
    num_days = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    itinerary = asyncio.run(compose_itinerary(destination, num_days))
    print()
    print(itinerary)
