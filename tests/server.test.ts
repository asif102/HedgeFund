import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import test from "node:test";

const port = 3100 + Math.floor(Math.random() * 500);
const baseUrl = `http://127.0.0.1:${port}`;
let server: ChildProcess | undefined;

async function waitForServer(timeoutMs = 15000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // The server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for the test server");
}

test.before(async () => {
  server = spawn("npx", ["tsx", "server.ts"], {
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
  });
  await waitForServer();
});

test.after(async () => {
  if (!server || server.killed) return;
  server.kill("SIGTERM");
  await once(server, "exit").catch(() => undefined);
});

test("health endpoint reports the committee server is online", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.status, "ok");
  assert.equal(payload.teamOnline, true);
});

test("swarm committee returns independent, auditable agent scores", async () => {
  const response = await fetch(`${baseUrl}/api/swarm/committee`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      quote: {
        symbol: "NVDA",
        price: 222.27,
        changePercent: 1.34,
        peRatio: 28.1,
        week52High: 236.5,
        week52Low: 95,
      },
    }),
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.result.symbol, "NVDA");
  assert.equal(payload.result.agents.length, 5);
  assert.equal(new Set(payload.result.agents.map((agent: { agentId: string }) => agent.agentId)).size, 5);
  assert.match(payload.result.methodology, /independent/i);
  for (const agent of payload.result.agents) {
    assert.ok(agent.score >= 0 && agent.score <= 100);
    assert.ok(agent.evidence.length > 0);
  }
});
