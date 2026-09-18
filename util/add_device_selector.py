target_paths = [
    r"e:\UsersData\doria\OneDrive\klawiatury\gmmk3 100 ansi\gmmk-studio\index.html",
    r"e:\UsersData\doria\OneDrive\klawiatury\gmmk3 100 ansi\qmk_firmware\gmmk-studio\index.html"
]

device_selector_html = """        <!-- Center Device Selector (Top Bar) -->
        <div class="top-bar-center" style="flex: 1; max-width: 440px; margin: 0 1.5rem;">
          <div class="device-selector-wrap" style="position: relative; display: flex; align-items: center;">
            <div class="device-select-icon" style="position: absolute; left: 12px; pointer-events: none; font-size: 1.05rem; z-index: 2;">⌨️</div>
            <select id="deviceSelect" class="form-control device-select-dropdown" style="padding-left: 2.4rem; padding-right: 2.2rem; font-weight: 600; font-size: 0.85rem; height: 38px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-main); width: 100%; cursor: pointer;">
              <option value="" disabled selected>Wyszukiwanie urządzeń...</option>
            </select>
            <button id="btnAddDevice" class="btn btn-icon" title="Dodaj / Połącz nowe urządzenie (+)" style="position: absolute; right: 4px; height: 30px; width: 30px; padding: 0; display: flex; align-items: center; justify-content: center; background: transparent; border: none; font-size: 1.1rem; color: var(--accent-cyan); cursor: pointer;">
              ➕
            </button>
          </div>
        </div>
"""

for p in target_paths:
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()

    if 'id="deviceSelect"' not in content:
        target = '<div class="top-bar-actions">'
        content = content.replace(target, device_selector_html + "\n        " + target)

        with open(p, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Added device selector to {p}")

print("Done updating index.html!")
