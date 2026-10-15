const DEBUGGER_URL = "http://localhost:8080/json";
const TIMEOUT_MS = 15000;

const pluginName = process.argv[2];
if (!pluginName) {
  console.error("usage: node dev/reload.mjs <plugin name>");
  process.exit(2);
}

async function findSharedContext() {
  let targets;
  try {
    targets = await (await fetch(DEBUGGER_URL)).json();
  } catch {
    throw new Error(
      `Steam debugger not reachable at ${DEBUGGER_URL}. ` +
        'Is Steam running with "Allow Remote CEF Debugging" enabled in Decky?',
    );
  }
  const target = targets.find((t) => t.title === "SharedJSContext");
  if (!target) throw new Error("SharedJSContext not found; is Decky loaded?");
  return target.webSocketDebuggerUrl;
}

function evaluate(wsUrl, expression) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error("timed out waiting for Steam"));
    }, TIMEOUT_MS);
    ws.onerror = () => reject(new Error("debugger connection failed"));
    ws.onopen = () =>
      ws.send(
        JSON.stringify({
          id: 1,
          method: "Runtime.evaluate",
          params: { expression, awaitPromise: true, returnByValue: true },
        }),
      );
    ws.onmessage = (message) => {
      const response = JSON.parse(message.data);
      if (response.id !== 1) return;
      clearTimeout(timer);
      ws.close();
      const details = response.result?.exceptionDetails;
      if (details) {
        reject(new Error(details.exception?.description ?? details.text));
      } else {
        resolve(response.result?.result?.value);
      }
    };
  });
}

try {
  const wsUrl = await findSharedContext();
  await evaluate(
    wsUrl,
    `DeckyBackend.call("loader/reload_plugin", ${JSON.stringify(pluginName)})`,
  );
  console.log(`Reloaded ${pluginName}`);
} catch (error) {
  console.error(`Reload failed: ${error.message}`);
  process.exit(1);
}
