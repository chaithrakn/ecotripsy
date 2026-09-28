# Greenlugg Trip-Planning Agent — Design Doc

_Branch: `mcp-testing` — a learning project, not part of the production app._

## Goal

Build a working MCP server exposing Greenlugg's real Supabase data as tools, plus a Python agent client that takes a simple form input (destination + day count), uses those tools to pull real hotels/attractions/experiences/tours, composes a draft day-by-day itinerary, and verifies its own output against the database before returning it.

The point isn't a polished feature — it's hands-on, interview-ready depth on three things:
1. Implementing the MCP protocol (server + client) correctly
2. Driving a multi-step tool-calling agent loop
3. Grounding/verifying LLM output against ground truth, with a repair loop

## Stack

| Piece | Choice | Why |
|---|---|---|
| MCP server | `mcp` v2.x (official Python SDK) + `supabase-py` | Protocol-correct, reusable by any MCP client later. Note: v2 renamed `FastMCP` → `MCPServer` (`mcp.server.mcpserver.MCPServer`) — tutorials online mostly still show the old v1 API |
| Transport | stdio | Simplest for local dev — no hosting, no auth surface |
| Agent/client | `openai` SDK, function/tool calling, `gpt-4o-mini` | Cheap, fast, good enough for structured tool-selection |
| Verification | Plain Python — no LLM | Rule-based checks against known-good constraints |
| Env | `.env` + `python-dotenv` | Separate from the main app's `.env`; can reuse the same Supabase anon key (read-only queries) |

## Three design decisions made explicit

### 1. Chaining lives in the agent, not the server (for v1) — REVISED after Phase 2

Two valid patterns exist:
- **Server-side composition**: one `build_itinerary_draft` tool internally calls the other three and returns a finished skeleton. Simple, but the agent never actually reasons about *which* tool to call next — it's a single RPC dressed up as an MCP tool.
- **Agent-side orchestration**: the server exposes only the three granular tools; the LLM decides, turn by turn, to call `search_destinations`, then `get_hotels`, then `get_experiences`, based on what it learns from each result.

Phase 2 built and verified true agent-side orchestration (see build order below) — GPT correctly chose which of the four tools to call, including calling two in one turn for a combined query. That confirmed the pattern works.

**Revised for Phase 3, for a real reason (not a shortcut): a $5 total OpenAI budget.** Once every itinerary request needs all four tools, letting GPT *decide* to call all four across several turns just spends extra GPT calls (each tool-call turn is a full completion request) to arrive at a conclusion that's not actually in doubt — you already know a full itinerary needs hotels + attractions + experiences + tours. So Phase 3 fetches all four **deterministically in plain Python** (free, no GPT involved) and makes **exactly one** GPT call to do the part that's genuinely ambiguous and worth an LLM: composing the day-by-day plan from that data (pacing, must-visit priority, multi-day experience blocking). GPT no longer decides *which tools to call* — it decides *what to do with the results*, which is where the actual reasoning was anyway.

The true multi-turn agent loop from Phase 2 (`agent.py`) is kept as-is and still demonstrates the orchestration pattern for the interview-prep goal; Phase 3's `main.py` is a second, cost-conscious pattern built alongside it — comparing the two (turn-by-turn tool selection vs. deterministic-fetch-then-single-compose-call) is itself a reasonable thing to be able to explain, and was arguably always going to be the v2 stretch-goal comparison, just arrived at earlier and for a budget reason rather than a design purity one.

### 2. Input is a simple form, not free-text NL parsing

**Dropped pillar filtering and free-text parsing entirely for v1.** No NL entity extraction, no ambiguity handling, no pillars — same reasoning as before: free-text input means the agent's first job is extracting structured facts from an unstructured sentence, a separate skill from tool-calling and its own failure mode to debug. A structured input skips that entirely.

**Input source: the real site's existing `TripForm.jsx`**, not a new form built for this exercise. It already collects exactly the structured facts needed — selected region(s), selected hotel(s), selected experience IDs — through UI that's already built and already validated against real data (can't select a region/hotel/experience that doesn't exist). This means `search_destinations` isn't needed at all, and there's no destination-name-typo class of bug to worry about.

