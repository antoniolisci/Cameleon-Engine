# Cameleon Engine

Sources:

- `docs/source-v7.3.2e.html` = UI cockpit base
- `docs/source-v4.5.html` = adaptive logic engine

Goal:

Merge both into one modular project.

Rules:

- Keep V7.3.2e as visual shell
- Use V4.5 as logic engine
- Final structure must be modular
- No inline CSS/JS in final build

## Run Locally On Windows

Do not open `src/index.html` with `file:///`.

This project uses ES modules (`type="module"`), and Brave/Chromium will block those imports over `file:///` with CORS errors. Run it through a local HTTP server instead.

### Fastest launch

From the project root, either:

1. Double-click `serve-local.cmd`

or

1. Open PowerShell in `C:\Users\anton\Documents\Cameleon-Engine`
2. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve-local.ps1
```

### Open the app

After the server starts, open this URL in Brave:

```text
http://localhost:8000/src/index.html
```

You can also open it from PowerShell with:

```powershell
Start-Process "http://localhost:8000/src/index.html"
```

### Stop the server

In the terminal window running the server, press `Ctrl+C`.

### Optional: use another port

If port `8000` is already in use:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve-local.ps1 -Port 8080
```

Then open:

```text
http://localhost:8080/src/index.html
```
