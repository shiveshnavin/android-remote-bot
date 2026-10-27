---
name: fix-bot-flow
description: >-
  Use this skill when mobile app updates break Instagram or YouTube automated video posting flows.
  Guides stopping pm2, running the bot server in the foreground/background for logs, triggering pipelane,
  inspecting XML and screenshots, manually troubleshooting with AndroidBot methods, hot-patching dist JS files,
  and syncing working changes back to TypeScript source files.
---

# Fix Bot Flow Runbook

Automated video publishing flows on Android devices (Instagram and YouTube) occasionally break after mobile app UI updates. This skill documents the standard rapid-iteration debugging and patching workflow.

## Debugging Principle
> **Fast iterations first:** Do **not** modify TypeScript and recompile with `npm run build` / `npm run compile` during iteration because compilation is slow. Make surgical fixes directly in compiled files under `dist/` (`dist/post-instagram.js`, `dist/post-youtube.js`, or `dist/bot.js`), restart the bot process, and verify. Once verified and working end-to-end, mirror the exact changes into the corresponding `.ts` files so changes persist across future builds.

---

## Step-by-Step Workflow

### 1. Stop the Background PM2 Service
Stop the running production instance to release port 4041 and avoid conflicting adb/pipelane tasks:
```bash
pm2 stop android
```

### 2. Start Bot in Background with Log Redirection
Start the server using `npm start` (or `PORT=4041 node dist/android-server.js`) redirected to a log file or run asynchronously:
```bash
PORT=4041 node dist/android-server.js > /tmp/bot-server.log 2>&1 &
# Check PID or tail logs:
tail -f /tmp/bot-server.log
```
Verify port 4041 is listening:
```bash
curl -s http://127.0.0.1:4041/bot || curl -s http://localhost:4041/bot
```

### 3. Trigger the Pipelane
Send the GraphQL execution request to run the bot pipeline:
```bash
curl --url 'https://androidbot.semibit.in/pipelane/graph' \
  --data-raw $'{"operationName":"executePipelane","variables":{"name":"post-android-bot","input":"{\\n  \\"fastFail\\": false,\\n  \\"whyFastFailFalse\\": \\"to kill app on fail so retry works\\",\\n  \\"bot_host\\": \\"192.168.1.7\\",\\n  \\"count\\": 1,\\n  \\"media_type\\": \\"video\\",\\n  \\"schedule_type\\": \\"publish_bot\\",\\n  \\"access_token\\": \\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzZW1pYml0IiwiaWF0IjoxNzQ5MDQ5NTg5LCJleHAiOjIwOTYyMDQ3ODksImF1ZCI6Ind3dy5zZW1pYml0LmluIiwic3ViIjoiYWRtaW5Ac2VtaWJpdC5pbiIsImlkIjoiMTJhMzdlODRkZCIsIm5hbWUiOiJzZW1pYml0IiwiZW1haWwiOiJhZG1pbkBzZW1pYml0LmluIiwiYXZhdGFyIjoiaHR0cHM6Ly93d3cuc2VtaWJpdC5pbi9sb2dvLnBuZyIsInBhdGgiOiIvIiwic2NvcGVzIjoicmVhZCx3cml0ZSx3cml0ZV9tZXNzYWdpbmcifQ.bdo5GSll4qoBO43URfOYw7XPf29XF671H7XBf9i9tAQ\\"\\n}"},"query":"mutation executePipelane($name: ID\u0021, $input: String\u0021) {\\n  executePipelane(name: $name, input: $input) {\\n    id\\n    __typename\\n  }\\n}"}'
```

### 4. Monitor Logs & Catch the Error
Watch `/tmp/bot-server.log` (or `~/.pm2/logs/android-out.log` if pm2 was used). Note:
- Which step failed (e.g. `switchYtProfile`, `ytEnterCaptionAndPost`, `dismissBottomSheetIfPresent`, `shareAndPost`)
- Missing node selector or null reference (`Cannot read properties of undefined`, `Node not found content-desc = ...`)

### 5. Inspect UI Hierarchy & Device State
When a failure occurs or when inspecting the screen:
1. **Dump UI Hierarchy:**
   ```bash
   adb shell uiautomator dump /sdcard/window_dump.xml
   adb pull /sdcard/window_dump.xml workspace/dump.xml
   ```
2. **Inspect Dumped XML:**
   Search for relevant text, resource-id, class, or content-desc in `workspace/dump.xml` using `grep` or node inspection script:
   ```bash
   grep -i "settings" workspace/dump.xml
   grep -i "account" workspace/dump.xml
   ```
3. **Capture Screenshot (if needed):**
   ```bash
   adb shell screencap -p /sdcard/screen.png
   adb pull /sdcard/screen.png workspace/screen.png
   ```
4. **Use Bot Helper Methods (via REPL or scratch script):**
   You can run interactive node snippets using `bot = new (require('./dist/bot').AndroidBot)()` to test node finding or tapping:
   ```javascript
   const { AndroidBot } = require('./dist/bot');
   const bot = new AndroidBot();
   (async () => {
     const xml = await bot.dumpScreenXml();
     const node = await bot.findElementByAttribute("content-desc", "Settings", xml);
     console.log("Found:", node);
   })();
   ```

### 6. Make Surgical Updates in `dist/*.js`
Modify the compiled JS files directly to avoid slow compilation cycles:
- For Instagram flows: `dist/post-instagram.js`
- For YouTube flows: `dist/post-youtube.js`
- For shared bot routines: `dist/bot.js`

Add fallback selectors or handle alternate screen states (e.g., check alternate `content-desc`, `text`, or `resource-id`).

### 7. Restart Server & Re-test
Kill the background server process:
```bash
kill $(lsof -t -i:4041)
PORT=4041 node dist/android-server.js > /tmp/bot-server.log 2>&1 &
```
Re-trigger the pipelane using the curl command and repeat Steps 4–6 until the flow completes successfully.

### 8. Backport Verified Fixes to TypeScript (`.ts`)
Once the flow succeeds:
1. Edit the corresponding TypeScript source file (`post-instagram.ts`, `post-youtube.ts`, or `bot.ts`) with identical logic changes.
2. Ensure types are preserved.
3. Clean up any temporary scratch files and restore `pm2 start android` (or restart pm2 service) if production daemon mode is expected.
