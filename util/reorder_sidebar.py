import re

target_paths = [
    r"e:\UsersData\doria\OneDrive\klawiatury\gmmk3 100 ansi\gmmk-studio\index.html",
    r"e:\UsersData\doria\OneDrive\klawiatury\gmmk3 100 ansi\qmk_firmware\gmmk-studio\index.html"
]

new_sidebar_nav = """      <nav class="sidebar-nav">
        <button class="nav-item-btn active" data-view="keymap">
          <span class="nav-icon">🎮</span>
          <span data-i18n="navKeymap">Mapowanie Klawiszy</span>
        </button>

        <button class="nav-item-btn" data-view="encoder">
          <span class="nav-icon">🎛️</span>
          <span data-i18n="navEncoder">Pokrętło (Enkoder)</span>
        </button>

        <button class="nav-item-btn" data-view="tester">
          <span class="nav-icon">⌨️</span>
          <span data-i18n="navTester">Tester Klawiszy</span>
        </button>

        <button class="nav-item-btn" data-view="lighting">
          <span class="nav-icon">💡</span>
          <span data-i18n="navLighting">Oświetlenie (Lighting)</span>
        </button>

        <button class="nav-item-btn" data-view="audio">
          <span class="nav-icon">🎵</span>
          <span data-i18n="navAudio">Wizualizer Audio</span>
        </button>

        <button class="nav-item-btn" data-view="backup">
          <span class="nav-icon">💾</span>
          <span data-i18n="navBackup">Profile i Kopia</span>
        </button>

        <button class="nav-item-btn" data-view="settings">
          <span class="nav-icon">⚙️</span>
          <span data-i18n="navSettings">Ustawienia Urządzenia</span>
        </button>
      </nav>"""

for p in target_paths:
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()

    content = re.sub(r'<nav class="sidebar-nav">.*?</nav>', new_sidebar_nav, content, flags=re.DOTALL)

    with open(p, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated sidebar order in {p}")

print("Sidebar reordered successfully!")
