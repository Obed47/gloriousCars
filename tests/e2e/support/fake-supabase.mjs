// A small stand-in for the Supabase REST, Auth and Storage APIs, so the
// end-to-end tests run the real site against a fixed catalogue and never touch
// a real project. It only implements what the public site and the login
// form call.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.FAKE_SUPABASE_PORT ?? 54321);

const catalogue = JSON.parse(readFileSync(join(here, "../fixtures/catalogue.json"), "utf8"));
// Row-level security hides sold vehicles from visitors; mirror that here.
const publicRows = catalogue.filter((row) => row.status !== "Sold");
const photo = readFileSync(join(here, "../../../public/logo.png"));

function send(res, status, body, headers = {}) {
  const isBuffer = Buffer.isBuffer(body);
  res.writeHead(status, {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "content-type": isBuffer ? headers["content-type"] ?? "application/octet-stream" : "application/json",
    ...headers,
  });
  res.end(isBuffer ? body : JSON.stringify(body));
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);

  if (req.method === "OPTIONS") return send(res, 204, "");
  if (url.pathname === "/__health") return send(res, 200, { ok: true });

  // PostgREST: GET /rest/v1/<table>
  if (req.method === "GET" && url.pathname === "/rest/v1/vehicles") {
    return send(res, 200, publicRows, { "content-range": `0-${publicRows.length - 1}/${publicRows.length}` });
  }
  if (req.method === "GET" && url.pathname === "/rest/v1/profiles") {
    return send(res, 200, []);
  }

  // Auth: any password sign-in is refused, as for an unknown account.
  if (req.method === "POST" && url.pathname === "/auth/v1/token") {
    return send(res, 400, { error: "invalid_grant", error_description: "Invalid login credentials" });
  }
  if (url.pathname === "/auth/v1/user") {
    return send(res, 401, { error_code: "bad_jwt", msg: "invalid JWT" });
  }

  // Storage: every photo is served as the same placeholder image.
  if (req.method === "GET" && url.pathname.startsWith("/storage/v1/object/public/vehicle-images/")) {
    return send(res, 200, photo, { "content-type": "image/png", "cache-control": "public, max-age=3600" });
  }

  return send(res, 404, { message: `fake supabase: no route for ${req.method} ${url.pathname}` });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`fake supabase listening on http://127.0.0.1:${port}`);
});
