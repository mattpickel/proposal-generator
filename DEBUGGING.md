# Debugging Guide

This guide explains how to use the debugging and logging features to diagnose issues without burning through API calls.

## Overview

The app now includes comprehensive logging, error handling, and a debug panel to help you diagnose issues at each step of the workflow.

## Key Features

### 1. Smart Error Handling with Fallbacks

When a step fails (like a 429 rate limit error), the workflow continues with fallback content instead of stopping completely:

- **Rate Limit (429)**: Uses truncated content (first 2000 chars) and continues
- **Auth Error (401)**: Stops workflow and alerts you to check your API key
- **Other errors**: Uses truncated content and continues

This means if Step 1 fails due to rate limiting, Steps 2-4 will still run, so you can test the entire workflow without multiple API calls.

### 2. Debug Panel (Development Only)

A debug panel appears at the bottom of the screen when running in development mode (`npm run dev`).

**Features:**
- View all logs in real-time
- Filter by log level (DEBUG, INFO, WARN, ERROR)
- Export logs as JSON for analysis
- Export distilled content to see what was passed to each step
- Clear logs
- Collapsible to stay out of your way

**How to use:**
1. Run `npm run dev`
2. Look at the bottom of the screen for "🔧 Debug Panel"
3. Click to expand/collapse
4. Use filters to find specific logs
5. Click "View Data" on any log entry to see detailed information

### 3. Detailed Logging

Every step logs detailed information:

**OpenAI Service Logs:**
- Request details (model, tokens, temperature)
- Request/response timing
- Token usage (input, output, total)
- Error details (status code, error type, message)
- Content previews (first 100-200 chars)

**Workflow Logs:**
- Each step's progress
- File reading details
- Distillation compression ratios
- Fallback usage warnings
- Success/failure status

**Example log flow:**
```
[INFO] [Workflow] Starting proposal generation workflow
[DEBUG] [Workflow] Read Fireflies file
[DEBUG] [OpenAI] Starting distill-fireflies
[INFO] [OpenAI] distill-fireflies completed (3.2s, 1200 tokens)
[INFO] [Workflow] Step 1/4 completed: Fireflies distilled
... and so on
```

### 4. Error Recovery

The workflow is designed to recover from failures:

```javascript
// Step 1 fails with 429 → Uses fallback, continues to Step 2
// Step 2 succeeds → Normal processing
// Step 3 succeeds → Normal processing
// Step 4 receives: fallback + normal + normal content
```

This lets you test the entire pipeline even when rate-limited.

## Common Debugging Scenarios

### Scenario 1: Rate Limit on Step 2

**What happens:**
1. Step 1 completes successfully
2. Step 2 hits 429 rate limit
3. Toast shows: "⚠️ Rate limit hit on Step 2 (Examples). Using fallback (truncated content)."
4. Step 3 continues normally
5. Step 4 generates proposal with: distilled Fireflies + truncated examples + distilled docs

**How to debug:**
1. Open Debug Panel
2. Filter by ERROR or WARN
3. Look for the 429 error details
4. Click "Export Distillation" to see what content was actually used
5. Check if proposal quality is acceptable with truncated examples

### Scenario 2: Investigating Token Usage

**How to:**
1. Open Debug Panel
2. Filter by INFO
3. Look for "completed" messages
4. Expand "View Data" to see token counts
5. Identify which steps use the most tokens

**Example:**
```json
{
  "elapsed": "2847ms",
  "inputTokens": 3421,
  "outputTokens": 654,
  "totalTokens": 4075
}
```

### Scenario 3: Prompt Debugging

If the output isn't what you expect:

1. Open `src/config/prompts.js`
2. Edit the relevant prompt
3. Save (changes take effect immediately in dev mode)
4. Export distillation from Debug Panel to see input content
5. Check logs to see content preview and token usage
6. Generate again to test

### Scenario 4: Complete Workflow Failure

**What to check:**
1. Debug Panel → Filter "ERROR"
2. Look for authentication errors (401)
3. Check API key in environment or UI
4. Look for network errors
5. Export logs and share with team

## Exporting Debug Data

### Export Logs
Click "Export Logs" in Debug Panel to download `debug-logs-[timestamp].json`

**Contains:**
- All log entries with timestamps
- Log levels and categories
- Messages and detailed data
- Full error information

### Export Distillation
Click "Export Distillation" to download `distillation-[timestamp].json`

**Contains:**
```json
{
  "fireflies": "distilled content or empty string",
  "examples": "distilled content or empty string",
  "supporting": "distilled content or empty string"
}
```

Use this to:
- See exactly what was passed to the final generation step
- Verify distillation quality
- Debug why output isn't as expected
- Test prompts with known inputs

## Log Levels

- **DEBUG**: Detailed technical information (request payloads, content previews)
- **INFO**: Normal operation milestones (step completed, tokens used)
- **WARN**: Recoverable issues (using fallback content)
- **ERROR**: Failures (API errors, critical issues)

## Production vs Development

**Development mode** (`npm run dev`):
- Debug panel visible
- DEBUG level logs enabled
- All logging active
- Exports available

**Production mode** (`npm run build`):
- Debug panel hidden
- INFO level and above only
- Minimal logging overhead
- No debug tools in UI

## Tips for Minimal API Usage

1. **Use fallbacks intentionally**: If you get a rate limit on Step 1, let it continue with fallback to test Steps 2-4

2. **Export distillation data**: Save successful distillations and reuse them for prompt testing

3. **Check logs before retrying**: Understand why something failed before making another API call

4. **Filter logs strategically**:
   - ERROR: Find what broke
   - WARN: Find what used fallbacks
   - INFO: Understand the flow
   - DEBUG: Deep dive into details

5. **Edit prompts between attempts**: Use the exported distillation content to test prompt changes without re-running distillation

## Console Logging

All logs also appear in the browser console with color coding:
- Open browser DevTools (F12)
- Check Console tab
- Logs are prefixed with `[LEVEL] [Category]`

## Getting Help

When reporting issues, export and share:
1. Debug logs JSON file
2. Distillation JSON file (if relevant)
3. Steps to reproduce
4. Expected vs actual behavior
