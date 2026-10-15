import asyncio
import json
import os
import sys

DEV_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DEV_DIR)
sys.path.insert(1, os.path.dirname(DEV_DIR))
sys.path.insert(2, os.path.join(os.path.dirname(DEV_DIR), "py_modules"))

from main import Plugin  # noqa: E402

USAGE = "usage: python3 dev/run_backend.py <method> [json_arg ...]"


async def run(method: str, args: list):
    plugin = Plugin()
    await plugin._migration()
    await plugin._main()
    try:
        result = await getattr(plugin, method)(*args)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    finally:
        await plugin._unload()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(USAGE)
    asyncio.run(run(sys.argv[1], [json.loads(a) for a in sys.argv[2:]]))
