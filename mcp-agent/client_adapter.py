"""MCP client adapter: connects to server.py over stdio, lists its tools,
and translates them into OpenAI's function-calling schema. This is the
glue layer described in DESIGN.md's "Note on the MCP<->OpenAI bridge" --
the two protocols use different tool-schema shapes, so something has to
sit between them."""

import sys
from contextlib import asynccontextmanager
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Launch server.py with whichever Python is running this file, and locate it
# relative to this file, so it works without a venv and from any directory.
SERVER_PARAMS = StdioServerParameters(
    command=sys.executable,
    args=[str(Path(__file__).parent / "server.py")],
)


def mcp_tool_to_openai_schema(tool) -> dict:
    """Translate one MCP Tool definition into an OpenAI function-calling
    tool definition. MCP already generates a JSON Schema for inputSchema
    from the Python function's type hints/docstring, so this is a reshape,
    not a re-derivation."""
    return {
        "type": "function",
        "function": {
            "name": tool.name,
            "description": tool.description or "",
            "parameters": tool.input_schema,
        },
    }


@asynccontextmanager
async def mcp_session():
    """Yield a live, initialized MCP ClientSession connected to server.py
    over stdio. Usage: `async with mcp_session() as session: ...`"""
    async with stdio_client(SERVER_PARAMS) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            yield session


async def list_openai_tools(session: ClientSession) -> list[dict]:
    """Fetch the MCP server's registered tools as OpenAI tool definitions."""
    tools = await session.list_tools()
    return [mcp_tool_to_openai_schema(t) for t in tools.tools]


async def call_mcp_tool(session: ClientSession, name: str, arguments: dict) -> str:
    """Call an MCP tool by name, return its result as plain text -- ready
    to drop into an OpenAI `role: "tool"` message."""
    result = await session.call_tool(name, arguments)
    return result.content[0].text
