const http = require('http');
const { Log } = require('../logging_middleware/logger');

const TOKEN = process.env.AUTH_TOKEN;

function apiGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '4.224.186.213',
      port: 80,
      path,
      method: 'GET',
      headers: { Authorization: `Bearer ${TOKEN}` }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

function knapsack(vehicles, capacity) {
  const n = vehicles.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = vehicles[i - 1];
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
      if (Duration <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - Duration] + Impact);
      }
    }
  }
  const selected = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(vehicles[i - 1]);
      w -= vehicles[i - 1].Duration;
    }
  }
  return { maxImpact: dp[n][capacity], selected };
}

async function main() {
  await Log("backend", "info", "service", "Vehicle Maintenance Scheduler started");

  const depotsResponse = await apiGet('/evaluation-service/depots');
  console.log('Depots Response:', JSON.stringify(depotsResponse, null, 2));
  const depots = depotsResponse.depots || depotsResponse;
  await Log("backend", "info", "handler", `Fetched ${depots.length} depots`);

  const vehiclesResponse = await apiGet('/evaluation-service/vehicles');
  console.log('Vehicles Response:', JSON.stringify(vehiclesResponse, null, 2));
  const vehicles = vehiclesResponse.vehicles || vehiclesResponse;
  await Log("backend", "info", "handler", `Fetched ${vehicles.length} vehicles`);

  console.log(`\nVehicles: ${vehicles.length} | Depots: ${depots.length}\n`);

  for (const depot of depots) {
    await Log("backend", "info", "service", `Processing Depot ${depot.ID} - Budget: ${depot.MechanicHours}hrs`);
    const result = knapsack(vehicles, depot.MechanicHours);

    console.log(`\n=== Depot ${depot.ID} | Budget: ${depot.MechanicHours}hrs ===`);
    console.log(`Max Impact: ${result.maxImpact}`);
    console.log(`Vehicles Selected: ${result.selected.length}`);
    result.selected.forEach(v => {
      console.log(`  - TaskID: ${v.TaskID} | Duration: ${v.Duration}h | Impact: ${v.Impact}`);
    });
    const used = result.selected.reduce((s, v) => s + v.Duration, 0);
    console.log(`Hours Used: ${used}/${depot.MechanicHours}`);

    await Log("backend", "info", "service", `Depot ${depot.ID} done - MaxImpact: ${result.maxImpact}, Selected: ${result.selected.length} vehicles`);
  }

  await Log("backend", "info", "service", "Vehicle Maintenance Scheduler completed");
}

main().catch(async (err) => {
  await Log("backend", "fatal", "service", `Crash: ${err.message}`);
  console.error(err);
});
