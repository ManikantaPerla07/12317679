# 12317679

A small Node.js workspace for the evaluation tasks in this repository. It includes a logging middleware, a vehicle maintenance scheduler, and a priority notification inbox implementation, along with a full campus notification system design document.

## What’s Included

- `logging_middleware/logger.js` - shared HTTP logger used by the applications.
- `vehicle_maintence_scheduler/index.js` - depot/vehicle scheduler that uses a knapsack-style optimization.
- `notification_app_be/stage6.js` - priority inbox processor that fetches notifications from the evaluation service and ranks them.
- `notification_system_design.md` - six-stage campus notification system design covering API, schema, caching, bulk delivery, and ranking.

## Requirements

- Node.js 18 or newer
- A valid `AUTH_TOKEN` from the evaluation service
- Internet access to `4.224.186.213`

## Installation

```bash
npm install
```

## How To Run

Set the token in your terminal session first.

### Vehicle Maintenance Scheduler

```powershell
$env:AUTH_TOKEN="YOUR_TOKEN_HERE"
node vehicle_maintence_scheduler/index.js
```

### Priority Inbox

```powershell
$env:AUTH_TOKEN="YOUR_TOKEN_HERE"
node notification_app_be/stage6.js 10
```

## Expected Behavior

The scheduler fetches depots and vehicles, logs each step through the middleware, and prints the optimized vehicle selection per depot.

The priority inbox script fetches notification records, scores them by type and recency, and prints the top N results in ranked order.

## Project Structure

```text
.
├── logging_middleware/
│   └── logger.js
├── notification_app_be/
│   └── stage6.js
├── notification_system_design.md
├── vehicle_maintence_scheduler/
│   └── index.js
├── package.json
└── package-lock.json
```

## Notes

- The repository currently uses CommonJS modules.
- `AUTH_TOKEN` is required for the evaluation API calls.
- The code writes logs to the evaluation service before and after the main work in each script.
