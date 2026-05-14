const http = require('http');
const { Log } = require('../logging_middleware/logger');

const TOKEN = process.env.AUTH_TOKEN;

function fetchNotifications() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '4.224.186.213',
      port: 80,
      path: '/evaluation-service/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${TOKEN}` }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        console.log('Raw API response keys:', Object.keys(parsed));
        resolve(parsed);
      });
    });
    req.on('error', reject);
    req.end();
  });
}

const TYPE_PRIORITY = { Placement: 3, Result: 2, Event: 1 };

function getPriorityInbox(notifications, topN = 10) {
  const now = Date.now();
  const scored = notifications.map(n => {
    const typeScore = TYPE_PRIORITY[n.Type] ?? 0;
    const ageHours = (now - new Date(n.Timestamp).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - ageHours / 72);
    return { ...n, finalScore: typeScore + recencyScore };
  });
  scored.sort((a, b) => b.finalScore - a.finalScore);
  return scored.slice(0, topN);
}

async function main() {
  const N = parseInt(process.argv[2]) || 10;
  await Log("backend", "info", "service", `Priority Inbox started - top ${N}`);

  const result = await fetchNotifications();
  
  // Handle whichever key the API returns
  const notifications = result.notifications || result.Notifications || result.data || [];
  console.log(`\nTotal notifications from API: ${notifications.length}`);
  
  await Log("backend", "info", "handler", `Fetched ${notifications.length} notifications from API`);

  const top = getPriorityInbox(notifications, N);
  await Log("backend", "info", "service", `Top ${N} computed`);

  console.log(`\n===== TOP ${N} PRIORITY NOTIFICATIONS =====\n`);
  top.forEach((n, i) => {
    console.log(`${i + 1}. [${n.Type}] ${n.Message}`);
    console.log(`   Time: ${n.Timestamp} | Score: ${n.finalScore.toFixed(4)}`);
    console.log();
  });

  await Log("backend", "info", "service", "Priority Inbox completed");
}

main().catch(async err => {
  await Log("backend", "fatal", "service", `Crashed: ${err.message}`);
  console.error(err);
});
