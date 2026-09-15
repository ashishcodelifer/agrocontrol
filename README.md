# AgroControl — Agriculture App Dashboard

A working frontend prototype of the **AgroControl** farm-operations dashboard
(UI inspired by [Phenomenon Studio's shot on Dribbble](https://dribbble.com/shots/27108598-Agriculture-App-Dashboard-UI-AgroControl)).

Built with **vanilla HTML/CSS/JS + Chart.js** — no build step, no backend. All imagery is generated locally, so it is 100% self-contained.

## Features

- **Dashboard** — aerial field map with weather chips, crop-health sparkline, harvest-window donut, workforce/equipment/spend stat cards, equipment readiness cards, and a "Workload: tasks vs capacity" bar chart.
- **Tasks** — Kanban board (Planned / In progress / Completed / Overdue) with **drag & drop**, search, priority filter, list-view toggle with inline status editing, and a working **New task** form.
- **Calendar** — month grid with task events, today highlighting, month navigation, and an upcoming-tasks sidebar.
- **Workers** — searchable card grid with on/off-shift status, skill tags and capacity bars; click any card for a **profile modal** with scatter / workload / radar charts; working **Add worker** form.

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python -m http.server 3000
```

## Deploy to GitHub + Vercel

```bash
# 1. create a repo on github.com, then:
git init
git add .
git commit -m "AgroControl dashboard prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/agrocontrol.git
git push -u origin main
```

Then on Vercel: **Add New → Project → Import** the repo. Vercel auto-detects it as a static site (no build command, output directory = root) and deploys. Every future `git push` redeploys automatically.

## Structure

```
├── index.html          # app shell + all views
├── styles.css          # dark-green glassmorphism design system
├── app.js              # data + rendering + interactions
└── assets/
    ├── fields-map.jpg  # generated aerial field mosaic
    ├── workers/*.jpg   # generated worker portraits
    └── equipment/*.jpg # generated equipment photos
```

## Credits

Design reference: *Agriculture App Dashboard UI – AgroControl* by Phenomenon Product (Phenomenon Studio) on Dribbble. All code and images in this repo are original recreations for portfolio purposes.