This does introduce a real architectural question for later phases: `TripForm.jsx` runs in the browser; the MCP agent is a Python process using an OpenAI key that must never reach the browser. Some backend bridge (an API endpoint the frontend calls, which then invokes the Python agent) is needed between them — not resolved yet, not a Phase 1 concern, since Phase 1 is the MCP server in isolation.

Dates aren't part of `TripForm.jsx` today and stay out of scope — no availability/calendar data exists anywhere in the schema for them to filter against.

### 3. Itinerary drafts are composed from real content — hotels, tours, experiences, *and* attractions — with no `itinerary_templates` dependency

Revised from the original "generic skeleton" plan. The production itinerary builder (`src/lib/itinerary.js`) depends on hand-authored `itinerary_templates` rows that must match the requested day count exactly — we hit that exact fragility as a real bug earlier (a missing template caused a 406 that took real debugging to trace). This design avoids that dependency entirely while still producing a real, content-grounded itinerary — by making the **LLM itself do the day-by-day composition**, given all four raw building blocks, rather than looking up a pre-authored template.

**Four tools feed the assembly step:**

| Table | Tool | Key fields for sequencing |
|---|---|---|
| `hotels` | `get_hotels(destination)` | one hotel = the trip's home base (or per-region, for multi-region destinations) |
| `attractions` | `get_attractions(destination)` | `tier` (`must_visit` vs `additional`) — must-visits get prioritized into the day plan first |
| `experiences` | `get_experiences(destination)` | `days` — a multi-day experience (e.g. a 4-day trek) consumes that many *consecutive* days as a block, same `day`/`dayEnd` concept already used in the real site's `Itinerary.jsx` |
| `tour_companies` | `get_tours(destination)` | destination-wide (`region_id` null) vs region-scoped, same nullable pattern as hotels — surfaced as a suggestion alongside a day, not a scheduled block |

**The assembly step is explicitly an LLM reasoning task, not a deterministic composer.** Given all four raw results, GPT decides: which day is arrival/departure, how many must-visit attractions per day is reasonable pacing, whether a fetched experience fits the day budget and where to slot its block, which tour to mention and on which day. This is the part of the exercise that's genuinely agentic — unlike verification, which stays rule-based.

**This adds real verification surface area, which is a feature, not a cost** — it's the part of the exercise about catching an LLM's mistakes, not just its hallucinations:
- Grounding: every hotel/attraction/experience/tour named in the output actually appears in that call's tool results (unchanged from before).
- Day count: total days in the output matches the requested count.
- **Day-span math**: if an experience with `days=N` is included, does the output actually block out N *consecutive* days for it, with the rest of the itinerary correctly accounting for the remaining days? This is the exact bug class we already hit for real in `Itinerary.jsx` (the `dayEnd`/`daySpan` handling) — a good, concrete thing to point at when this check inevitably catches GPT getting the math wrong at least once.
- Region consistency: attractions/tours used on a given day belong to the same region as that day's hotel (relevant once a destination has multiple regions).

## Data mapping (tool → real schema)

| Tool | Table | Key fields returned | Notes |
|---|---|---|---|
| `get_hotels(destination)` | `hotels` joined through `regions.destination_id` | `name`, `region_id`, `image`, `description` | Maps directly onto `resolveHotelListBlock`'s existing query shape |
| `get_attractions(destination)` | `attractions` joined through `regions.destination_id` | `name`, `tier`, `description`, `region_id` | Resolve all region_ids for the destination first, then `.in('region_id', [...])` |
| `get_experiences(destination)` | `experiences` joined through `regions.destination_id` | `title`, `days`, `description`, `region_id` | `days` drives the multi-day-block logic in decision #3 |
| `get_tours(destination)` | `tour_companies` | `name`, `description`, `region_id` (nullable), `destination_id` (nullable) | Same destination-wide-vs-region-scoped pattern as hotels — fetch both |

