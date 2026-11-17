import asyncio, sys, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--allow-file-access-from-files","--autoplay-policy=no-user-gesture-required"])
        pg = await b.new_page(viewport={"width":1280,"height":820})
        logs = []
        pg.on("console", lambda m: logs.append(f"[{m.type}] {m.text}"))
        pg.on("pageerror", lambda e: logs.append(f"[pageerror] {e}"))
        await pg.goto("file:///home/claude/lifesim/dist/index.html")
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path="/tmp/s1.png")
        steps = json.loads(sys.argv[1]) if len(sys.argv) > 1 else []
        for i, st in enumerate(steps):
            kind, arg = st
            try:
                if kind == "click": await pg.click(arg, timeout=3000)
                elif kind == "text": await pg.get_by_text(arg, exact=False).first.click(timeout=3000)
                elif kind == "key": await pg.keyboard.press(arg)
                elif kind == "wait": await pg.wait_for_timeout(int(arg))
                elif kind == "shot": await pg.screenshot(path=arg)
                elif kind == "eval": print("EVAL:", await pg.evaluate(arg))
            except Exception as e:
                print("STEP FAIL", st, str(e)[:200])
        for l in logs[:40]: print(l[:300])
        await b.close()
asyncio.run(main())
