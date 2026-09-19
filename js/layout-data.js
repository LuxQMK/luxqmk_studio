/**
 * LuxQMK Studio - Universal Physical & Matrix Layout Engine
 * Supports 100%, 96%, 80% TKL, 75%, 65%, 60% (ANSI & ISO)
 * Plus Universal VIA / QMK JSON Layout Parser for all custom keyboards
 */

(function () {
  // Helper to determine key group for styling
  function determineKeyGroup(id, label, x, y, w) {
    const s = String(id || label || "").toUpperCase();
    if (s.startsWith("F") && !s.startsWith("FN") && /^F\d+$/.test(s)) return "func";
    if (s === "ESC" || s === "PAUS" || s === "PAUSE" || s === "SCRL" || s === "PSCR") return "func";
    if (s.startsWith("P") && /^P[0-9]$/.test(s)) return "numpad";
    if (["NUM", "PSLS", "PAST", "PMNS", "PPLS", "PENT", "PDOT", "NUMPAD"].includes(s)) return "numpad";
    if (["INS", "HOME", "PGUP", "DEL", "END", "PGDN", "UP", "DOWN", "LEFT", "RGHT", "RIGHT"].includes(s)) return "nav";
    if (["LSFT", "RSFT", "LCTL", "RCTL", "LALT", "RALT", "LWIN", "RWIN", "FN", "APP", "TAB", "CAPS", "ENT", "ENTER", "BSPC", "BACKSPACE"].includes(s)) return "mod";
    if (/^[0-9]$/.test(s) || s === "GRV" || s === "MINS" || s === "EQL") return "num";
    return "alpha";
  }

  // =========================================================================
  // 1. 100% Full-Size Layouts (ANSI & ISO)
  // =========================================================================
  const LAYOUT_100_ANSI = [
    // Row 0
    { id: "ESC", label: "Esc", matrix: [1, 3], x: 0, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0029 },
    { id: "F1", label: "F1", matrix: [2, 6], x: 2, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003A },
    { id: "F2", label: "F2", matrix: [3, 6], x: 3, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003B },
    { id: "F3", label: "F3", matrix: [3, 1], x: 4, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003C },
    { id: "F4", label: "F4", matrix: [3, 3], x: 5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003D },
    { id: "F5", label: "F5", matrix: [0, 7], x: 6.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003E },
    { id: "F6", label: "F6", matrix: [6, 3], x: 7.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003F },
    { id: "F7", label: "F7", matrix: [7, 1], x: 8.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0040 },
    { id: "F8", label: "F8", matrix: [7, 6], x: 9.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0041 },
    { id: "F9", label: "F9", matrix: [10, 6], x: 11, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0042 },
    { id: "F10", label: "F10", matrix: [10, 7], x: 12, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0043 },
    { id: "F11", label: "F11", matrix: [10, 3], x: 13, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0044 },
    { id: "F12", label: "F12", matrix: [10, 5], x: 14, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0045 },
    { id: "PSCR", label: "PrtSc", matrix: [9, 7], x: 15.25, y: 0, w: 1, h: 1, group: "nav", defaultKeycode: 0x0046 },
    { id: "SCRL", label: "ScrLk", matrix: [10, 0], x: 16.25, y: 0, w: 1, h: 1, group: "nav", defaultKeycode: 0x0047 },
    { id: "PAUS", label: "Pause", matrix: [9, 6], x: 17.25, y: 0, w: 1, h: 1, group: "nav", defaultKeycode: 0x0048 },
    { id: "LOGO_LED", label: "", matrix: [-1, -1], x: 20.75, y: 0.37, w: 0.60, h: 0.26, group: "logo", isLogo: true },
    { id: "KNOB_PRESS", label: "Mute", matrix: [11, 6], x: 21.5, y: 0, w: 1, h: 1, group: "knob", isKnob: true, defaultKeycode: 0x00A8 },

    // Row 1
    { id: "GRV", label: "~ `", matrix: [1, 6], x: 0, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0035 },
    { id: "1", label: "! 1", matrix: [1, 7], x: 1, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x001E },
    { id: "2", label: "@ 2", matrix: [2, 7], x: 2, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x001F },
    { id: "3", label: "# 3", matrix: [3, 7], x: 3, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0020 },
    { id: "4", label: "$ 4", matrix: [4, 7], x: 4, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0021 },
    { id: "5", label: "% 5", matrix: [4, 6], x: 5, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0022 },
    { id: "6", label: "^ 6", matrix: [5, 6], x: 6, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0023 },
    { id: "7", label: "& 7", matrix: [5, 7], x: 7, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0024 },
    { id: "8", label: "* 8", matrix: [6, 7], x: 8, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0025 },
    { id: "9", label: "( 9", matrix: [7, 7], x: 9, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0026 },
    { id: "0", label: ") 0", matrix: [8, 7], x: 10, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0027 },
    { id: "MINS", label: "_ -", matrix: [8, 6], x: 11, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x002D },
    { id: "EQL", label: "+ =", matrix: [6, 6], x: 12, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x002E },
    { id: "BSPC", label: "Bksp", matrix: [10, 1], x: 13, y: 1.25, w: 2, h: 1, group: "mod", defaultKeycode: 0x002A },
    { id: "INS", label: "Ins", matrix: [7, 5], x: 15.25, y: 1.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0049 },
    { id: "HOME", label: "Home", matrix: [0, 2], x: 16.25, y: 1.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004A },
    { id: "PGUP", label: "PgUp", matrix: [1, 5], x: 17.25, y: 1.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004B },
    { id: "NUM", label: "Num", matrix: [11, 4], x: 18.5, y: 1.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0053 },
    { id: "PSLS", label: "/", matrix: [12, 4], x: 19.5, y: 1.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0054 },
    { id: "PAST", label: "*", matrix: [13, 4], x: 20.5, y: 1.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0055 },
    { id: "PMNS", label: "-", matrix: [13, 5], x: 21.5, y: 1.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0056 },

    // Row 2
    { id: "TAB", label: "Tab", matrix: [1, 1], x: 0, y: 2.25, w: 1.5, h: 1, group: "mod", defaultKeycode: 0x002B },
    { id: "Q", label: "Q", matrix: [1, 0], x: 1.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0014 },
    { id: "W", label: "W", matrix: [2, 0], x: 2.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001A },
    { id: "E", label: "E", matrix: [3, 0], x: 3.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0008 },
    { id: "R", label: "R", matrix: [4, 0], x: 4.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0015 },
    { id: "T", label: "T", matrix: [4, 1], x: 5.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0017 },
    { id: "Y", label: "Y", matrix: [5, 1], x: 6.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001C },
    { id: "U", label: "U", matrix: [5, 0], x: 7.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0018 },
    { id: "I", label: "I", matrix: [6, 0], x: 8.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000C },
    { id: "O", label: "O", matrix: [7, 0], x: 9.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0012 },
    { id: "P", label: "P", matrix: [8, 0], x: 10.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0013 },
    { id: "LBRC", label: "{ [", matrix: [8, 1], x: 11.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x002F },
    { id: "RBRC", label: "} ]", matrix: [6, 1], x: 12.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0030 },
    { id: "BSLS", label: "| \\", matrix: [10, 2], x: 13.5, y: 2.25, w: 1.5, h: 1, group: "alpha", defaultKeycode: 0x0031 },
    { id: "DEL", label: "Del", matrix: [6, 5], x: 15.25, y: 2.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004C },
    { id: "END", label: "End", matrix: [12, 6], x: 16.25, y: 2.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004D },
    { id: "PGDN", label: "PgDn", matrix: [2, 5], x: 17.25, y: 2.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004E },
    { id: "P7", label: "7", matrix: [11, 0], x: 18.5, y: 2.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x005F },
    { id: "P8", label: "8", matrix: [12, 0], x: 19.5, y: 2.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0060 },
    { id: "P9", label: "9", matrix: [13, 0], x: 20.5, y: 2.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0061 },
    { id: "PPLS", label: "+", matrix: [11, 3], x: 21.5, y: 2.25, w: 1, h: 2, group: "numpad", defaultKeycode: 0x0057 },

    // Row 3
    { id: "CAPS", label: "Caps", matrix: [2, 1], x: 0, y: 3.25, w: 1.75, h: 1, group: "mod", defaultKeycode: 0x0039 },
    { id: "A", label: "A", matrix: [1, 2], x: 1.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0004 },
    { id: "S", label: "S", matrix: [2, 2], x: 2.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0016 },
    { id: "D", label: "D", matrix: [3, 2], x: 3.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0007 },
    { id: "F", label: "F", matrix: [4, 2], x: 4.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0009 },
    { id: "G", label: "G", matrix: [4, 3], x: 5.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000A },
    { id: "H", label: "H", matrix: [5, 3], x: 6.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000B },
    { id: "J", label: "J", matrix: [5, 2], x: 7.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000D },
    { id: "K", label: "K", matrix: [6, 2], x: 8.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000E },
    { id: "L", label: "L", matrix: [7, 2], x: 9.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000F },
    { id: "SCLN", label: ": ;", matrix: [8, 2], x: 10.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0033 },
    { id: "QUOT", label: "\" '", matrix: [8, 3], x: 11.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0034 },
    { id: "ENT", label: "Enter", matrix: [10, 4], x: 12.75, y: 3.25, w: 2.25, h: 1, group: "mod", defaultKeycode: 0x0028 },
    { id: "P4", label: "4", matrix: [11, 1], x: 18.5, y: 3.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x005C },
    { id: "P5", label: "5", matrix: [12, 1], x: 19.5, y: 3.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x005D },
    { id: "P6", label: "6", matrix: [13, 1], x: 20.5, y: 3.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x005E },

    // Row 4
    { id: "LSFT", label: "Shift", matrix: [0, 0], x: 0, y: 4.25, w: 2.25, h: 1, group: "mod", defaultKeycode: 0x00E1 },
    { id: "Z", label: "Z", matrix: [1, 4], x: 2.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001D },
    { id: "X", label: "X", matrix: [2, 4], x: 3.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001B },
    { id: "C", label: "C", matrix: [3, 4], x: 4.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0006 },
    { id: "V", label: "V", matrix: [4, 4], x: 5.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0019 },
    { id: "B", label: "B", matrix: [4, 5], x: 6.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0005 },
    { id: "N", label: "N", matrix: [5, 5], x: 7.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0011 },
    { id: "M", label: "M", matrix: [5, 4], x: 8.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0010 },
    { id: "COMM", label: "< ,", matrix: [6, 4], x: 9.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0036 },
    { id: "DOT", label: "> .", matrix: [7, 4], x: 10.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0037 },
    { id: "SLSH", label: "? /", matrix: [8, 5], x: 11.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0038 },
    { id: "RSFT", label: "Shift", matrix: [9, 1], x: 12.25, y: 4.25, w: 2.75, h: 1, group: "mod", defaultKeycode: 0x00E5 },
    { id: "UP", label: "▲", matrix: [3, 5], x: 16.25, y: 4.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0052 },
    { id: "P1", label: "1", matrix: [11, 2], x: 18.5, y: 4.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0059 },
    { id: "P2", label: "2", matrix: [12, 2], x: 19.5, y: 4.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x005A },
    { id: "P3", label: "3", matrix: [13, 2], x: 20.5, y: 4.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x005B },
    { id: "PENT", label: "Enter", matrix: [13, 6], x: 21.5, y: 4.25, w: 1, h: 2, group: "numpad", defaultKeycode: 0x0058 },

    // Row 5
    { id: "LCTL", label: "Ctrl", matrix: [0, 6], x: 0, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E0 },
    { id: "LWIN", label: "Win", matrix: [9, 0], x: 1.25, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E3 },
    { id: "LALT", label: "Alt", matrix: [9, 3], x: 2.5, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E2 },
    { id: "SPC", label: "Space", matrix: [9, 4], x: 3.75, y: 5.25, w: 6.25, h: 1, group: "alpha", defaultKeycode: 0x002C },
    { id: "RALT", label: "Alt", matrix: [9, 5], x: 10, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E6 },
    { id: "FN", label: "Fn", matrix: [9, 2], x: 11.25, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x5201 },
    { id: "APP", label: "Menu", matrix: [8, 4], x: 12.5, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x0065 },
    { id: "RCTL", label: "Ctrl", matrix: [0, 4], x: 13.75, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E4 },
    { id: "LEFT", label: "◀", matrix: [0, 3], x: 15.25, y: 5.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0050 },
    { id: "DOWN", label: "▼", matrix: [7, 3], x: 16.25, y: 5.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0051 },
    { id: "RGHT", label: "▶", matrix: [0, 5], x: 17.25, y: 5.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004F },
    { id: "P0", label: "0", matrix: [12, 3], x: 18.5, y: 5.25, w: 2, h: 1, group: "numpad", defaultKeycode: 0x0062 },
    { id: "PDOT", label: ".", matrix: [13, 3], x: 20.5, y: 5.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0063 }
  ];

  // =========================================================================
  // 2. 75% Compact Layouts (ANSI & ISO) - GMMK 3 75% / Keychron Q1 / GMMK Pro
  // =========================================================================
  const LAYOUT_75_ANSI = [
    // Row 0: F-Row & Knob (16u width)
    { id: "ESC", label: "Esc", matrix: [1, 3], x: 0, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0029 },
    { id: "F1", label: "F1", matrix: [2, 6], x: 1.25, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003A },
    { id: "F2", label: "F2", matrix: [3, 6], x: 2.25, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003B },
    { id: "F3", label: "F3", matrix: [3, 1], x: 3.25, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003C },
    { id: "F4", label: "F4", matrix: [3, 3], x: 4.25, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003D },
    { id: "F5", label: "F5", matrix: [0, 7], x: 5.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003E },
    { id: "F6", label: "F6", matrix: [6, 3], x: 6.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003F },
    { id: "F7", label: "F7", matrix: [7, 1], x: 7.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0040 },
    { id: "F8", label: "F8", matrix: [7, 6], x: 8.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0041 },
    { id: "F9", label: "F9", matrix: [10, 6], x: 9.75, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0042 },
    { id: "F10", label: "F10", matrix: [10, 7], x: 10.75, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0043 },
    { id: "F11", label: "F11", matrix: [10, 3], x: 11.75, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0044 },
    { id: "F12", label: "F12", matrix: [10, 5], x: 12.75, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0045 },
    { id: "LOGO_LED", label: "", matrix: [-1, -1], x: 14.1, y: 0.37, w: 0.55, h: 0.26, group: "logo", isLogo: true },
    { id: "KNOB_PRESS", label: "Mute", matrix: [11, 6], x: 15, y: 0, w: 1, h: 1, group: "knob", isKnob: true, defaultKeycode: 0x00A8 },

    // Row 1
    { id: "GRV", label: "~ `", matrix: [1, 6], x: 0, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0035 },
    { id: "1", label: "! 1", matrix: [1, 7], x: 1, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x001E },
    { id: "2", label: "@ 2", matrix: [2, 7], x: 2, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x001F },
    { id: "3", label: "# 3", matrix: [3, 7], x: 3, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0020 },
    { id: "4", label: "$ 4", matrix: [4, 7], x: 4, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0021 },
    { id: "5", label: "% 5", matrix: [4, 6], x: 5, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0022 },
    { id: "6", label: "^ 6", matrix: [5, 6], x: 6, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0023 },
    { id: "7", label: "& 7", matrix: [5, 7], x: 7, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0024 },
    { id: "8", label: "* 8", matrix: [6, 7], x: 8, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0025 },
    { id: "9", label: "( 9", matrix: [7, 7], x: 9, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0026 },
    { id: "0", label: ") 0", matrix: [8, 7], x: 10, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0027 },
    { id: "MINS", label: "_ -", matrix: [8, 6], x: 11, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x002D },
    { id: "EQL", label: "+ =", matrix: [6, 6], x: 12, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x002E },
    { id: "BSPC", label: "Bksp", matrix: [10, 1], x: 13, y: 1.25, w: 2, h: 1, group: "mod", defaultKeycode: 0x002A },
    { id: "DEL", label: "Del", matrix: [6, 5], x: 15, y: 1.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004C },

    // Row 2
    { id: "TAB", label: "Tab", matrix: [1, 1], x: 0, y: 2.25, w: 1.5, h: 1, group: "mod", defaultKeycode: 0x002B },
    { id: "Q", label: "Q", matrix: [1, 0], x: 1.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0014 },
    { id: "W", label: "W", matrix: [2, 0], x: 2.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001A },
    { id: "E", label: "E", matrix: [3, 0], x: 3.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0008 },
    { id: "R", label: "R", matrix: [4, 0], x: 4.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0015 },
    { id: "T", label: "T", matrix: [4, 1], x: 5.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0017 },
    { id: "Y", label: "Y", matrix: [5, 1], x: 6.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001C },
    { id: "U", label: "U", matrix: [5, 0], x: 7.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0018 },
    { id: "I", label: "I", matrix: [6, 0], x: 8.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000C },
    { id: "O", label: "O", matrix: [7, 0], x: 9.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0012 },
    { id: "P", label: "P", matrix: [8, 0], x: 10.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0013 },
    { id: "LBRC", label: "{ [", matrix: [8, 1], x: 11.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x002F },
    { id: "RBRC", label: "} ]", matrix: [6, 1], x: 12.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0030 },
    { id: "BSLS", label: "| \\", matrix: [10, 2], x: 13.5, y: 2.25, w: 1.5, h: 1, group: "alpha", defaultKeycode: 0x0031 },
    { id: "PGUP", label: "PgUp", matrix: [1, 5], x: 15, y: 2.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004B },

    // Row 3
    { id: "CAPS", label: "Caps", matrix: [2, 1], x: 0, y: 3.25, w: 1.75, h: 1, group: "mod", defaultKeycode: 0x0039 },
    { id: "A", label: "A", matrix: [1, 2], x: 1.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0004 },
    { id: "S", label: "S", matrix: [2, 2], x: 2.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0016 },
    { id: "D", label: "D", matrix: [3, 2], x: 3.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0007 },
    { id: "F", label: "F", matrix: [4, 2], x: 4.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0009 },
    { id: "G", label: "G", matrix: [4, 3], x: 5.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000A },
    { id: "H", label: "H", matrix: [5, 3], x: 6.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000B },
    { id: "J", label: "J", matrix: [5, 2], x: 7.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000D },
    { id: "K", label: "K", matrix: [6, 2], x: 8.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000E },
    { id: "L", label: "L", matrix: [7, 2], x: 9.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000F },
    { id: "SCLN", label: ": ;", matrix: [8, 2], x: 10.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0033 },
    { id: "QUOT", label: "\" '", matrix: [8, 3], x: 11.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0034 },
    { id: "ENT", label: "Enter", matrix: [10, 4], x: 12.75, y: 3.25, w: 2.25, h: 1, group: "mod", defaultKeycode: 0x0028 },
    { id: "PGDN", label: "PgDn", matrix: [2, 5], x: 15, y: 3.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004E },

    // Row 4
    { id: "LSFT", label: "Shift", matrix: [0, 0], x: 0, y: 4.25, w: 2.25, h: 1, group: "mod", defaultKeycode: 0x00E1 },
    { id: "Z", label: "Z", matrix: [1, 4], x: 2.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001D },
    { id: "X", label: "X", matrix: [2, 4], x: 3.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001B },
    { id: "C", label: "C", matrix: [3, 4], x: 4.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0006 },
    { id: "V", label: "V", matrix: [4, 4], x: 5.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0019 },
    { id: "B", label: "B", matrix: [4, 5], x: 6.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0005 },
    { id: "N", label: "N", matrix: [5, 5], x: 7.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0011 },
    { id: "M", label: "M", matrix: [5, 4], x: 8.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0010 },
    { id: "COMM", label: "< ,", matrix: [6, 4], x: 9.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0036 },
    { id: "DOT", label: "> .", matrix: [7, 4], x: 10.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0037 },
    { id: "SLSH", label: "? /", matrix: [8, 5], x: 11.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0038 },
    { id: "RSFT", label: "Shift", matrix: [9, 1], x: 12.25, y: 4.25, w: 1.75, h: 1, group: "mod", defaultKeycode: 0x00E5 },
    { id: "UP", label: "▲", matrix: [3, 5], x: 14, y: 4.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0052 },
    { id: "END", label: "End", matrix: [12, 6], x: 15, y: 4.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004D },

    // Row 5
    { id: "LCTL", label: "Ctrl", matrix: [0, 6], x: 0, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E0 },
    { id: "LWIN", label: "Win", matrix: [9, 0], x: 1.25, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E3 },
    { id: "LALT", label: "Alt", matrix: [9, 3], x: 2.5, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E2 },
    { id: "SPC", label: "Space", matrix: [9, 4], x: 3.75, y: 5.25, w: 6.25, h: 1, group: "alpha", defaultKeycode: 0x002C },
    { id: "RALT", label: "Alt", matrix: [9, 5], x: 10, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E6 },
    { id: "FN", label: "Fn", matrix: [9, 2], x: 11.25, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x5201 },
    { id: "LEFT", label: "◀", matrix: [0, 3], x: 13, y: 5.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0050 },
    { id: "DOWN", label: "▼", matrix: [7, 3], x: 14, y: 5.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0051 },
    { id: "RGHT", label: "▶", matrix: [0, 5], x: 15, y: 5.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004F }
  ];

  // =========================================================================
  // 3. 65% Mini Layouts (ANSI & ISO) - GMMK 3 65% / GMMK 2 65% / Keychron Q2
  // =========================================================================
  const LAYOUT_65_ANSI = [
    // Row 0 (Esc + Numbers + Bksp + Del)
    { id: "ESC", label: "Esc", matrix: [1, 6], x: 0, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0029 },
    { id: "1", label: "! 1", matrix: [1, 7], x: 1, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x001E },
    { id: "2", label: "@ 2", matrix: [2, 7], x: 2, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x001F },
    { id: "3", label: "# 3", matrix: [3, 7], x: 3, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0020 },
    { id: "4", label: "$ 4", matrix: [4, 7], x: 4, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0021 },
    { id: "5", label: "% 5", matrix: [4, 6], x: 5, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0022 },
    { id: "6", label: "^ 6", matrix: [5, 6], x: 6, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0023 },
    { id: "7", label: "& 7", matrix: [5, 7], x: 7, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0024 },
    { id: "8", label: "* 8", matrix: [6, 7], x: 8, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0025 },
    { id: "9", label: "( 9", matrix: [7, 7], x: 9, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0026 },
    { id: "0", label: ") 0", matrix: [8, 7], x: 10, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0027 },
    { id: "MINS", label: "_ -", matrix: [8, 6], x: 11, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x002D },
    { id: "EQL", label: "+ =", matrix: [6, 6], x: 12, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x002E },
    { id: "BSPC", label: "Bksp", matrix: [10, 1], x: 13, y: 0, w: 2, h: 1, group: "mod", defaultKeycode: 0x002A },
    { id: "LOGO_LED", label: "", matrix: [-1, -1], x: 14.1, y: 0.37, w: 0.55, h: 0.26, group: "logo", isLogo: true },
    { id: "DEL", label: "Del", matrix: [11, 6], x: 15, y: 0, w: 1, h: 1, group: "nav", defaultKeycode: 0x004C },

    // Row 1
    { id: "TAB", label: "Tab", matrix: [1, 1], x: 0, y: 1, w: 1.5, h: 1, group: "mod", defaultKeycode: 0x002B },
    { id: "Q", label: "Q", matrix: [1, 0], x: 1.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0014 },
    { id: "W", label: "W", matrix: [2, 0], x: 2.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001A },
    { id: "E", label: "E", matrix: [3, 0], x: 3.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0008 },
    { id: "R", label: "R", matrix: [4, 0], x: 4.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0015 },
    { id: "T", label: "T", matrix: [4, 1], x: 5.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0017 },
    { id: "Y", label: "Y", matrix: [5, 1], x: 6.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001C },
    { id: "U", label: "U", matrix: [5, 0], x: 7.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0018 },
    { id: "I", label: "I", matrix: [6, 0], x: 8.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000C },
    { id: "O", label: "O", matrix: [7, 0], x: 9.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0012 },
    { id: "P", label: "P", matrix: [8, 0], x: 10.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0013 },
    { id: "LBRC", label: "{ [", matrix: [8, 1], x: 11.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x002F },
    { id: "RBRC", label: "} ]", matrix: [6, 1], x: 12.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0030 },
    { id: "BSLS", label: "| \\", matrix: [10, 2], x: 13.5, y: 1, w: 1.5, h: 1, group: "alpha", defaultKeycode: 0x0031 },
    { id: "PGUP", label: "PgUp", matrix: [1, 5], x: 15, y: 1, w: 1, h: 1, group: "nav", defaultKeycode: 0x004B },

    // Row 2
    { id: "CAPS", label: "Caps", matrix: [2, 1], x: 0, y: 2, w: 1.75, h: 1, group: "mod", defaultKeycode: 0x0039 },
    { id: "A", label: "A", matrix: [1, 2], x: 1.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0004 },
    { id: "S", label: "S", matrix: [2, 2], x: 2.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0016 },
    { id: "D", label: "D", matrix: [3, 2], x: 3.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0007 },
    { id: "F", label: "F", matrix: [4, 2], x: 4.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0009 },
    { id: "G", label: "G", matrix: [4, 3], x: 5.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000A },
    { id: "H", label: "H", matrix: [5, 3], x: 6.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000B },
    { id: "J", label: "J", matrix: [5, 2], x: 7.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000D },
    { id: "K", label: "K", matrix: [6, 2], x: 8.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000E },
    { id: "L", label: "L", matrix: [7, 2], x: 9.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000F },
    { id: "SCLN", label: ": ;", matrix: [8, 2], x: 10.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0033 },
    { id: "QUOT", label: "\" '", matrix: [8, 3], x: 11.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0034 },
    { id: "ENT", label: "Enter", matrix: [10, 4], x: 12.75, y: 2, w: 2.25, h: 1, group: "mod", defaultKeycode: 0x0028 },
    { id: "PGDN", label: "PgDn", matrix: [2, 5], x: 15, y: 2, w: 1, h: 1, group: "nav", defaultKeycode: 0x004E },

    // Row 3
    { id: "LSFT", label: "Shift", matrix: [0, 0], x: 0, y: 3, w: 2.25, h: 1, group: "mod", defaultKeycode: 0x00E1 },
    { id: "Z", label: "Z", matrix: [1, 4], x: 2.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001D },
    { id: "X", label: "X", matrix: [2, 4], x: 3.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001B },
    { id: "C", label: "C", matrix: [3, 4], x: 4.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0006 },
    { id: "V", label: "V", matrix: [4, 4], x: 5.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0019 },
    { id: "B", label: "B", matrix: [4, 5], x: 6.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0005 },
    { id: "N", label: "N", matrix: [5, 5], x: 7.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0011 },
    { id: "M", label: "M", matrix: [5, 4], x: 8.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0010 },
    { id: "COMM", label: "< ,", matrix: [6, 4], x: 9.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0036 },
    { id: "DOT", label: "> .", matrix: [7, 4], x: 10.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0037 },
    { id: "SLSH", label: "? /", matrix: [8, 5], x: 11.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0038 },
    { id: "RSFT", label: "Shift", matrix: [9, 1], x: 12.25, y: 4.25, w: 1.75, h: 1, group: "mod", defaultKeycode: 0x00E5 },
    { id: "UP", label: "▲", matrix: [3, 5], x: 14, y: 3, w: 1, h: 1, group: "nav", defaultKeycode: 0x0052 },
    { id: "END", label: "End", matrix: [2, 5], x: 15, y: 3, w: 1, h: 1, group: "nav", defaultKeycode: 0x004D },

    // Row 4
    { id: "LCTL", label: "Ctrl", matrix: [0, 6], x: 0, y: 4, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E0 },
    { id: "LWIN", label: "Win", matrix: [9, 0], x: 1.25, y: 4, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E3 },
    { id: "LALT", label: "Alt", matrix: [9, 3], x: 2.5, y: 4, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E2 },
    { id: "SPC", label: "Space", matrix: [9, 4], x: 3.75, y: 4, w: 6.25, h: 1, group: "alpha", defaultKeycode: 0x002C },
    { id: "RALT", label: "Alt", matrix: [9, 5], x: 10, y: 4, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E6 },
    { id: "FN", label: "Fn", matrix: [9, 2], x: 11.25, y: 4, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x5201 },
    { id: "LEFT", label: "◀", matrix: [0, 3], x: 13, y: 4, w: 1, h: 1, group: "nav", defaultKeycode: 0x0050 },
    { id: "DOWN", label: "▼", matrix: [7, 3], x: 14, y: 4, w: 1, h: 1, group: "nav", defaultKeycode: 0x0051 },
    { id: "RGHT", label: "▶", matrix: [0, 5], x: 15, y: 4, w: 1, h: 1, group: "nav", defaultKeycode: 0x004F }
  ];

  // =========================================================================
  // 4. 96% Compact Layouts (GMMK 2 96% / Keychron Q5)
  // =========================================================================
  const LAYOUT_96_ANSI = [
    // Row 0: F-Row & Del (19u width)
    { id: "ESC", label: "Esc", matrix: [0, 0], x: 0, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0029 },
    { id: "F1", label: "F1", matrix: [1, 0], x: 1.25, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003A },
    { id: "F2", label: "F2", matrix: [2, 0], x: 2.25, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003B },
    { id: "F3", label: "F3", matrix: [3, 0], x: 3.25, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003C },
    { id: "F4", label: "F4", matrix: [4, 0], x: 4.25, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003D },
    { id: "F5", label: "F5", matrix: [5, 0], x: 5.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003E },
    { id: "F6", label: "F6", matrix: [6, 0], x: 6.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003F },
    { id: "F7", label: "F7", matrix: [7, 0], x: 7.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0040 },
    { id: "F8", label: "F8", matrix: [8, 0], x: 8.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0041 },
    { id: "F9", label: "F9", matrix: [9, 0], x: 9.75, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0042 },
    { id: "F10", label: "F10", matrix: [10, 0], x: 10.75, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0043 },
    { id: "F11", label: "F11", matrix: [11, 0], x: 11.75, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0044 },
    { id: "F12", label: "F12", matrix: [12, 0], x: 12.75, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0045 },
    { id: "DEL", label: "Del", matrix: [13, 0], x: 14, y: 0, w: 1, h: 1, group: "nav", defaultKeycode: 0x004C },
    { id: "NUM", label: "Num", matrix: [0, 6], x: 15.25, y: 0, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0053 },
    { id: "PSLS", label: "/", matrix: [1, 6], x: 16.25, y: 0, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0054 },
    { id: "PAST", label: "*", matrix: [2, 6], x: 17.25, y: 0, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0055 },
    { id: "PMNS", label: "-", matrix: [3, 6], x: 18.25, y: 0, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0056 },

    // Row 1
    { id: "GRV", label: "~ `", matrix: [0, 1], x: 0, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0035 },
    { id: "1", label: "! 1", matrix: [1, 1], x: 1, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x001E },
    { id: "2", label: "@ 2", matrix: [2, 1], x: 2, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x001F },
    { id: "3", label: "# 3", matrix: [3, 1], x: 3, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0020 },
    { id: "4", label: "$ 4", matrix: [4, 1], x: 4, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0021 },
    { id: "5", label: "% 5", matrix: [5, 1], x: 5, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0022 },
    { id: "6", label: "^ 6", matrix: [6, 1], x: 6, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0023 },
    { id: "7", label: "& 7", matrix: [7, 1], x: 7, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0024 },
    { id: "8", label: "* 8", matrix: [8, 1], x: 8, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0025 },
    { id: "9", label: "( 9", matrix: [9, 1], x: 9, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0026 },
    { id: "0", label: ") 0", matrix: [10, 1], x: 10, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0027 },
    { id: "MINS", label: "_ -", matrix: [11, 1], x: 11, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x002D },
    { id: "EQL", label: "+ =", matrix: [12, 1], x: 12, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x002E },
    { id: "BSPC", label: "Bksp", matrix: [13, 1], x: 13, y: 1.25, w: 2, h: 1, group: "mod", defaultKeycode: 0x002A },
    { id: "P7", label: "7", matrix: [5, 6], x: 15.25, y: 1.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x005F },
    { id: "P8", label: "8", matrix: [6, 6], x: 16.25, y: 1.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0060 },
    { id: "P9", label: "9", matrix: [7, 6], x: 17.25, y: 1.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0061 },
    { id: "PPLS", label: "+", matrix: [4, 6], x: 18.25, y: 1.25, w: 1, h: 2, group: "numpad", defaultKeycode: 0x0057 },

    // Row 2
    { id: "TAB", label: "Tab", matrix: [0, 2], x: 0, y: 2.25, w: 1.5, h: 1, group: "mod", defaultKeycode: 0x002B },
    { id: "Q", label: "Q", matrix: [1, 2], x: 1.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0014 },
    { id: "W", label: "W", matrix: [2, 2], x: 2.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001A },
    { id: "E", label: "E", matrix: [3, 2], x: 3.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0008 },
    { id: "R", label: "R", matrix: [4, 2], x: 4.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0015 },
    { id: "T", label: "T", matrix: [5, 2], x: 5.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0017 },
    { id: "Y", label: "Y", matrix: [6, 2], x: 6.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001C },
    { id: "U", label: "U", matrix: [7, 2], x: 7.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0018 },
    { id: "I", label: "I", matrix: [8, 2], x: 8.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000C },
    { id: "O", label: "O", matrix: [9, 2], x: 9.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0012 },
    { id: "P", label: "P", matrix: [10, 2], x: 10.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0013 },
    { id: "LBRC", label: "{ [", matrix: [11, 2], x: 11.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x002F },
    { id: "RBRC", label: "} ]", matrix: [12, 2], x: 12.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0030 },
    { id: "BSLS", label: "| \\", matrix: [13, 2], x: 13.5, y: 2.25, w: 1.5, h: 1, group: "alpha", defaultKeycode: 0x0031 },
    { id: "P4", label: "4", matrix: [8, 6], x: 15.25, y: 2.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x005C },
    { id: "P5", label: "5", matrix: [9, 6], x: 16.25, y: 2.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x005D },
    { id: "P6", label: "6", matrix: [10, 6], x: 17.25, y: 2.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x005E },

    // Row 3
    { id: "CAPS", label: "Caps", matrix: [0, 3], x: 0, y: 3.25, w: 1.75, h: 1, group: "mod", defaultKeycode: 0x0039 },
    { id: "A", label: "A", matrix: [1, 3], x: 1.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0004 },
    { id: "S", label: "S", matrix: [2, 3], x: 2.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0016 },
    { id: "D", label: "D", matrix: [3, 3], x: 3.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0007 },
    { id: "F", label: "F", matrix: [4, 3], x: 4.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0009 },
    { id: "G", label: "G", matrix: [5, 3], x: 5.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000A },
    { id: "H", label: "H", matrix: [6, 3], x: 6.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000B },
    { id: "J", label: "J", matrix: [7, 3], x: 7.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000D },
    { id: "K", label: "K", matrix: [8, 3], x: 8.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000E },
    { id: "L", label: "L", matrix: [9, 3], x: 9.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000F },
    { id: "SCLN", label: ": ;", matrix: [10, 3], x: 10.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0033 },
    { id: "QUOT", label: "\" '", matrix: [11, 3], x: 11.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0034 },
    { id: "ENT", label: "Enter", matrix: [12, 3], x: 12.75, y: 3.25, w: 2.25, h: 1, group: "mod", defaultKeycode: 0x0028 },
    { id: "P1", label: "1", matrix: [11, 6], x: 15.25, y: 3.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0059 },
    { id: "P2", label: "2", matrix: [12, 6], x: 16.25, y: 3.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x005A },
    { id: "P3", label: "3", matrix: [13, 6], x: 17.25, y: 3.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x005B },
    { id: "PENT", label: "Enter", matrix: [0, 7], x: 18.25, y: 3.25, w: 1, h: 2, group: "numpad", defaultKeycode: 0x0058 },

    // Row 4
    { id: "LSFT", label: "Shift", matrix: [0, 4], x: 0, y: 4.25, w: 2.25, h: 1, group: "mod", defaultKeycode: 0x00E1 },
    { id: "Z", label: "Z", matrix: [1, 4], x: 2.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001D },
    { id: "X", label: "X", matrix: [2, 4], x: 3.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001B },
    { id: "C", label: "C", matrix: [3, 4], x: 4.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0006 },
    { id: "V", label: "V", matrix: [4, 4], x: 5.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0019 },
    { id: "B", label: "B", matrix: [5, 4], x: 6.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0005 },
    { id: "N", label: "N", matrix: [6, 4], x: 7.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0011 },
    { id: "M", label: "M", matrix: [7, 4], x: 8.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0010 },
    { id: "COMM", label: "< ,", matrix: [8, 4], x: 9.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0036 },
    { id: "DOT", label: "> .", matrix: [9, 4], x: 10.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0037 },
    { id: "SLSH", label: "? /", matrix: [10, 4], x: 11.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0038 },
    { id: "RSFT", label: "Shift", matrix: [11, 4], x: 12.25, y: 4.25, w: 1.75, h: 1, group: "mod", defaultKeycode: 0x00E5 },
    { id: "UP", label: "▲", matrix: [12, 4], x: 14.125, y: 4.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0052 },
    { id: "P0", label: "0", matrix: [1, 7], x: 15.25, y: 4.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0062 },
    { id: "PDOT", label: ".", matrix: [2, 7], x: 16.25, y: 4.25, w: 1, h: 1, group: "numpad", defaultKeycode: 0x0063 },

    // Row 5
    { id: "LCTL", label: "Ctrl", matrix: [0, 5], x: 0, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E0 },
    { id: "LWIN", label: "Win", matrix: [1, 5], x: 1.25, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E3 },
    { id: "LALT", label: "Alt", matrix: [2, 5], x: 2.5, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E2 },
    { id: "SPC", label: "Space", matrix: [6, 5], x: 3.75, y: 5.25, w: 6.25, h: 1, group: "alpha", defaultKeycode: 0x002C },
    { id: "RALT", label: "Alt", matrix: [9, 5], x: 10, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E6 },
    { id: "FN", label: "Fn", matrix: [10, 5], x: 11.25, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x5201 },
    { id: "LEFT", label: "◀", matrix: [11, 5], x: 13.125, y: 5.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0050 },
    { id: "DOWN", label: "▼", matrix: [12, 5], x: 14.125, y: 5.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0051 },
    { id: "RGHT", label: "▶", matrix: [13, 5], x: 15.125, y: 5.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004F }
  ];

  // =========================================================================
  // 5. 80% Tenkeyless Layout (TKL ANSI) - GMMK TKL / Keychron Q3
  // =========================================================================
  const LAYOUT_TKL_ANSI = [
    // Row 0: F-Row & Nav cluster (18.25u width)
    { id: "ESC", label: "Esc", matrix: [0, 0], x: 0, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0029 },
    { id: "F1", label: "F1", matrix: [0, 1], x: 2, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003A },
    { id: "F2", label: "F2", matrix: [0, 2], x: 3, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003B },
    { id: "F3", label: "F3", matrix: [0, 3], x: 4, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003C },
    { id: "F4", label: "F4", matrix: [0, 4], x: 5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003D },
    { id: "F5", label: "F5", matrix: [0, 5], x: 6.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003E },
    { id: "F6", label: "F6", matrix: [0, 6], x: 7.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x003F },
    { id: "F7", label: "F7", matrix: [0, 7], x: 8.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0040 },
    { id: "F8", label: "F8", matrix: [0, 8], x: 9.5, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0041 },
    { id: "F9", label: "F9", matrix: [0, 9], x: 11, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0042 },
    { id: "F10", label: "F10", matrix: [0, 10], x: 12, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0043 },
    { id: "F11", label: "F11", matrix: [0, 11], x: 13, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0044 },
    { id: "F12", label: "F12", matrix: [0, 12], x: 14, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0045 },
    { id: "PSCR", label: "PrtSc", matrix: [0, 13], x: 15.25, y: 0, w: 1, h: 1, group: "nav", defaultKeycode: 0x0046 },
    { id: "SCRL", label: "ScrLk", matrix: [0, 14], x: 16.25, y: 0, w: 1, h: 1, group: "nav", defaultKeycode: 0x0047 },
    { id: "PAUS", label: "Pause", matrix: [0, 15], x: 17.25, y: 0, w: 1, h: 1, group: "nav", defaultKeycode: 0x0048 },

    // Row 1
    { id: "GRV", label: "~ `", matrix: [1, 0], x: 0, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0035 },
    { id: "1", label: "! 1", matrix: [1, 1], x: 1, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x001E },
    { id: "2", label: "@ 2", matrix: [1, 2], x: 2, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x001F },
    { id: "3", label: "# 3", matrix: [1, 3], x: 3, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0020 },
    { id: "4", label: "$ 4", matrix: [1, 4], x: 4, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0021 },
    { id: "5", label: "% 5", matrix: [1, 5], x: 5, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0022 },
    { id: "6", label: "^ 6", matrix: [1, 6], x: 6, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0023 },
    { id: "7", label: "& 7", matrix: [1, 7], x: 7, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0024 },
    { id: "8", label: "* 8", matrix: [1, 8], x: 8, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0025 },
    { id: "9", label: "( 9", matrix: [1, 9], x: 9, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0026 },
    { id: "0", label: ") 0", matrix: [1, 10], x: 10, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x0027 },
    { id: "MINS", label: "_ -", matrix: [1, 11], x: 11, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x002D },
    { id: "EQL", label: "+ =", matrix: [1, 12], x: 12, y: 1.25, w: 1, h: 1, group: "num", defaultKeycode: 0x002E },
    { id: "BSPC", label: "Bksp", matrix: [1, 13], x: 13, y: 1.25, w: 2, h: 1, group: "mod", defaultKeycode: 0x002A },
    { id: "INS", label: "Ins", matrix: [1, 14], x: 15.25, y: 1.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0049 },
    { id: "HOME", label: "Home", matrix: [1, 15], x: 16.25, y: 1.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004A },
    { id: "PGUP", label: "PgUp", matrix: [1, 16], x: 17.25, y: 1.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004B },

    // Row 2
    { id: "TAB", label: "Tab", matrix: [2, 0], x: 0, y: 2.25, w: 1.5, h: 1, group: "mod", defaultKeycode: 0x002B },
    { id: "Q", label: "Q", matrix: [2, 1], x: 1.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0014 },
    { id: "W", label: "W", matrix: [2, 2], x: 2.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001A },
    { id: "E", label: "E", matrix: [2, 3], x: 3.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0008 },
    { id: "R", label: "R", matrix: [2, 4], x: 4.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0015 },
    { id: "T", label: "T", matrix: [2, 5], x: 5.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0017 },
    { id: "Y", label: "Y", matrix: [2, 6], x: 6.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001C },
    { id: "U", label: "U", matrix: [2, 7], x: 7.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0018 },
    { id: "I", label: "I", matrix: [2, 8], x: 8.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000C },
    { id: "O", label: "O", matrix: [2, 9], x: 9.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0012 },
    { id: "P", label: "P", matrix: [2, 10], x: 10.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0013 },
    { id: "LBRC", label: "{ [", matrix: [2, 11], x: 11.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x002F },
    { id: "RBRC", label: "} ]", matrix: [2, 12], x: 12.5, y: 2.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0030 },
    { id: "BSLS", label: "| \\", matrix: [2, 13], x: 13.5, y: 2.25, w: 1.5, h: 1, group: "alpha", defaultKeycode: 0x0031 },
    { id: "DEL", label: "Del", matrix: [2, 14], x: 15.25, y: 2.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004C },
    { id: "END", label: "End", matrix: [2, 15], x: 16.25, y: 2.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004D },
    { id: "PGDN", label: "PgDn", matrix: [2, 16], x: 17.25, y: 2.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004E },

    // Row 3
    { id: "CAPS", label: "Caps", matrix: [3, 0], x: 0, y: 3.25, w: 1.75, h: 1, group: "mod", defaultKeycode: 0x0039 },
    { id: "A", label: "A", matrix: [3, 1], x: 1.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0004 },
    { id: "S", label: "S", matrix: [3, 2], x: 2.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0016 },
    { id: "D", label: "D", matrix: [3, 3], x: 3.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0007 },
    { id: "F", label: "F", matrix: [3, 4], x: 4.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0009 },
    { id: "G", label: "G", matrix: [3, 5], x: 5.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000A },
    { id: "H", label: "H", matrix: [3, 6], x: 6.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000B },
    { id: "J", label: "J", matrix: [3, 7], x: 7.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000D },
    { id: "K", label: "K", matrix: [3, 8], x: 8.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000E },
    { id: "L", label: "L", matrix: [3, 9], x: 9.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000F },
    { id: "SCLN", label: ": ;", matrix: [3, 10], x: 10.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0033 },
    { id: "QUOT", label: "\" '", matrix: [3, 11], x: 11.75, y: 3.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0034 },
    { id: "ENT", label: "Enter", matrix: [3, 12], x: 12.75, y: 3.25, w: 2.25, h: 1, group: "mod", defaultKeycode: 0x0028 },

    // Row 4
    { id: "LSFT", label: "Shift", matrix: [4, 0], x: 0, y: 4.25, w: 2.25, h: 1, group: "mod", defaultKeycode: 0x00E1 },
    { id: "Z", label: "Z", matrix: [4, 1], x: 2.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001D },
    { id: "X", label: "X", matrix: [4, 2], x: 3.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001B },
    { id: "C", label: "C", matrix: [4, 3], x: 4.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0006 },
    { id: "V", label: "V", matrix: [4, 4], x: 5.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0019 },
    { id: "B", label: "B", matrix: [4, 5], x: 6.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0005 },
    { id: "N", label: "N", matrix: [4, 6], x: 7.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0011 },
    { id: "M", label: "M", matrix: [4, 7], x: 8.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0010 },
    { id: "COMM", label: "< ,", matrix: [4, 8], x: 9.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0036 },
    { id: "DOT", label: "> .", matrix: [4, 9], x: 10.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0037 },
    { id: "SLSH", label: "? /", matrix: [4, 10], x: 11.25, y: 4.25, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0038 },
    { id: "RSFT", label: "Shift", matrix: [4, 11], x: 12.25, y: 4.25, w: 2.75, h: 1, group: "mod", defaultKeycode: 0x00E5 },
    { id: "UP", label: "▲", matrix: [4, 15], x: 16.25, y: 4.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0052 },

    // Row 5
    { id: "LCTL", label: "Ctrl", matrix: [5, 0], x: 0, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E0 },
    { id: "LWIN", label: "Win", matrix: [5, 1], x: 1.25, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E3 },
    { id: "LALT", label: "Alt", matrix: [5, 2], x: 2.5, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E2 },
    { id: "SPC", label: "Space", matrix: [5, 3], x: 3.75, y: 5.25, w: 6.25, h: 1, group: "alpha", defaultKeycode: 0x002C },
    { id: "RALT", label: "Alt", matrix: [5, 4], x: 10, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E6 },
    { id: "FN", label: "Fn", matrix: [5, 5], x: 11.25, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x5201 },
    { id: "APP", label: "Menu", matrix: [5, 6], x: 12.5, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x0065 },
    { id: "RCTL", label: "Ctrl", matrix: [5, 7], x: 13.75, y: 5.25, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E4 },
    { id: "LEFT", label: "◀", matrix: [5, 14], x: 15.25, y: 5.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0050 },
    { id: "DOWN", label: "▼", matrix: [5, 15], x: 16.25, y: 5.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x0051 },
    { id: "RGHT", label: "▶", matrix: [5, 16], x: 17.25, y: 5.25, w: 1, h: 1, group: "nav", defaultKeycode: 0x004F }
  ];

  // =========================================================================
  // 6. 60% Standard Layout (60% ANSI) - GH60 / DZ60 / Keychron Q4
  // =========================================================================
  const LAYOUT_60_ANSI = [
    // Row 0 (15u width)
    { id: "ESC", label: "Esc", matrix: [0, 0], x: 0, y: 0, w: 1, h: 1, group: "func", defaultKeycode: 0x0029 },
    { id: "1", label: "! 1", matrix: [0, 1], x: 1, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x001E },
    { id: "2", label: "@ 2", matrix: [0, 2], x: 2, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x001F },
    { id: "3", label: "# 3", matrix: [0, 3], x: 3, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0020 },
    { id: "4", label: "$ 4", matrix: [0, 4], x: 4, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0021 },
    { id: "5", label: "% 5", matrix: [0, 5], x: 5, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0022 },
    { id: "6", label: "^ 6", matrix: [0, 6], x: 6, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0023 },
    { id: "7", label: "& 7", matrix: [0, 7], x: 7, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0024 },
    { id: "8", label: "* 8", matrix: [0, 8], x: 8, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0025 },
    { id: "9", label: "( 9", matrix: [0, 9], x: 9, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0026 },
    { id: "0", label: ") 0", matrix: [0, 10], x: 10, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x0027 },
    { id: "MINS", label: "_ -", matrix: [0, 11], x: 11, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x002D },
    { id: "EQL", label: "+ =", matrix: [0, 12], x: 12, y: 0, w: 1, h: 1, group: "num", defaultKeycode: 0x002E },
    { id: "BSPC", label: "Bksp", matrix: [0, 13], x: 13, y: 0, w: 2, h: 1, group: "mod", defaultKeycode: 0x002A },

    // Row 1
    { id: "TAB", label: "Tab", matrix: [1, 0], x: 0, y: 1, w: 1.5, h: 1, group: "mod", defaultKeycode: 0x002B },
    { id: "Q", label: "Q", matrix: [1, 1], x: 1.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0014 },
    { id: "W", label: "W", matrix: [1, 2], x: 2.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001A },
    { id: "E", label: "E", matrix: [1, 3], x: 3.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0008 },
    { id: "R", label: "R", matrix: [1, 4], x: 4.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0015 },
    { id: "T", label: "T", matrix: [1, 5], x: 5.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0017 },
    { id: "Y", label: "Y", matrix: [1, 6], x: 6.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001C },
    { id: "U", label: "U", matrix: [1, 7], x: 7.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0018 },
    { id: "I", label: "I", matrix: [1, 8], x: 8.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000C },
    { id: "O", label: "O", matrix: [1, 9], x: 9.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0012 },
    { id: "P", label: "P", matrix: [1, 10], x: 10.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0013 },
    { id: "LBRC", label: "{ [", matrix: [1, 11], x: 11.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x002F },
    { id: "RBRC", label: "} ]", matrix: [1, 12], x: 12.5, y: 1, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0030 },
    { id: "BSLS", label: "| \\", matrix: [1, 13], x: 13.5, y: 1, w: 1.5, h: 1, group: "alpha", defaultKeycode: 0x0031 },

    // Row 2
    { id: "CAPS", label: "Caps", matrix: [2, 0], x: 0, y: 2, w: 1.75, h: 1, group: "mod", defaultKeycode: 0x0039 },
    { id: "A", label: "A", matrix: [2, 1], x: 1.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0004 },
    { id: "S", label: "S", matrix: [2, 2], x: 2.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0016 },
    { id: "D", label: "D", matrix: [2, 3], x: 3.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0007 },
    { id: "F", label: "F", matrix: [2, 4], x: 4.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0009 },
    { id: "G", label: "G", matrix: [2, 5], x: 5.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000A },
    { id: "H", label: "H", matrix: [2, 6], x: 6.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000B },
    { id: "J", label: "J", matrix: [2, 7], x: 7.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000D },
    { id: "K", label: "K", matrix: [2, 8], x: 8.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000E },
    { id: "L", label: "L", matrix: [2, 9], x: 9.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x000F },
    { id: "SCLN", label: ": ;", matrix: [2, 10], x: 10.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0033 },
    { id: "QUOT", label: "\" '", matrix: [2, 11], x: 11.75, y: 2, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0034 },
    { id: "ENT", label: "Enter", matrix: [2, 12], x: 12.75, y: 2, w: 2.25, h: 1, group: "mod", defaultKeycode: 0x0028 },

    // Row 3
    { id: "LSFT", label: "Shift", matrix: [3, 0], x: 0, y: 3, w: 2.25, h: 1, group: "mod", defaultKeycode: 0x00E1 },
    { id: "Z", label: "Z", matrix: [3, 1], x: 2.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001D },
    { id: "X", label: "X", matrix: [3, 2], x: 3.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x001B },
    { id: "C", label: "C", matrix: [3, 3], x: 4.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0006 },
    { id: "V", label: "V", matrix: [3, 4], x: 5.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0019 },
    { id: "B", label: "B", matrix: [3, 5], x: 6.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0005 },
    { id: "N", label: "N", matrix: [3, 6], x: 7.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0011 },
    { id: "M", label: "M", matrix: [3, 7], x: 8.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0010 },
    { id: "COMM", label: "< ,", matrix: [3, 8], x: 9.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0036 },
    { id: "DOT", label: "> .", matrix: [3, 9], x: 10.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0037 },
    { id: "SLSH", label: "? /", matrix: [3, 10], x: 11.25, y: 3, w: 1, h: 1, group: "alpha", defaultKeycode: 0x0038 },
    { id: "RSFT", label: "Shift", matrix: [3, 11], x: 12.25, y: 3, w: 2.75, h: 1, group: "mod", defaultKeycode: 0x00E5 },

    // Row 4
    { id: "LCTL", label: "Ctrl", matrix: [4, 0], x: 0, y: 4, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E0 },
    { id: "LWIN", label: "Win", matrix: [4, 1], x: 1.25, y: 4, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E3 },
    { id: "LALT", label: "Alt", matrix: [4, 2], x: 2.5, y: 4, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E2 },
    { id: "SPC", label: "Space", matrix: [4, 3], x: 3.75, y: 4, w: 6.25, h: 1, group: "alpha", defaultKeycode: 0x002C },
    { id: "RALT", label: "Alt", matrix: [4, 4], x: 10, y: 4, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E6 },
    { id: "RWIN", label: "Win", matrix: [4, 5], x: 11.25, y: 4, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E7 },
    { id: "FN", label: "Fn", matrix: [4, 6], x: 12.5, y: 4, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x5201 },
    { id: "RCTL", label: "Ctrl", matrix: [4, 7], x: 13.75, y: 4, w: 1.25, h: 1, group: "mod", defaultKeycode: 0x00E4 }
  ];

  // Peripheral descriptors for GMMK 3
  const GMMK3_ENCODER = {
    id: "ENCODER_0",
    name: "Volume Knob",
    encoderIndex: 0,
    pressMatrix: [11, 6],
    directions: [
      { id: "CCW", name: "Rotate Left (CCW)", default: 0x00AA },
      { id: "CW", name: "Rotate Right (CW)", default: 0x00A9 }
    ]
  };

  const GMMK3_SIDE_LEDS = {
    left: [
      { id: "SLED1", x: 0, y: 1.02, qmkPoint: [0, 10] },
      { id: "SLED2", x: 0, y: 1.48, qmkPoint: [0, 16] },
      { id: "SLED3", x: 0, y: 1.95, qmkPoint: [0, 22] },
      { id: "SLED4", x: 0, y: 2.41, qmkPoint: [0, 28] },
      { id: "SLED5", x: 0, y: 2.87, qmkPoint: [0, 34] },
      { id: "SLED6", x: 0, y: 3.33, qmkPoint: [0, 40] },
      { id: "SLED7", x: 0, y: 3.79, qmkPoint: [0, 46] },
      { id: "SLED8", x: 0, y: 4.26, qmkPoint: [0, 52] },
      { id: "SLED9", x: 0, y: 4.72, qmkPoint: [0, 58] },
      { id: "SLED10", x: 0, y: 5.18, qmkPoint: [0, 64] }
    ],
    right: [
      { id: "SLED11", x: 22.5, y: 1.02, qmkPoint: [224, 10] },
      { id: "SLED12", x: 22.5, y: 1.48, qmkPoint: [224, 16] },
      { id: "SLED13", x: 22.5, y: 1.95, qmkPoint: [224, 22] },
      { id: "SLED14", x: 22.5, y: 2.41, qmkPoint: [224, 28] },
      { id: "SLED15", x: 22.5, y: 2.87, qmkPoint: [224, 34] },
      { id: "SLED16", x: 22.5, y: 3.33, qmkPoint: [224, 40] },
      { id: "SLED17", x: 22.5, y: 3.79, qmkPoint: [224, 46] },
      { id: "SLED18", x: 22.5, y: 4.26, qmkPoint: [224, 52] },
      { id: "SLED19", x: 22.5, y: 4.72, qmkPoint: [224, 58] },
      { id: "SLED20", x: 22.5, y: 5.18, qmkPoint: [224, 64] }
    ]
  };

  // Layout Registry mapping
  const LAYOUT_REGISTRY = {
    "100-ansi": LAYOUT_100_ANSI,
    "100-iso": LAYOUT_100_ANSI,
    "96-ansi": LAYOUT_96_ANSI,
    "96-iso": LAYOUT_96_ANSI,
    "tkl-ansi": LAYOUT_TKL_ANSI,
    "tkl-iso": LAYOUT_TKL_ANSI,
    "75-ansi": LAYOUT_75_ANSI,
    "75-iso": LAYOUT_75_ANSI,
    "65-ansi": LAYOUT_65_ANSI,
    "65-iso": LAYOUT_65_ANSI,
    "60-ansi": LAYOUT_60_ANSI,
    "60-iso": LAYOUT_60_ANSI
  };

  // Helper: Get layout bounding box dimensions in keyboard units
  function getLayoutBounds(layout) {
    if (!layout || !Array.isArray(layout) || layout.length === 0) {
      return { width: 22.5, height: 6.25 };
    }
    let maxX = 0;
    let maxY = 0;
    layout.forEach(k => {
      const r = (Number(k.x) || 0) + (Number(k.w) || 1);
      const b = (Number(k.y) || 0) + (Number(k.h) || 1);
      if (r > maxX) maxX = r;
      if (b > maxY) maxY = b;
    });
    return { width: Math.max(maxX, 12), height: Math.max(maxY, 4) };
  }

  // Helper: Get layout for active device profile
  function getLayoutForProfile(profile) {
    if (!profile) return LAYOUT_100_ANSI;
    if (profile.customLayout && Array.isArray(profile.customLayout)) {
      return profile.customLayout;
    }
    const form = (profile.formFactor || "100%").replace("%", "").toLowerCase();
    const sub = (profile.layout || "ANSI").toLowerCase();
    const key = `${form}-${sub}`;
    return LAYOUT_REGISTRY[key] || LAYOUT_REGISTRY[`${form}-ansi`] || LAYOUT_100_ANSI;
  }

  // =========================================================================
  // Universal VIA JSON Layout Parser
  // Accepts standard VIA / QMK design_layout.json / keyboard.json
  // =========================================================================
  function parseVIALayout(viaJson) {
    if (!viaJson) return null;

    // 1. Direct QMK info.json format: viaJson.layouts[NAME].layout
    if (viaJson.layouts) {
      const names = Object.keys(viaJson.layouts);
      if (names.length > 0) {
        const layoutObj = viaJson.layouts.LAYOUT || viaJson.layouts[names[0]];
        if (layoutObj && Array.isArray(layoutObj.layout)) {
          return layoutObj.layout.map((k, idx) => {
            const rawLabel = k.label || "";
            const isKnob = rawLabel.toLowerCase().includes("knob");
            const isLogo = rawLabel.toLowerCase().includes("logo");
            const id = isKnob ? "KNOB_PRESS" : (isLogo ? "LOGO_LED" : (rawLabel.toUpperCase().replace(/[^A-Z0-9]/g, "") || `K_${idx}`));
            return {
              id: id,
              label: rawLabel || id,
              matrix: k.matrix || [Math.floor(idx / 8), idx % 8],
              x: Number(k.x) || 0,
              y: Number(k.y) || 0,
              w: Number(k.w) || 1,
              h: Number(k.h) || 1,
              group: isKnob ? "knob" : (isLogo ? "logo" : determineKeyGroup(id, rawLabel, k.x, k.y, k.w)),
              isKnob: isKnob,
              isLogo: isLogo,
              defaultKeycode: 0x0000
            };
          });
        }

        // 2. VIA KLE matrix format: viaJson.layouts.keymap = [ [ ... ] ]
        if (layoutObj && Array.isArray(layoutObj.keymap)) {
          return parseKLEKeymap(layoutObj.keymap);
        }
      }
    }

    // 3. Fallback: viaJson.keymap or direct array
    if (Array.isArray(viaJson.keymap)) {
      return parseKLEKeymap(viaJson.keymap);
    }

    return null;
  }

  function parseKLEKeymap(rows) {
    const keys = [];
    let curY = 0;
    let keyIdx = 0;

    rows.forEach(row => {
      if (!Array.isArray(row)) return;
      let curX = 0;
      let curW = 1;
      let curH = 1;

      row.forEach(item => {
        if (typeof item === "object") {
          if (item.x !== undefined) curX += Number(item.x);
          if (item.y !== undefined) curY += Number(item.y);
          if (item.w !== undefined) curW = Number(item.w);
          if (item.h !== undefined) curH = Number(item.h);
        } else if (typeof item === "string") {
          // KLE string format: "0,0\n\n\n\n\n\nEsc"
          const parts = item.split("\n");
          let matrix = [0, 0];
          let label = parts[0];

          if (parts.length >= 2 && parts[0].includes(",")) {
            const matCoords = parts[0].split(",");
            matrix = [parseInt(matCoords[0], 10) || 0, parseInt(matCoords[1], 10) || 0];
            label = parts[parts.length - 1] || parts[0];
          }

          const isKnob = label.toLowerCase().includes("knob");
          const isLogo = label.toLowerCase().includes("logo");
          const id = isKnob ? "KNOB_PRESS" : (isLogo ? "LOGO_LED" : (label.toUpperCase().replace(/[^A-Z0-9]/g, "") || `K_${keyIdx}`));

          keys.push({
            id: id,
            label: label,
            matrix: matrix,
            x: curX,
            y: curY,
            w: curW,
            h: curH,
            group: isKnob ? "knob" : (isLogo ? "logo" : determineKeyGroup(id, label, curX, curY, curW)),
            isKnob: isKnob,
            isLogo: isLogo,
            defaultKeycode: 0x0000
          });

          curX += curW;
          curW = 1;
          curH = 1;
          keyIdx++;
        }
      });
      curY += 1;
    });

    return keys.length > 0 ? keys : null;
  }

  // Export to global window namespace
  window.GMMK3_LAYOUT = LAYOUT_100_ANSI; // Backwards-compatible alias
  window.LAYOUT_100_ANSI = LAYOUT_100_ANSI;
  window.LAYOUT_75_ANSI = LAYOUT_75_ANSI;
  window.LAYOUT_65_ANSI = LAYOUT_65_ANSI;
  window.LAYOUT_96_ANSI = LAYOUT_96_ANSI;
  window.LAYOUT_TKL_ANSI = LAYOUT_TKL_ANSI;
  window.LAYOUT_60_ANSI = LAYOUT_60_ANSI;
  window.LAYOUT_REGISTRY = LAYOUT_REGISTRY;
  window.GMMK3_ENCODER = GMMK3_ENCODER;
  window.GMMK3_SIDE_LEDS = GMMK3_SIDE_LEDS;

  window.LayoutEngine = {
    getLayoutForProfile: getLayoutForProfile,
    getLayoutBounds: getLayoutBounds,
    parseVIALayout: parseVIALayout,
    parseKLEKeymap: parseKLEKeymap
  };
})();
