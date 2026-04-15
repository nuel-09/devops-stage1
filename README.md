# HNG DevOps — Stage 1 API

Minimal Node.js (Express) JSON API deployed behind Nginx with systemd for persistence.

## What it does

| Method | Path     | Response body |
|--------|----------|----------------|
| GET    | `/`      | `{"message":"API is running"}` |
| GET    | `/health`| `{"message":"healthy"}` |
| GET    | `/me`    | `{"name":"...","email":"...","github":"..."}` |

All endpoints return **HTTP 200**, **`Content-Type: application/json`**, and respond quickly (no heavy work).

**Live deployment URL:** _add after deploy, e.g. `https://yourdomain.com`_

**Public repository:** _add your GitHub repo URL after push_

---

## Run locally

1. Install [Node.js](https://nodejs.org/) 18+.
2. Clone and install:

   ```bash
   cd stage1-api
   npm install
   ```

3. Copy env file and edit **your real** name, email, and GitHub profile URL:

   ```bash
   cp .env.example .env
   ```

4. Start:

   ```bash
   npm start
   ```

5. Test:

   ```bash
   curl -s http://127.0.0.1:3000/
   curl -s http://127.0.0.1:3000/health
   curl -s http://127.0.0.1:3000/me
   ```

The app listens on **`127.0.0.1:3000`** only (not exposed publicly).

---

## Deploy on Ubuntu VPS (Nginx + systemd)

Assumptions: Ubuntu, user `hngdevops`, app path `/opt/hng-stage1-api`, Node at `/usr/bin/node`.

### 1) Install Node.js 20 LTS (example: NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
```

### 2) Put code on the server

```bash
sudo mkdir -p /opt/hng-stage1-api
sudo chown hngdevops:hngdevops /opt/hng-stage1-api
```

From your PC, copy the repo (or `git clone` your public GitHub repo into that directory). On the server:

```bash
cd /opt/hng-stage1-api
npm install --omit=dev
```

### 3) Environment file (secrets / your profile)

```bash
sudo nano /etc/hng-stage1-api.env
```

Example:

```env
HOST=127.0.0.1
PORT=3000
ME_NAME=Your Full Name
ME_EMAIL=you@example.com
ME_GITHUB=https://github.com/yourusername
```

```bash
sudo chmod 600 /etc/hng-stage1-api.env
sudo chown root:root /etc/hng-stage1-api.env
```

### 4) systemd service

```bash
sudo cp deploy/hng-stage1-api.service /etc/systemd/system/hng-stage1-api.service
sudo systemctl daemon-reload
sudo systemctl enable hng-stage1-api
sudo systemctl start hng-stage1-api
sudo systemctl status hng-stage1-api --no-pager
```

### 5) Nginx reverse proxy

Edit your site config (e.g. `/etc/nginx/sites-available/default` or your domain file). Inside the `server { ... }` that faces the internet:

- **Remove** any Stage 0-only blocks (e.g. `location = /api` with `return 200`, or a static `root` for `/` that served HTML).
- **Replace** the main `location /` with the contents of `deploy/nginx-snippet.conf` (proxy to `127.0.0.1:3000`).

Do this for **both** `listen 80` and `listen 443 ssl` server blocks if you have two.

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Ensure **UFW** allows only `22`, `80`, `443` — **do not** open port `3000` publicly.

### 6) Verify from your PC

```bash
curl -i https://your-domain/
curl -i https://your-domain/health
curl -i https://your-domain/me
```

You should see `200` and `application/json` on all three.

### 7) Reboot test (persistence)

```bash
sudo reboot
```

After the machine is back, hit `/health` again without SSH — it should still work.

---

## Submission checklist

- [ ] Public GitHub repo with this README updated (live URL + repo link).
- [ ] `/`, `/health`, `/me` return JSON only, status 200.
- [ ] `/me` uses your real name, email, and GitHub URL via env.
- [ ] App on `127.0.0.1:3000`, Nginx proxies public traffic, port 3000 not exposed in firewall.
- [ ] `hng-stage1-api` enabled in systemd and running after reboot.

---

## License

MIT (or remove if you prefer; HNG may not require a license).
