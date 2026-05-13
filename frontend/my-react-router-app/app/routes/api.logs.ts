import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const BACKEND_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..", "backend");

export async function loader() {
  try {
    const data = JSON.parse(readFileSync(resolve(BACKEND_DIR, "display_logs.json"), "utf-8"));
    return Response.json(data);
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
