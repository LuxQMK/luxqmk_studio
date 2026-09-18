import os

target_path = r"e:\UsersData\doria\OneDrive\klawiatury\gmmk3 100 ansi\gmmk-companion\index.html"
with open(target_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add script tag if not present
if "js/audio-visualizer.js" not in content:
    content = content.replace(
        '<script src="js/lighting-controller.js"></script>',
        '<script src="js/lighting-controller.js"></script>\n  <script src="js/audio-visualizer.js"></script>'
    )

# 2. Add sidebar button if not present
if 'data-view="audio"' not in content:
    sidebar_target = """        <button class="nav-item-btn" data-view="lighting">
          <span class="nav-icon">💡</span>
          <span data-i18n="navLighting">Oświetlenie (Lighting)</span>
        </button>"""
    sidebar_replacement = sidebar_target + """\n\n        <button class="nav-item-btn" data-view="audio">
          <span class="nav-icon">🎵</span>
          <span data-i18n="navAudio">Wizualizer Audio</span>
        </button>"""
    content = content.replace(sidebar_target, sidebar_replacement)

# 3. Add view-audio section if not present
audio_section = """
      <!-- 3. VIEW: AUDIO VISUALIZER (Real-time Spectrum & Beat Reactions) -->
      <section class="view-container" id="view-audio">
        <div class="palette-card" style="max-width: 820px; margin: 0 auto 1.5rem auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.15rem; margin-bottom: 0.25rem;" data-i18n="audioCardTitle">🎵 Wizualizer Dźwięku i Muzyki w Czasie Rzeczywistym</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem;" data-i18n="audioDesc">
                Podświetlenie klawiatury reagujące w czasie rzeczywistym na muzykę (Spotify, YouTube), gry i dźwięki systemowe.
              </p>
            </div>
            <span class="badge-pill" id="audioStatusBadge">Zatrzymany</span>
          </div>

          <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap;">
            <button class="btn btn-primary" id="btnAudioToggle" style="padding: 0.75rem 1.5rem; font-weight: 600;">
              ▶️ Uruchom Wizualizer Audio
            </button>
          </div>

          <div class="grid-2" style="gap: 1.25rem;">
            <div class="form-group">
              <label data-i18n="audioMode">Tryb Wizualizacji (Visualization Mode)</label>
              <select id="audioModeSelect" class="form-control">
                <option value="equalizer" data-i18n="optEqualizer">Korektor Graficzny (Equalizer Spectrum - Słupki)</option>
                <option value="bassPulse" data-i18n="optBassPulse">Pulsowanie Basem (Bass Beat Pulse)</option>
                <option value="audioWave" data-i18n="optAudioWave">Fala Dźwiękowa (Audio Wave Ripples)</option>
                <option value="vuMeter" data-i18n="optVuMeter">Wskaźnik Wysterowania (Stereo VU Meter)</option>
              </select>
            </div>

            <div class="form-group">
              <label data-i18n="audioColorMode">Paleta Kolorów (Color Palette)</label>
              <select id="audioColorModeSelect" class="form-control">
                <option value="rainbow" data-i18n="optColorRainbow">Dynamiczne Spektrum Tęczy (Rainbow)</option>
                <option value="singleColor" data-i18n="optColorSingle">Jednolity Kolor Akcentowy</option>
              </select>
            </div>
          </div>

          <div class="form-group" id="audioSingleColorGroup" style="display: none; margin-top: 1rem;">
            <label>Kolor Efektu Audio</label>
            <div class="color-input-wrap">
              <input type="color" id="audioColorPicker" class="color-picker-input" value="#00ffff">
              <span style="font-size: 0.8rem; color: var(--text-muted);">Barwa błysków i słupków equalizera</span>
            </div>
          </div>

          <div class="form-group" style="margin-top: 1.25rem;">
            <div style="display: flex; justify-content: space-between;">
              <label data-i18n="audioSensitivity">Czułość / Wzmocnienie (Sensitivity Multiplier)</label>
              <span id="audioSensVal" style="font-family: var(--font-mono); color: var(--accent-cyan);">1.2x</span>
            </div>
            <div class="range-slider-wrap">
              <input type="range" id="audioSensitivitySlider" class="range-slider" min="0.5" max="3.0" step="0.1" value="1.2">
            </div>
          </div>
        </div>

        <!-- Desktop Native Background Card (Hidden in Browser, Visible in Electron) -->
        <div class="palette-card" id="desktopAutostartCard" style="display: none; max-width: 820px; margin: 0 auto;">
          <div class="switch-wrap">
            <div>
              <span style="display: block; font-weight: 600; font-size: 0.95rem;" data-i18n="lblAutostart">Autostart z Systemem Windows</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);" data-i18n="lblAutostartHint">
                Aplikacja uruchamia się zminimalizowana w zasobniku systemowym (System Tray) i obsługuje efekty w tle.
              </span>
            </div>
            <label class="switch">
              <input type="checkbox" id="chkDesktopAutostart">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </section>
"""

if 'id="view-audio"' not in content:
    view_target = "<!-- 4. VIEW: ENCODER CONFIGURATION -->"
    content = content.replace(view_target, audio_section + "\n        " + view_target)

with open(target_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated index.html with Audio Visualizer successfully!")
