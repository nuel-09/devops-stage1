/**
 * Binds only to localhost — public access must go through Nginx.
 */
require("dotenv").config();

const express = require("express");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.disable("x-powered-by");

function json(res, body) {
  res.status(200);
  res.type("application/json");
  res.send(JSON.stringify(body));
}

app.get("/", (_req, res) => {
  json(res, { message: "API is running" });
});

app.get("/health", (_req, res) => {
  json(res, { message: "healthy" });
});

app.get("/me", (_req, res) => {
  const name = process.env.ME_NAME || "";
  const email = process.env.ME_EMAIL || "";
  const github = process.env.ME_GITHUB || "";

  if (!name || !email || !github) {
    // eslint-disable-next-line no-console
    console.warn(
      "ME_NAME, ME_EMAIL, and ME_GITHUB must be set for a valid /me submission."
    );
  }

  json(res, { name, email, github });
});

app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://${HOST}:${PORT}`);
});
