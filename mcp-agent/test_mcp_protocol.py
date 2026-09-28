"""One-off smoke test: connect a real MCP client to server.py over stdio,
list the registered tools, and call one of them. Not part of the app --
just verifying the protocol layer works before building the agent on top."""

import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    params = StdioServerParameters(command="venv/Scripts/python", args=["server.py"])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            tools = await session.list_tools()
            print("Registered tools:")
            for t in tools.tools:
                print(f"  - {t.name}: {t.description[:70]}...")

            print()
            result = await session.call_tool("get_hotels", {"destination": "Slovenia"})
            content = result.content[0].text
            print("call_tool('get_hotels', destination='Slovenia'):")
            print(" ", content[:200], "...")


if __name__ == "__main__":
    asyncio.run(main())
