"""Local-only bridge between the React form (AgentPlayground page) and the
Python agent. This is the "backend bridge" DESIGN.md's Decision 2 flagged
as unresolved: TripForm-style selection happens in the browser, but the
agent needs an OpenAI key that must never reach the browser, so something
server-side has to sit in between.

Run alongside `npm run dev`, from mcp-agent/:
    python api_server.py

Not deployed anywhere -- localhost only, for local learning/testing."""

import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from main import compose_itinerary

app = FastAPI(title="Greenlugg Agent Bridge (local dev only)")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    destination: str
    days: int
    region_names: list[str] = []
    hotel_names: list[str] = []


@app.post("/api/generate-itinerary")
async def generate_itinerary(req: GenerateRequest):
    itinerary = await compose_itinerary(
        req.destination, req.days, req.region_names or None, req.hotel_names or None
    )
    return {"itinerary": itinerary}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
