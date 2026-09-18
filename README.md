# GMMK 3 Companion & Backup Hub

A dedicated, lightweight web application for managing, creating complete backups, and restoring configurations for **Glorious GMMK 3 Series** keyboards running **QMK Firmware** and the **VIA v12 Protocol**.

Compatible with **all GMMK 3 variants** (GMMK 3 65%, GMMK 3 75%, GMMK 3 100%, ANSI & ISO layouts).

---

## 🌐 Multilingual Support (i18n)

- **Default Language**: English (EN)
- **Optional Language**: Polish (PL)
- **Automatic Detection**: Automatically detects browser locale (`navigator.language`) and switches accordingly.
- **Language Switcher**: Dedicated dropdown in the header with persistent preferences (`localStorage`).

---

## 📁 Modular Directory Structure

```text
gmmk3-companion/
├── index.html               # Semantic HTML5 template
├── css/
│   ├── variables.css        # CSS design system tokens (colors, glow, radiuses)
│   ├── layout.css           # Responsive grid, flexbox layout, header & main sections
│   └── components.css       # Glassmorphism cards, buttons, dropzone, chips, language switcher
├── js/
│   ├── app.js               # Main application coordinator
│   ├── i18n.js              # Internationalization dictionary & manager (EN/PL)
│   ├── hid-protocol.js      # Low-level WebHID communication layer (VIA v12 & Raw HID)
│   ├── backup-manager.js    # Serialization and restore engine (100% settings)
│   └── ui-controller.js     # DOM controller, event handling, live color chips, console
└── README.md                # Documentation & Architecture roadmap
```

---

## 🚀 How to Run?

1. Open `index.html` directly in any Chromium-based web browser supporting **WebHID** (Google Chrome, Microsoft Edge, Brave, Opera).
2. Click **"⚡ Connect Keyboard"** and select your GMMK 3 keyboard from the list.
3. Click **"💾 Download Full Backup (.json)"** to export all your settings.
4. To restore, drag & drop your backup file onto the restore area and click **"⚡ Apply Settings to Keyboard"**.

---

## 🗺️ Feature Roadmap (Future Expansions)

- [ ] **Visual Keymap Editor (VIA Overlay)** – Interactive on-screen keyboard matrix allowing real-time keycode remapping.
- [ ] **Dynamic Macro Creator** – In-app text string and keystroke delay recorder.
- [ ] **Real-time Lighting Palette** – Color pickers & sliders for immediate RGB Matrix & Logo LED tuning.
- [ ] **Switch Tester (Key Tester)** – Built-in switch actuation & rotary encoder tester.
