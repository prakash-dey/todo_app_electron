# Manager 💼

A cross-platform sticky-note task manager built with **Electron** and **SQLite**. Organize your tasks as colorful sticky notes with priority levels, privacy modes, and rich text formatting — all stored locally on your machine.

---

## Screenshots

> _Add a screenshot here by placing an image in `assets/` and linking it below._
> `![App Screenshot](assets/screenshot.png)`

---

## Features

- **Sticky-note UI** — each task is displayed as a randomized-color sticky note
- **Priority levels** — High 🔴, Medium 🔵, Low ⚪ with color-coded tape indicators
- **Privacy modes** — Public 🔐 or Private 🔒 per task
- **Status tracking** — Pending 🕑 or Done ✅
- **Rich text formatting** — Bold, Italic, Underline, and Strikethrough (done/cancel styles) in descriptions
- **Live filters** — Filter tasks by priority, mode, and status without page reload
- **Keyboard shortcuts** — `Cmd/Ctrl + Enter` to submit, `Escape` to close the modal
- **Local SQLite database** — data is stored in your OS user-data directory (no cloud, no account)
- **Cross-platform** — runs on macOS, Windows, and Linux

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Electron](https://www.electronjs.org/) v33 |
| Database | [SQLite](https://www.sqlite.org/) via `sqlite3` npm package |
| Frontend | Vanilla HTML / CSS / JavaScript |
| Packaging | [electron-builder](https://www.electron.build/) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later

### Install & Run

```bash
# Clone the repository
git clone https://github.com/prakash-dey/todo_app_electron.git
cd todo_app_electron

# Install dependencies (also rebuilds sqlite3 for your Electron version)
npm install

# Start the app in development mode
npm start
```

### Build for distribution

```bash
# Build for your current platform
npm run build

# Build for a specific platform
npm run build:mac    # → dist/*.dmg
npm run build:win    # → dist/*.exe  (NSIS installer)
npm run build:linux  # → dist/*.AppImage
```

> **Note:** Building for Windows from macOS (and vice versa) requires additional toolchain setup. Native cross-compilation is not supported out of the box.

---

## Adding App Icons

Place the following files in the `assets/` directory before building:

| File | Platform | Recommended size |
|---|---|---|
| `icon.icns` | macOS | 512×512 px (multi-resolution) |
| `icon.ico` | Windows | 256×256 px (multi-resolution) |
| `icon.png` | Linux + window/taskbar | 512×512 px |

Without icons the app runs fine — it will use the default Electron icon.

---

## Project Structure

```
todo_app_electron/
├── main.js          # Electron main process & IPC handlers
├── database.js      # SQLite database access layer
├── renderer.js      # UI logic (runs in Electron renderer)
├── index.html       # App shell & modal markup
├── style.css        # All styles
├── assets/          # App icons (see above)
└── package.json
```

---

## Data Storage

Tasks are stored in a SQLite database file at:

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/Manager/todo.db` |
| Windows | `%APPDATA%\Manager\todo.db` |
| Linux | `~/.config/Manager/todo.db` |

---

## License

ISC — see `package.json`.

---

_Developed with ❤️ by Prakash_