No `search_destinations` tool for v1 (see decision #2) and no `pillar`/`certification` params. All four are read-only against the same Supabase project the live site uses — the anon key is sufficient, no service-role key needed.

## Architecture

```
Form input: destination (dropdown) + day count
        │
        ▼
  Agent (Python, openai SDK)
   - holds conversation state
   - on each turn, GPT decides: answer, or call a tool
        │  (function-calling schema, translated from MCP tool defs)
        ▼
  MCP Client  ──stdio──▶  MCP Server (Python, mcp SDK)
        ▲                        │
        │                        ▼
   tool result            supabase-py → Supabase (read-only)
        │                  get_hotels / get_attractions /
        │                  get_experiences / get_tours
        ▼
  GPT composes a day-by-day itinerary from the accumulated
  hotels + attractions + experiences + tours — deciding pacing,
  must-visit priority, and where multi-day experience blocks go
        │
        ▼
  Verifier (plain Python, no LLM)
   - every hotel/attraction/experience/tour named actually exists
     in that call's tool results (catches hallucination)
   - day count matches the request
   - multi-day experience blocks span the correct consecutive days
   - attractions/tours used match the region of that day's hotel
        │
   pass ─┴─ fail (max 2 retries)
        │         │
        ▼         ▼
     return    feed specific failure back to GPT as a new message,
     draft     re-generate, re-verify
```

**Note on the MCP↔OpenAI bridge**: MCP's tool schema and OpenAI's function-calling schema are different formats — the client needs an explicit adapter step that lists the MCP server's tools (via the `mcp` SDK's client) and reformats each one into the JSON schema `openai`'s chat completions API expects. This is real, non-trivial glue code, not a one-liner — budget actual time for it.

## Repo layout

```
mcp-agent/
  DESIGN.md            (this file)
  server.py            MCP server: get_hotels, get_attractions, get_experiences, get_tours
  client_adapter.py     MCP client + MCP→OpenAI tool-schema translation
  agent.py             the conversation loop (openai SDK, calls client_adapter)
  verify.py            rule-based verification + repair-prompt construction
  main.py              entry point: form input in, verified draft out
  requirements.txt
  .env                 SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY
```

Lives inside this repo, on the `mcp-testing` branch, since that's the branch already set up for this — not a separate repo.

## Build order

1. ✅ **DONE** — **MCP server alone**, all 4 tools (`get_hotels`, `get_attractions`, `get_experiences`, `get_tours`) in `server.py`, backed by a shared `resolve_destination()` helper. Verified two ways: calling the tool functions directly against live data, and a real MCP client connecting over stdio (`test_mcp_protocol.py`) to list and invoke tools through the actual protocol layer.
2. ✅ **DONE** — **MCP↔OpenAI adapter + single-tool-call loop** (`client_adapter.py`, `agent.py`). Verified live end to end: `python agent.py "What hotels are in Slovenia?"` → GPT decides to call `get_hotels`, the MCP client invokes it over stdio, `server.py` hits real Supabase, and GPT composes a final answer grounded in the actual returned hotel names/descriptions/prices. Hit one version-drift bug: the installed `mcp` SDK's `Tool` object exposes `input_schema` (snake_case), not the `inputSchema` shown in most docs/examples — same class of issue as the `FastMCP`→`MCPServer` rename in Phase 1.
3. **Deterministic fetch + single-call composition** (`main.py`). Form input → Python calls all four tools directly (no GPT) → exactly one GPT call composes the day-by-day itinerary from the combined results. See Decision 1's revision above for why this replaced the original "agent calls all four tools" plan.
4. **Verification + repair loop.** Add the rule-based checks (grounding, day count, experience day-span math, region consistency) and the retry-with-feedback cycle (cap at 2–3 retries to avoid infinite loops).
5. **Stretch**: a server-side composite tool that does the same composition deterministically in Python, for direct comparison against the agent-orchestrated version from step 3.

## Open items still worth deciding

- Exact retry cap for the verification loop (proposing 2, to keep cost/latency bounded).
- Whether dates belong in the form at all, given they can only ever be cosmetic (see decision #2).
- Logging/tracing approach for debugging the agent loop (even a simple structured print of each tool call + result goes a long way for the "agent debugging" learning goal).
