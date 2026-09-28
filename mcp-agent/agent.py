"""Phase 2: the simplest possible end-to-end agent loop. Sends a user
message to GPT with the MCP server's tools available; if GPT calls one or
more tools, runs them via the MCP client and feeds the results back for a
final answer. This proves the MCP <-> OpenAI plumbing works end to end
before Phase 3 adds multi-turn orchestration (the agent deciding to call a
second tool based on what the first one returned)."""

import asyncio
import json
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from dotenv import load_dotenv
from openai import OpenAI

from client_adapter import mcp_session, list_openai_tools, call_mcp_tool

load_dotenv()

MODEL = "gpt-4o-mini"


async def run(user_message: str) -> str:
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    async with mcp_session() as session:
        tools = await list_openai_tools(session)
        messages = [{"role": "user", "content": user_message}]

        response = client.chat.completions.create(
            model=MODEL, messages=messages, tools=tools
        )
        message = response.choices[0].message

        if not message.tool_calls:
            return message.content

        messages.append({
            "role": "assistant",
            "content": message.content,
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in message.tool_calls
            ],
        })

        for tool_call in message.tool_calls:
            args = json.loads(tool_call.function.arguments)
            print(f"[tool call] {tool_call.function.name}({args})", file=sys.stderr)
            result = await call_mcp_tool(session, tool_call.function.name, args)
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result,
            })

        final = client.chat.completions.create(
            model=MODEL, messages=messages, tools=tools
        )
        return final.choices[0].message.content


if __name__ == "__main__":
    question = sys.argv[1] if len(sys.argv) > 1 else "What hotels are in Slovenia?"
    answer = asyncio.run(run(question))
    print()
    print("Answer:", answer)
