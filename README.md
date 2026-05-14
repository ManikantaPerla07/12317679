# Campus Notification Project

This repository has a few Node.js scripts for the evaluation task and one design note for the notification system.

## Files

- `logging_middleware/logger.js` - small logger used by the scripts.
- `vehicle_maintence_scheduler/index.js` - gets depot and vehicle data, then uses dynamic programming to choose work with the best impact.
- `notification_app_be/stage6.js` - fetches notifications and prints the top priority items.
- `notification_system_design.md` - short 6-stage design for the campus notification system.

## What You Need

- Node.js 18+
- `AUTH_TOKEN` from the evaluation service
- Network access to `4.224.186.213`

## Install

```bash
npm install
```

## Run the scripts

```powershell
$env:AUTH_TOKEN="YOUR_TOKEN_HERE"
node vehicle_maintence_scheduler/index.js
```

```powershell
$env:AUTH_TOKEN="YOUR_TOKEN_HERE"
node notification_app_be/stage6.js 10
```

## Quick Note

Both scripts send logs through the shared logger and depend on the token being set in the terminal session.
