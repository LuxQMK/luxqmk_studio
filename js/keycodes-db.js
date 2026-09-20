/**
 * GMMK Studio - Categorized Keycodes Database (1:1 QMK & VIA Standard)
 */

(function () {
  const KEYCODE_CATEGORIES = [
  {
    "id": "basic",
    "label": "Basic",
    "labelPl": "Podstawowe"
  },
  {
    "id": "media",
    "label": "Media",
    "labelPl": "Media i Audio"
  },
  {
    "id": "macro",
    "label": "Macro",
    "labelPl": "Makra (M0-M15)"
  },
  {
    "id": "layers",
    "label": "Layers",
    "labelPl": "Warstwy"
  },
  {
    "id": "special",
    "label": "Special",
    "labelPl": "Specjalne (VIA / System)"
  },
  {
    "id": "lighting",
    "label": "Lighting",
    "labelPl": "Oświetlenie QMK"
  },
  {
    "id": "custom",
    "label": "Custom (LuxQMK)",
    "labelPl": "Dedykowane LuxQMK"
  }
];

  const KEYCODES_DB = [
  {
    "code": 4,
    "label": "A",
    "name": "KC_A",
    "category": "basic"
  },
  {
    "code": 5,
    "label": "B",
    "name": "KC_B",
    "category": "basic"
  },
  {
    "code": 6,
    "label": "C",
    "name": "KC_C",
    "category": "basic"
  },
  {
    "code": 7,
    "label": "D",
    "name": "KC_D",
    "category": "basic"
  },
  {
    "code": 8,
    "label": "E",
    "name": "KC_E",
    "category": "basic"
  },
  {
    "code": 9,
    "label": "F",
    "name": "KC_F",
    "category": "basic"
  },
  {
    "code": 10,
    "label": "G",
    "name": "KC_G",
    "category": "basic"
  },
  {
    "code": 11,
    "label": "H",
    "name": "KC_H",
    "category": "basic"
  },
  {
    "code": 12,
    "label": "I",
    "name": "KC_I",
    "category": "basic"
  },
  {
    "code": 13,
    "label": "J",
    "name": "KC_J",
    "category": "basic"
  },
  {
    "code": 14,
    "label": "K",
    "name": "KC_K",
    "category": "basic"
  },
  {
    "code": 15,
    "label": "L",
    "name": "KC_L",
    "category": "basic"
  },
  {
    "code": 16,
    "label": "M",
    "name": "KC_M",
    "category": "basic"
  },
  {
    "code": 17,
    "label": "N",
    "name": "KC_N",
    "category": "basic"
  },
  {
    "code": 18,
    "label": "O",
    "name": "KC_O",
    "category": "basic"
  },
  {
    "code": 19,
    "label": "P",
    "name": "KC_P",
    "category": "basic"
  },
  {
    "code": 20,
    "label": "Q",
    "name": "KC_Q",
    "category": "basic"
  },
  {
    "code": 21,
    "label": "R",
    "name": "KC_R",
    "category": "basic"
  },
  {
    "code": 22,
    "label": "S",
    "name": "KC_S",
    "category": "basic"
  },
  {
    "code": 23,
    "label": "T",
    "name": "KC_T",
    "category": "basic"
  },
  {
    "code": 24,
    "label": "U",
    "name": "KC_U",
    "category": "basic"
  },
  {
    "code": 25,
    "label": "V",
    "name": "KC_V",
    "category": "basic"
  },
  {
    "code": 26,
    "label": "W",
    "name": "KC_W",
    "category": "basic"
  },
  {
    "code": 27,
    "label": "X",
    "name": "KC_X",
    "category": "basic"
  },
  {
    "code": 28,
    "label": "Y",
    "name": "KC_Y",
    "category": "basic"
  },
  {
    "code": 29,
    "label": "Z",
    "name": "KC_Z",
    "category": "basic"
  },
  {
    "code": 30,
    "label": "1 !",
    "name": "KC_1",
    "category": "basic"
  },
  {
    "code": 31,
    "label": "2 @",
    "name": "KC_2",
    "category": "basic"
  },
  {
    "code": 32,
    "label": "3 #",
    "name": "KC_3",
    "category": "basic"
  },
  {
    "code": 33,
    "label": "4 $",
    "name": "KC_4",
    "category": "basic"
  },
  {
    "code": 34,
    "label": "5 %",
    "name": "KC_5",
    "category": "basic"
  },
  {
    "code": 35,
    "label": "6 ^",
    "name": "KC_6",
    "category": "basic"
  },
  {
    "code": 36,
    "label": "7 &",
    "name": "KC_7",
    "category": "basic"
  },
  {
    "code": 37,
    "label": "8 *",
    "name": "KC_8",
    "category": "basic"
  },
  {
    "code": 38,
    "label": "9 (",
    "name": "KC_9",
    "category": "basic"
  },
  {
    "code": 39,
    "label": "0 )",
    "name": "KC_0",
    "category": "basic"
  },
  {
    "code": 40,
    "label": "Enter",
    "name": "KC_ENT",
    "category": "basic"
  },
  {
    "code": 41,
    "label": "Escape",
    "name": "KC_ESC",
    "category": "basic"
  },
  {
    "code": 42,
    "label": "Backspace",
    "name": "KC_BSPC",
    "category": "basic"
  },
  {
    "code": 43,
    "label": "Tab",
    "name": "KC_TAB",
    "category": "basic"
  },
  {
    "code": 44,
    "label": "Space",
    "name": "KC_SPC",
    "category": "basic"
  },
  {
    "code": 45,
    "label": "- _",
    "name": "KC_MINS",
    "category": "basic"
  },
  {
    "code": 46,
    "label": "= +",
    "name": "KC_EQL",
    "category": "basic"
  },
  {
    "code": 47,
    "label": "[ {",
    "name": "KC_LBRC",
    "category": "basic"
  },
  {
    "code": 48,
    "label": "] }",
    "name": "KC_RBRC",
    "category": "basic"
  },
  {
    "code": 49,
    "label": "\\ |",
    "name": "KC_BSLS",
    "category": "basic"
  },
  {
    "code": 51,
    "label": "; :",
    "name": "KC_SCLN",
    "category": "basic"
  },
  {
    "code": 52,
    "label": "' \"",
    "name": "KC_QUOT",
    "category": "basic"
  },
  {
    "code": 53,
    "label": "` ~",
    "name": "KC_GRV",
    "category": "basic"
  },
  {
    "code": 54,
    "label": ", <",
    "name": "KC_COMM",
    "category": "basic"
  },
  {
    "code": 55,
    "label": ". >",
    "name": "KC_DOT",
    "category": "basic"
  },
  {
    "code": 56,
    "label": "/ ?",
    "name": "KC_SLSH",
    "category": "basic"
  },
  {
    "code": 57,
    "label": "Caps Lock",
    "name": "KC_CAPS",
    "category": "basic"
  },
  {
    "code": 58,
    "label": "F1",
    "name": "KC_F1",
    "category": "basic"
  },
  {
    "code": 59,
    "label": "F2",
    "name": "KC_F2",
    "category": "basic"
  },
  {
    "code": 60,
    "label": "F3",
    "name": "KC_F3",
    "category": "basic"
  },
  {
    "code": 61,
    "label": "F4",
    "name": "KC_F4",
    "category": "basic"
  },
  {
    "code": 62,
    "label": "F5",
    "name": "KC_F5",
    "category": "basic"
  },
  {
    "code": 63,
    "label": "F6",
    "name": "KC_F6",
    "category": "basic"
  },
  {
    "code": 64,
    "label": "F7",
    "name": "KC_F7",
    "category": "basic"
  },
  {
    "code": 65,
    "label": "F8",
    "name": "KC_F8",
    "category": "basic"
  },
  {
    "code": 66,
    "label": "F9",
    "name": "KC_F9",
    "category": "basic"
  },
  {
    "code": 67,
    "label": "F10",
    "name": "KC_F10",
    "category": "basic"
  },
  {
    "code": 68,
    "label": "F11",
    "name": "KC_F11",
    "category": "basic"
  },
  {
    "code": 69,
    "label": "F12",
    "name": "KC_F12",
    "category": "basic"
  },
  {
    "code": 70,
    "label": "Print Screen",
    "name": "KC_PSCR",
    "category": "basic"
  },
  {
    "code": 71,
    "label": "Scroll Lock",
    "name": "KC_SCRL",
    "category": "basic"
  },
  {
    "code": 72,
    "label": "Pause",
    "name": "KC_PAUS",
    "category": "basic"
  },
  {
    "code": 73,
    "label": "Insert",
    "name": "KC_INS",
    "category": "basic"
  },
  {
    "code": 74,
    "label": "Home",
    "name": "KC_HOME",
    "category": "basic"
  },
  {
    "code": 75,
    "label": "Page Up",
    "name": "KC_PGUP",
    "category": "basic"
  },
  {
    "code": 76,
    "label": "Delete",
    "name": "KC_DEL",
    "category": "basic"
  },
  {
    "code": 77,
    "label": "End",
    "name": "KC_END",
    "category": "basic"
  },
  {
    "code": 78,
    "label": "Page Down",
    "name": "KC_PGDN",
    "category": "basic"
  },
  {
    "code": 79,
    "label": "Right",
    "name": "KC_RGHT",
    "category": "basic"
  },
  {
    "code": 80,
    "label": "Left",
    "name": "KC_LEFT",
    "category": "basic"
  },
  {
    "code": 81,
    "label": "Down",
    "name": "KC_DOWN",
    "category": "basic"
  },
  {
    "code": 82,
    "label": "Up",
    "name": "KC_UP",
    "category": "basic"
  },
  {
    "code": 224,
    "label": "L-Ctrl",
    "name": "KC_LCTL",
    "category": "basic"
  },
  {
    "code": 225,
    "label": "L-Shift",
    "name": "KC_LSFT",
    "category": "basic"
  },
  {
    "code": 226,
    "label": "L-Alt",
    "name": "KC_LALT",
    "category": "basic"
  },
  {
    "code": 227,
    "label": "L-Win",
    "name": "KC_LGUI",
    "category": "basic"
  },
  {
    "code": 228,
    "label": "R-Ctrl",
    "name": "KC_RCTL",
    "category": "basic"
  },
  {
    "code": 229,
    "label": "R-Shift",
    "name": "KC_RSFT",
    "category": "basic"
  },
  {
    "code": 230,
    "label": "R-Alt",
    "name": "KC_RALT",
    "category": "basic"
  },
  {
    "code": 231,
    "label": "R-Win",
    "name": "KC_RGUI",
    "category": "basic"
  },
  {
    "code": 101,
    "label": "Menu / App",
    "name": "KC_APP",
    "category": "basic"
  },
  {
    "code": 83,
    "label": "Num Lock",
    "name": "KC_NUM",
    "category": "basic"
  },
  {
    "code": 84,
    "label": "Num /",
    "name": "KC_PSLS",
    "category": "basic"
  },
  {
    "code": 85,
    "label": "Num *",
    "name": "KC_PAST",
    "category": "basic"
  },
  {
    "code": 86,
    "label": "Num -",
    "name": "KC_PMNS",
    "category": "basic"
  },
  {
    "code": 87,
    "label": "Num +",
    "name": "KC_PPLS",
    "category": "basic"
  },
  {
    "code": 88,
    "label": "Num Enter",
    "name": "KC_PENT",
    "category": "basic"
  },
  {
    "code": 89,
    "label": "Num 1",
    "name": "KC_P1",
    "category": "basic"
  },
  {
    "code": 90,
    "label": "Num 2",
    "name": "KC_P2",
    "category": "basic"
  },
  {
    "code": 91,
    "label": "Num 3",
    "name": "KC_P3",
    "category": "basic"
  },
  {
    "code": 92,
    "label": "Num 4",
    "name": "KC_P4",
    "category": "basic"
  },
  {
    "code": 93,
    "label": "Num 5",
    "name": "KC_P5",
    "category": "basic"
  },
  {
    "code": 94,
    "label": "Num 6",
    "name": "KC_P6",
    "category": "basic"
  },
  {
    "code": 95,
    "label": "Num 7",
    "name": "KC_P7",
    "category": "basic"
  },
  {
    "code": 96,
    "label": "Num 8",
    "name": "KC_P8",
    "category": "basic"
  },
  {
    "code": 97,
    "label": "Num 9",
    "name": "KC_P9",
    "category": "basic"
  },
  {
    "code": 98,
    "label": "Num 0",
    "name": "KC_P0",
    "category": "basic"
  },
  {
    "code": 99,
    "label": "Num .",
    "name": "KC_PDOT",
    "category": "basic"
  },
  {
    "code": 168,
    "label": "Mute",
    "name": "KC_MUTE",
    "category": "media",
    "title": "Audio Mute"
  },
  {
    "code": 169,
    "label": "Vol +",
    "name": "KC_VOLU",
    "category": "media",
    "title": "Volume Up"
  },
  {
    "code": 170,
    "label": "Vol -",
    "name": "KC_VOLD",
    "category": "media",
    "title": "Volume Down"
  },
  {
    "code": 171,
    "label": "Next Track",
    "name": "KC_MNXT",
    "category": "media",
    "title": "Media Next Track"
  },
  {
    "code": 172,
    "label": "Prev Track",
    "name": "KC_MPRV",
    "category": "media",
    "title": "Media Previous Track"
  },
  {
    "code": 173,
    "label": "Stop Media",
    "name": "KC_MSTP",
    "category": "media",
    "title": "Media Stop"
  },
  {
    "code": 174,
    "label": "Play / Pause",
    "name": "KC_MPLY",
    "category": "media",
    "title": "Media Play/Pause"
  },
  {
    "code": 175,
    "label": "Media Select",
    "name": "KC_MSEL",
    "category": "media",
    "title": "Launch Media Player"
  },
  {
    "code": 30464,
    "label": "M0",
    "name": "M0",
    "category": "macro",
    "title": "Macro 0"
  },
  {
    "code": 30465,
    "label": "M1",
    "name": "M1",
    "category": "macro",
    "title": "Macro 1"
  },
  {
    "code": 30466,
    "label": "M2",
    "name": "M2",
    "category": "macro",
    "title": "Macro 2"
  },
  {
    "code": 30467,
    "label": "M3",
    "name": "M3",
    "category": "macro",
    "title": "Macro 3"
  },
  {
    "code": 30468,
    "label": "M4",
    "name": "M4",
    "category": "macro",
    "title": "Macro 4"
  },
  {
    "code": 30469,
    "label": "M5",
    "name": "M5",
    "category": "macro",
    "title": "Macro 5"
  },
  {
    "code": 30470,
    "label": "M6",
    "name": "M6",
    "category": "macro",
    "title": "Macro 6"
  },
  {
    "code": 30471,
    "label": "M7",
    "name": "M7",
    "category": "macro",
    "title": "Macro 7"
  },
  {
    "code": 30472,
    "label": "M8",
    "name": "M8",
    "category": "macro",
    "title": "Macro 8"
  },
  {
    "code": 30473,
    "label": "M9",
    "name": "M9",
    "category": "macro",
    "title": "Macro 9"
  },
  {
    "code": 30474,
    "label": "M10",
    "name": "M10",
    "category": "macro",
    "title": "Macro 10"
  },
  {
    "code": 30475,
    "label": "M11",
    "name": "M11",
    "category": "macro",
    "title": "Macro 11"
  },
  {
    "code": 30476,
    "label": "M12",
    "name": "M12",
    "category": "macro",
    "title": "Macro 12"
  },
  {
    "code": 30477,
    "label": "M13",
    "name": "M13",
    "category": "macro",
    "title": "Macro 13"
  },
  {
    "code": 30478,
    "label": "M14",
    "name": "M14",
    "category": "macro",
    "title": "Macro 14"
  },
  {
    "code": 30479,
    "label": "M15",
    "name": "M15",
    "category": "macro",
    "title": "Macro 15"
  },
  {
    "code": 21024,
    "label": "MO(0)",
    "name": "MO(0)",
    "category": "layers",
    "title": "Momentary switch to Layer 0"
  },
  {
    "code": 21025,
    "label": "MO(1)",
    "name": "MO(1)",
    "category": "layers",
    "title": "Momentary switch to Layer 1"
  },
  {
    "code": 21026,
    "label": "MO(2)",
    "name": "MO(2)",
    "category": "layers",
    "title": "Momentary switch to Layer 2"
  },
  {
    "code": 21027,
    "label": "MO(3)",
    "name": "MO(3)",
    "category": "layers",
    "title": "Momentary switch to Layer 3"
  },
  {
    "code": 21028,
    "label": "MO(4)",
    "name": "MO(4)",
    "category": "layers",
    "title": "Momentary switch to Layer 4"
  },
  {
    "code": 21029,
    "label": "MO(5)",
    "name": "MO(5)",
    "category": "layers",
    "title": "Momentary switch to Layer 5"
  },
  {
    "code": 21030,
    "label": "MO(6)",
    "name": "MO(6)",
    "category": "layers",
    "title": "Momentary switch to Layer 6"
  },
  {
    "code": 21031,
    "label": "MO(7)",
    "name": "MO(7)",
    "category": "layers",
    "title": "Momentary switch to Layer 7"
  },
  {
    "code": 21032,
    "label": "MO(8)",
    "name": "MO(8)",
    "category": "layers",
    "title": "Momentary switch to Layer 8"
  },
  {
    "code": 21033,
    "label": "MO(9)",
    "name": "MO(9)",
    "category": "layers",
    "title": "Momentary switch to Layer 9"
  },
  {
    "code": 21056,
    "label": "DF(0)",
    "name": "DF(0)",
    "category": "layers",
    "title": "Set Default Layer 0"
  },
  {
    "code": 21057,
    "label": "DF(1)",
    "name": "DF(1)",
    "category": "layers",
    "title": "Set Default Layer 1"
  },
  {
    "code": 21058,
    "label": "DF(2)",
    "name": "DF(2)",
    "category": "layers",
    "title": "Set Default Layer 2"
  },
  {
    "code": 21059,
    "label": "DF(3)",
    "name": "DF(3)",
    "category": "layers",
    "title": "Set Default Layer 3"
  },
  {
    "code": 21060,
    "label": "DF(4)",
    "name": "DF(4)",
    "category": "layers",
    "title": "Set Default Layer 4"
  },
  {
    "code": 21061,
    "label": "DF(5)",
    "name": "DF(5)",
    "category": "layers",
    "title": "Set Default Layer 5"
  },
  {
    "code": 21062,
    "label": "DF(6)",
    "name": "DF(6)",
    "category": "layers",
    "title": "Set Default Layer 6"
  },
  {
    "code": 21063,
    "label": "DF(7)",
    "name": "DF(7)",
    "category": "layers",
    "title": "Set Default Layer 7"
  },
  {
    "code": 21064,
    "label": "DF(8)",
    "name": "DF(8)",
    "category": "layers",
    "title": "Set Default Layer 8"
  },
  {
    "code": 21065,
    "label": "DF(9)",
    "name": "DF(9)",
    "category": "layers",
    "title": "Set Default Layer 9"
  },
  {
    "code": 21088,
    "label": "TG(0)",
    "name": "TG(0)",
    "category": "layers",
    "title": "Toggle Layer 0 on/off"
  },
  {
    "code": 21089,
    "label": "TG(1)",
    "name": "TG(1)",
    "category": "layers",
    "title": "Toggle Layer 1 on/off"
  },
  {
    "code": 21090,
    "label": "TG(2)",
    "name": "TG(2)",
    "category": "layers",
    "title": "Toggle Layer 2 on/off"
  },
  {
    "code": 21091,
    "label": "TG(3)",
    "name": "TG(3)",
    "category": "layers",
    "title": "Toggle Layer 3 on/off"
  },
  {
    "code": 21092,
    "label": "TG(4)",
    "name": "TG(4)",
    "category": "layers",
    "title": "Toggle Layer 4 on/off"
  },
  {
    "code": 21093,
    "label": "TG(5)",
    "name": "TG(5)",
    "category": "layers",
    "title": "Toggle Layer 5 on/off"
  },
  {
    "code": 21094,
    "label": "TG(6)",
    "name": "TG(6)",
    "category": "layers",
    "title": "Toggle Layer 6 on/off"
  },
  {
    "code": 21095,
    "label": "TG(7)",
    "name": "TG(7)",
    "category": "layers",
    "title": "Toggle Layer 7 on/off"
  },
  {
    "code": 21096,
    "label": "TG(8)",
    "name": "TG(8)",
    "category": "layers",
    "title": "Toggle Layer 8 on/off"
  },
  {
    "code": 21097,
    "label": "TG(9)",
    "name": "TG(9)",
    "category": "layers",
    "title": "Toggle Layer 9 on/off"
  },
  {
    "code": 21184,
    "label": "TT(0)",
    "name": "TT(0)",
    "category": "layers",
    "title": "Tap-Toggle Layer 0"
  },
  {
    "code": 21185,
    "label": "TT(1)",
    "name": "TT(1)",
    "category": "layers",
    "title": "Tap-Toggle Layer 1"
  },
  {
    "code": 21186,
    "label": "TT(2)",
    "name": "TT(2)",
    "category": "layers",
    "title": "Tap-Toggle Layer 2"
  },
  {
    "code": 21187,
    "label": "TT(3)",
    "name": "TT(3)",
    "category": "layers",
    "title": "Tap-Toggle Layer 3"
  },
  {
    "code": 21188,
    "label": "TT(4)",
    "name": "TT(4)",
    "category": "layers",
    "title": "Tap-Toggle Layer 4"
  },
  {
    "code": 21189,
    "label": "TT(5)",
    "name": "TT(5)",
    "category": "layers",
    "title": "Tap-Toggle Layer 5"
  },
  {
    "code": 21190,
    "label": "TT(6)",
    "name": "TT(6)",
    "category": "layers",
    "title": "Tap-Toggle Layer 6"
  },
  {
    "code": 21191,
    "label": "TT(7)",
    "name": "TT(7)",
    "category": "layers",
    "title": "Tap-Toggle Layer 7"
  },
  {
    "code": 21192,
    "label": "TT(8)",
    "name": "TT(8)",
    "category": "layers",
    "title": "Tap-Toggle Layer 8"
  },
  {
    "code": 21193,
    "label": "TT(9)",
    "name": "TT(9)",
    "category": "layers",
    "title": "Tap-Toggle Layer 9"
  },
  {
    "code": 21120,
    "label": "OSL(0)",
    "name": "OSL(0)",
    "category": "layers",
    "title": "One-Shot Layer 0"
  },
  {
    "code": 21121,
    "label": "OSL(1)",
    "name": "OSL(1)",
    "category": "layers",
    "title": "One-Shot Layer 1"
  },
  {
    "code": 21122,
    "label": "OSL(2)",
    "name": "OSL(2)",
    "category": "layers",
    "title": "One-Shot Layer 2"
  },
  {
    "code": 21123,
    "label": "OSL(3)",
    "name": "OSL(3)",
    "category": "layers",
    "title": "One-Shot Layer 3"
  },
  {
    "code": 21124,
    "label": "OSL(4)",
    "name": "OSL(4)",
    "category": "layers",
    "title": "One-Shot Layer 4"
  },
  {
    "code": 21125,
    "label": "OSL(5)",
    "name": "OSL(5)",
    "category": "layers",
    "title": "One-Shot Layer 5"
  },
  {
    "code": 21126,
    "label": "OSL(6)",
    "name": "OSL(6)",
    "category": "layers",
    "title": "One-Shot Layer 6"
  },
  {
    "code": 21127,
    "label": "OSL(7)",
    "name": "OSL(7)",
    "category": "layers",
    "title": "One-Shot Layer 7"
  },
  {
    "code": 21128,
    "label": "OSL(8)",
    "name": "OSL(8)",
    "category": "layers",
    "title": "One-Shot Layer 8"
  },
  {
    "code": 21129,
    "label": "OSL(9)",
    "name": "OSL(9)",
    "category": "layers",
    "title": "One-Shot Layer 9"
  },
  {
    "code": 20992,
    "label": "TO(0)",
    "name": "TO(0)",
    "category": "layers",
    "title": "Turn On Layer 0 (and deactivate others)"
  },
  {
    "code": 20993,
    "label": "TO(1)",
    "name": "TO(1)",
    "category": "layers",
    "title": "Turn On Layer 1 (and deactivate others)"
  },
  {
    "code": 20994,
    "label": "TO(2)",
    "name": "TO(2)",
    "category": "layers",
    "title": "Turn On Layer 2 (and deactivate others)"
  },
  {
    "code": 20995,
    "label": "TO(3)",
    "name": "TO(3)",
    "category": "layers",
    "title": "Turn On Layer 3 (and deactivate others)"
  },
  {
    "code": 20996,
    "label": "TO(4)",
    "name": "TO(4)",
    "category": "layers",
    "title": "Turn On Layer 4 (and deactivate others)"
  },
  {
    "code": 20997,
    "label": "TO(5)",
    "name": "TO(5)",
    "category": "layers",
    "title": "Turn On Layer 5 (and deactivate others)"
  },
  {
    "code": 20998,
    "label": "TO(6)",
    "name": "TO(6)",
    "category": "layers",
    "title": "Turn On Layer 6 (and deactivate others)"
  },
  {
    "code": 20999,
    "label": "TO(7)",
    "name": "TO(7)",
    "category": "layers",
    "title": "Turn On Layer 7 (and deactivate others)"
  },
  {
    "code": 21000,
    "label": "TO(8)",
    "name": "TO(8)",
    "category": "layers",
    "title": "Turn On Layer 8 (and deactivate others)"
  },
  {
    "code": 21001,
    "label": "TO(9)",
    "name": "TO(9)",
    "category": "layers",
    "title": "Turn On Layer 9 (and deactivate others)"
  },
  {
    "code": 16684,
    "label": "Space Fn1",
    "name": "LT(1, KC_SPC)",
    "category": "layers",
    "title": "Space when tapped, Layer 1 (Fn1) when held"
  },
  {
    "code": 16940,
    "label": "Space Fn2",
    "name": "LT(2, KC_SPC)",
    "category": "layers",
    "title": "Space when tapped, Layer 2 (Fn2) when held"
  },
  {
    "code": 17196,
    "label": "Space Fn3",
    "name": "LT(3, KC_SPC)",
    "category": "layers",
    "title": "Space when tapped, Layer 3 (Fn3) when held"
  },
  {
    "code": 20755,
    "label": "Fn1(Fn3)",
    "name": "FN1_FN3",
    "category": "layers",
    "title": "Layer 1 or Layer 3 when combo pressed"
  },
  {
    "code": 20771,
    "label": "Fn2(Fn3)",
    "name": "FN2_FN3",
    "category": "layers",
    "title": "Layer 2 or Layer 3 when combo pressed"
  },
  {
    "code": 565,
    "label": "~",
    "name": "KC_TILD",
    "category": "special",
    "title": "Tilde (~)"
  },
  {
    "code": 542,
    "label": "!",
    "name": "KC_EXLM",
    "category": "special",
    "title": "Exclamation (!)"
  },
  {
    "code": 543,
    "label": "@",
    "name": "KC_AT",
    "category": "special",
    "title": "At sign (@)"
  },
  {
    "code": 544,
    "label": "#",
    "name": "KC_HASH",
    "category": "special",
    "title": "Hash / Pound (#)"
  },
  {
    "code": 545,
    "label": "$",
    "name": "KC_DLR",
    "category": "special",
    "title": "Dollar ($)"
  },
  {
    "code": 546,
    "label": "%",
    "name": "KC_PERC",
    "category": "special",
    "title": "Percent (%)"
  },
  {
    "code": 547,
    "label": "^",
    "name": "KC_CIRC",
    "category": "special",
    "title": "Caret (^)"
  },
  {
    "code": 548,
    "label": "&",
    "name": "KC_AMPR",
    "category": "special",
    "title": "Ampersand (&)"
  },
  {
    "code": 549,
    "label": "*",
    "name": "KC_ASTR",
    "category": "special",
    "title": "Asterisk (*)"
  },
  {
    "code": 550,
    "label": "(",
    "name": "KC_LPRN",
    "category": "special",
    "title": "Left Parenthesis ()"
  },
  {
    "code": 551,
    "label": ")",
    "name": "KC_RPRN",
    "category": "special",
    "title": "Right Parenthesis ()"
  },
  {
    "code": 557,
    "label": "_",
    "name": "KC_UNDS",
    "category": "special",
    "title": "Underscore (_)"
  },
  {
    "code": 558,
    "label": "+",
    "name": "KC_PLUS",
    "category": "special",
    "title": "Plus (+)"
  },
  {
    "code": 559,
    "label": "{",
    "name": "KC_LCBR",
    "category": "special",
    "title": "Left Curly Brace ({)"
  },
  {
    "code": 560,
    "label": "}",
    "name": "KC_RCBR",
    "category": "special",
    "title": "Right Curly Brace (})"
  },
  {
    "code": 561,
    "label": "|",
    "name": "KC_PIPE",
    "category": "special",
    "title": "Pipe (|)"
  },
  {
    "code": 563,
    "label": ":",
    "name": "KC_COLN",
    "category": "special",
    "title": "Colon (:)"
  },
  {
    "code": 564,
    "label": "\"",
    "name": "KC_DQUO",
    "category": "special",
    "title": "Double Quote (\")"
  },
  {
    "code": 566,
    "label": "<",
    "name": "KC_LABK",
    "category": "special",
    "title": "Less Than (<)"
  },
  {
    "code": 567,
    "label": ">",
    "name": "KC_RABK",
    "category": "special",
    "title": "Greater Than (>)"
  },
  {
    "code": 568,
    "label": "?",
    "name": "KC_QUES",
    "category": "special",
    "title": "Question Mark (?)"
  },
  {
    "code": 50,
    "label": "~ ISO",
    "name": "KC_NUHS",
    "category": "special",
    "title": "Non-US # and ~"
  },
  {
    "code": 100,
    "label": "| \\",
    "name": "KC_NUBS",
    "category": "special",
    "title": "Non-US \\ and |"
  },
  {
    "code": 135,
    "label": "Ro",
    "name": "KC_RO",
    "category": "special",
    "title": "JIS Ro (\\_)"
  },
  {
    "code": 137,
    "label": "￥",
    "name": "KC_JYEN",
    "category": "special",
    "title": "JIS Yen (¥)"
  },
  {
    "code": 139,
    "label": "無変換",
    "name": "KC_MHEN",
    "category": "special",
    "title": "JIS Muhenkan (No Conversion)"
  },
  {
    "code": 145,
    "label": "漢字",
    "name": "KC_HANJ",
    "category": "special",
    "title": "Korean Hanja"
  },
  {
    "code": 144,
    "label": "한/영",
    "name": "KC_HAEN",
    "category": "special",
    "title": "Korean Hangul/English"
  },
  {
    "code": 138,
    "label": "変換",
    "name": "KC_HENK",
    "category": "special",
    "title": "JIS Henkan (Conversion)"
  },
  {
    "code": 136,
    "label": "かな",
    "name": "KC_KANA",
    "category": "special",
    "title": "JIS Katakana/Hiragana"
  },
  {
    "code": 31766,
    "label": "Esc ~",
    "name": "KC_GESC",
    "category": "special",
    "title": "Grave Escape (Esc when tapped, ` / ~ with Shift/GUI)"
  },
  {
    "code": 31770,
    "label": "LS (",
    "name": "KC_LSPO",
    "category": "special",
    "title": "Left Shift when held, ( when tapped"
  },
  {
    "code": 31771,
    "label": "RS )",
    "name": "KC_RSPC",
    "category": "special",
    "title": "Right Shift when held, ) when tapped"
  },
  {
    "code": 31768,
    "label": "LC (",
    "name": "KC_LCPO",
    "category": "special",
    "title": "Left Ctrl when held, ( when tapped"
  },
  {
    "code": 31769,
    "label": "RC )",
    "name": "KC_RCPC",
    "category": "special",
    "title": "Right Ctrl when held, ) when tapped"
  },
  {
    "code": 31772,
    "label": "LA (",
    "name": "KC_LAPO",
    "category": "special",
    "title": "Left Alt when held, ( when tapped"
  },
  {
    "code": 31773,
    "label": "RA )",
    "name": "KC_RAPC",
    "category": "special",
    "title": "Right Alt when held, ) when tapped"
  },
  {
    "code": 31774,
    "label": "SftEnt",
    "name": "KC_SFTENT",
    "category": "special",
    "title": "Right Shift when held, Enter when tapped"
  },
  {
    "code": 23986,
    "label": "Reset",
    "name": "QK_BOOT",
    "category": "special",
    "title": "Reboot to Bootloader / DFU Flash Mode"
  },
  {
    "code": 31746,
    "label": "Debug",
    "name": "DEBUG",
    "category": "special",
    "title": "Toggle Debug Mode"
  },
  {
    "code": 28691,
    "label": "Toggle NKRO",
    "name": "NK_TOGG",
    "category": "special",
    "title": "Toggle N-Key Rollover"
  },
  {
    "code": 28699,
    "label": "Swap Ctrl GUI",
    "name": "MAGIC_SWAP_LCTL_LGUI",
    "category": "special",
    "title": "Swap Left Control and GUI"
  },
  {
    "code": 28700,
    "label": "Unswap Ctrl GUI",
    "name": "MAGIC_UNSWAP_LCTL_LGUI",
    "category": "special",
    "title": "Unswap Left Control and GUI"
  },
  {
    "code": 28701,
    "label": "Toggle Ctrl GUI",
    "name": "MAGIC_TOGGLE_CTL_GUI",
    "category": "special",
    "title": "Toggle Swap Left Control and GUI"
  },
  {
    "code": 28692,
    "label": "Swap Alt GUI",
    "name": "MAGIC_SWAP_LALT_LGUI",
    "category": "special",
    "title": "Swap Left Alt and GUI"
  },
  {
    "code": 28693,
    "label": "Unswap Alt GUI",
    "name": "MAGIC_UNSWAP_LALT_LGUI",
    "category": "special",
    "title": "Unswap Left Alt and GUI"
  },
  {
    "code": 28694,
    "label": "Toggle Alt GUI",
    "name": "MAGIC_TOGGLE_ALT_GUI",
    "category": "special",
    "title": "Toggle Swap Left Alt and GUI"
  },
  {
    "code": 28681,
    "label": "Enable GUI",
    "name": "MAGIC_UNNO_GUI",
    "category": "special",
    "title": "Enable Windows / GUI Key"
  },
  {
    "code": 28682,
    "label": "Disable GUI",
    "name": "MAGIC_NO_GUI",
    "category": "special",
    "title": "Disable Windows / GUI Key"
  },
  {
    "code": 28683,
    "label": "Toggle GUI",
    "name": "MAGIC_TOGGLE_GUI",
    "category": "special",
    "title": "Toggle Windows / GUI Key Lock"
  },
  {
    "code": 131,
    "label": "Locking Num",
    "name": "KC_LNUM",
    "category": "special",
    "title": "Locking Num Lock switch"
  },
  {
    "code": 130,
    "label": "Locking Caps",
    "name": "KC_LCAP",
    "category": "special",
    "title": "Locking Caps Lock switch"
  },
  {
    "code": 132,
    "label": "Locking Scroll",
    "name": "KC_LSCR",
    "category": "special",
    "title": "Locking Scroll Lock switch"
  },
  {
    "code": 165,
    "label": "Power",
    "name": "KC_PWR",
    "category": "special",
    "title": "System Power Down"
  },
  {
    "code": 102,
    "label": "Power OSX",
    "name": "KC_POWER",
    "category": "special",
    "title": "System Power (macOS)"
  },
  {
    "code": 166,
    "label": "Sleep",
    "name": "KC_SLEP",
    "category": "special",
    "title": "System Sleep / Suspend"
  },
  {
    "code": 167,
    "label": "Wake",
    "name": "KC_WAKE",
    "category": "special",
    "title": "System Wake"
  },
  {
    "code": 178,
    "label": "Calc",
    "name": "KC_CALC",
    "category": "special",
    "title": "Launch Calculator"
  },
  {
    "code": 177,
    "label": "Mail",
    "name": "KC_MAIL",
    "category": "special",
    "title": "Launch Email Client"
  },
  {
    "code": 117,
    "label": "Help",
    "name": "KC_HELP",
    "category": "special",
    "title": "System / App Help"
  },
  {
    "code": 120,
    "label": "Stop",
    "name": "KC_STOP",
    "category": "special",
    "title": "System Stop"
  },
  {
    "code": 153,
    "label": "Alt Erase",
    "name": "KC_ERAS",
    "category": "special",
    "title": "Alternate Erase"
  },
  {
    "code": 121,
    "label": "Again",
    "name": "KC_AGIN",
    "category": "special",
    "title": "Redo / Repeat Action"
  },
  {
    "code": 118,
    "label": "Menu",
    "name": "KC_MENU",
    "category": "special",
    "title": "Application Menu"
  },
  {
    "code": 122,
    "label": "Undo",
    "name": "KC_UNDO",
    "category": "special",
    "title": "Undo"
  },
  {
    "code": 119,
    "label": "Select",
    "name": "KC_SLCT",
    "category": "special",
    "title": "Select"
  },
  {
    "code": 116,
    "label": "Exec",
    "name": "KC_EXEC",
    "category": "special",
    "title": "Execute"
  },
  {
    "code": 123,
    "label": "Cut",
    "name": "KC_CUT",
    "category": "special",
    "title": "Clipboard Cut"
  },
  {
    "code": 124,
    "label": "Copy",
    "name": "KC_COPY",
    "category": "special",
    "title": "Clipboard Copy"
  },
  {
    "code": 125,
    "label": "Paste",
    "name": "KC_PSTE",
    "category": "special",
    "title": "Clipboard Paste"
  },
  {
    "code": 126,
    "label": "Find",
    "name": "KC_FIND",
    "category": "special",
    "title": "Find / Search in document"
  },
  {
    "code": 179,
    "label": "My Comp",
    "name": "KC_MYCM",
    "category": "special",
    "title": "Open My Computer / File Explorer"
  },
  {
    "code": 181,
    "label": "Home",
    "name": "KC_WHOM",
    "category": "special",
    "title": "Web Browser Home"
  },
  {
    "code": 182,
    "label": "Back",
    "name": "KC_WBAK",
    "category": "special",
    "title": "Web Browser Back"
  },
  {
    "code": 183,
    "label": "Forward",
    "name": "KC_WFWD",
    "category": "special",
    "title": "Web Browser Forward"
  },
  {
    "code": 184,
    "label": "Stop",
    "name": "KC_WSTP",
    "category": "special",
    "title": "Web Browser Stop"
  },
  {
    "code": 185,
    "label": "Refresh",
    "name": "KC_WREF",
    "category": "special",
    "title": "Web Browser Refresh"
  },
  {
    "code": 186,
    "label": "Favorite",
    "name": "KC_WFAV",
    "category": "special",
    "title": "Web Browser Favorites / Bookmarks"
  },
  {
    "code": 180,
    "label": "Search",
    "name": "KC_WSCH",
    "category": "special",
    "title": "Web Search / Desktop Search"
  },
  {
    "code": 189,
    "label": "Screen +",
    "name": "KC_BRIU",
    "category": "special",
    "title": "Increase Display Brightness"
  },
  {
    "code": 190,
    "label": "Screen -",
    "name": "KC_BRID",
    "category": "special",
    "title": "Decrease Display Brightness"
  },
  {
    "code": 193,
    "label": "Mission Control",
    "name": "KC_MCTL",
    "category": "special",
    "title": "macOS Mission Control"
  },
  {
    "code": 194,
    "label": "Launchpad",
    "name": "KC_LPAD",
    "category": "special",
    "title": "macOS Launchpad"
  },
  {
    "code": 104,
    "label": "F13",
    "name": "KC_F13",
    "category": "special",
    "title": "Function Key F13"
  },
  {
    "code": 105,
    "label": "F14",
    "name": "KC_F14",
    "category": "special",
    "title": "Function Key F14"
  },
  {
    "code": 106,
    "label": "F15",
    "name": "KC_F15",
    "category": "special",
    "title": "Function Key F15"
  },
  {
    "code": 107,
    "label": "F16",
    "name": "KC_F16",
    "category": "special",
    "title": "Function Key F16"
  },
  {
    "code": 108,
    "label": "F17",
    "name": "KC_F17",
    "category": "special",
    "title": "Function Key F17"
  },
  {
    "code": 109,
    "label": "F18",
    "name": "KC_F18",
    "category": "special",
    "title": "Function Key F18"
  },
  {
    "code": 110,
    "label": "F19",
    "name": "KC_F19",
    "category": "special",
    "title": "Function Key F19"
  },
  {
    "code": 111,
    "label": "F20",
    "name": "KC_F20",
    "category": "special",
    "title": "Function Key F20"
  },
  {
    "code": 112,
    "label": "F21",
    "name": "KC_F21",
    "category": "special",
    "title": "Function Key F21"
  },
  {
    "code": 113,
    "label": "F22",
    "name": "KC_F22",
    "category": "special",
    "title": "Function Key F22"
  },
  {
    "code": 114,
    "label": "F23",
    "name": "KC_F23",
    "category": "special",
    "title": "Function Key F23"
  },
  {
    "code": 115,
    "label": "F24",
    "name": "KC_F24",
    "category": "special",
    "title": "Function Key F24"
  },
  {
    "code": 205,
    "label": "Mouse ↑",
    "name": "KC_MS_U",
    "category": "special",
    "title": "Mouse Cursor Up"
  },
  {
    "code": 206,
    "label": "Mouse ↓",
    "name": "KC_MS_D",
    "category": "special",
    "title": "Mouse Cursor Down"
  },
  {
    "code": 207,
    "label": "Mouse ←",
    "name": "KC_MS_L",
    "category": "special",
    "title": "Mouse Cursor Left"
  },
  {
    "code": 208,
    "label": "Mouse →",
    "name": "KC_MS_R",
    "category": "special",
    "title": "Mouse Cursor Right"
  },
  {
    "code": 209,
    "label": "Btn1",
    "name": "KC_BTN1",
    "category": "special",
    "title": "Mouse Button 1 (Left Click)"
  },
  {
    "code": 210,
    "label": "Btn2",
    "name": "KC_BTN2",
    "category": "special",
    "title": "Mouse Button 2 (Right Click)"
  },
  {
    "code": 211,
    "label": "Btn3",
    "name": "KC_BTN3",
    "category": "special",
    "title": "Mouse Button 3 (Middle Click)"
  },
  {
    "code": 212,
    "label": "Btn4",
    "name": "KC_BTN4",
    "category": "special",
    "title": "Mouse Button 4"
  },
  {
    "code": 213,
    "label": "Btn5",
    "name": "KC_BTN5",
    "category": "special",
    "title": "Mouse Button 5"
  },
  {
    "code": 214,
    "label": "Btn6",
    "name": "KC_BTN6",
    "category": "special",
    "title": "Mouse Button 6"
  },
  {
    "code": 215,
    "label": "Btn7",
    "name": "KC_BTN7",
    "category": "special",
    "title": "Mouse Button 7"
  },
  {
    "code": 216,
    "label": "Btn8",
    "name": "KC_BTN8",
    "category": "special",
    "title": "Mouse Button 8"
  },
  {
    "code": 217,
    "label": "Wheel ↑",
    "name": "KC_WH_U",
    "category": "special",
    "title": "Mouse Wheel Up"
  },
  {
    "code": 218,
    "label": "Wheel ↓",
    "name": "KC_WH_D",
    "category": "special",
    "title": "Mouse Wheel Down"
  },
  {
    "code": 219,
    "label": "Wheel ←",
    "name": "KC_WH_L",
    "category": "special",
    "title": "Mouse Wheel Left"
  },
  {
    "code": 220,
    "label": "Wheel →",
    "name": "KC_WH_R",
    "category": "special",
    "title": "Mouse Wheel Right"
  },
  {
    "code": 221,
    "label": "Acc0",
    "name": "KC_ACL0",
    "category": "special",
    "title": "Mouse Speed: Reset / Standard"
  },
  {
    "code": 222,
    "label": "Acc1",
    "name": "KC_ACL1",
    "category": "special",
    "title": "Mouse Speed: Slowest"
  },
  {
    "code": 223,
    "label": "Acc2",
    "name": "KC_ACL2",
    "category": "special",
    "title": "Mouse Speed: Fastest"
  },
  {
    "code": 29825,
    "label": "Audio On",
    "name": "AU_ON",
    "category": "special",
    "title": "Audio Enable"
  },
  {
    "code": 29824,
    "label": "Audio Off",
    "name": "AU_OFF",
    "category": "special",
    "title": "Audio Disable"
  },
  {
    "code": 29826,
    "label": "Audio Togg",
    "name": "AU_TOGG",
    "category": "special",
    "title": "Audio Toggle"
  },
  {
    "code": 29834,
    "label": "Clicky Togg",
    "name": "CK_TOGG",
    "category": "special",
    "title": "Audio Clicky Toggle"
  },
  {
    "code": 29837,
    "label": "Clicky On",
    "name": "CK_ON",
    "category": "special",
    "title": "Audio Clicky On"
  },
  {
    "code": 29838,
    "label": "Clicky Off",
    "name": "CK_OFF",
    "category": "special",
    "title": "Audio Clicky Off"
  },
  {
    "code": 29835,
    "label": "Clicky Up",
    "name": "CK_UP",
    "category": "special",
    "title": "Audio Clicky Pitch Up"
  },
  {
    "code": 29836,
    "label": "Clicky Down",
    "name": "CK_DOWN",
    "category": "special",
    "title": "Audio Clicky Pitch Down"
  },
  {
    "code": 29839,
    "label": "Clicky Reset",
    "name": "CK_RST",
    "category": "special",
    "title": "Audio Clicky Pitch Reset"
  },
  {
    "code": 29840,
    "label": "Music On",
    "name": "MU_ON",
    "category": "special",
    "title": "Music Mode On"
  },
  {
    "code": 29841,
    "label": "Music Off",
    "name": "MU_OFF",
    "category": "special",
    "title": "Music Mode Off"
  },
  {
    "code": 29842,
    "label": "Music Togg",
    "name": "MU_TOGG",
    "category": "special",
    "title": "Music Mode Toggle"
  },
  {
    "code": 29843,
    "label": "Music Mode",
    "name": "MU_MOD",
    "category": "special",
    "title": "Cycle Music Modes"
  },
  {
    "code": 1,
    "label": "▽ Pass",
    "name": "KC_TRNS",
    "category": "special",
    "title": "Transparent (Pass through to lower layer)"
  },
  {
    "code": 0,
    "label": "None",
    "name": "KC_NO",
    "category": "special",
    "title": "Disabled / No Action"
  },
  {
    "code": 31747,
    "label": "Caps Word",
    "name": "CAPS_WORD",
    "category": "special",
    "title": "Toggle Caps Word"
  },
  {
    "code": 31745,
    "label": "Clear EEPROM",
    "name": "EE_CLR",
    "category": "special",
    "title": "Reset EEPROM to firmware defaults"
  },
  {
    "code": -1,
    "label": "Any",
    "name": "ANY",
    "category": "special",
    "isAny": true,
    "title": "Enter Custom Keycode / Hex / Macro Formula"
  },
  {
    "code": 30720,
    "label": "RGB Toggle",
    "name": "RGB_TOG",
    "category": "lighting",
    "title": "Turn RGB On / Off"
  },
  {
    "code": 30721,
    "label": "RGB Mode +",
    "name": "RGB_MOD",
    "category": "lighting",
    "title": "Next RGB Matrix Effect"
  },
  {
    "code": 30722,
    "label": "RGB Mode -",
    "name": "RGB_RMOD",
    "category": "lighting",
    "title": "Previous RGB Matrix Effect"
  },
  {
    "code": 30723,
    "label": "Hue +",
    "name": "RGB_HUI",
    "category": "lighting",
    "title": "Increase RGB Hue"
  },
  {
    "code": 30724,
    "label": "Hue -",
    "name": "RGB_HUD",
    "category": "lighting",
    "title": "Decrease RGB Hue"
  },
  {
    "code": 30725,
    "label": "Sat +",
    "name": "RGB_SAI",
    "category": "lighting",
    "title": "Increase RGB Saturation"
  },
  {
    "code": 30726,
    "label": "Sat -",
    "name": "RGB_SAD",
    "category": "lighting",
    "title": "Decrease RGB Saturation"
  },
  {
    "code": 30727,
    "label": "Bright +",
    "name": "RGB_VAI",
    "category": "lighting",
    "title": "Increase RGB Brightness"
  },
  {
    "code": 30728,
    "label": "Bright -",
    "name": "RGB_VAD",
    "category": "lighting",
    "title": "Decrease RGB Brightness"
  },
  {
    "code": 30729,
    "label": "Speed +",
    "name": "RGB_SPI",
    "category": "lighting",
    "title": "Increase Effect Speed"
  },
  {
    "code": 30730,
    "label": "Speed -",
    "name": "RGB_SPD",
    "category": "lighting",
    "title": "Decrease Effect Speed"
  },
  {
    "code": 23984,
    "label": "ORGB Mode",
    "name": "ORGB",
    "category": "custom",
    "title": "Toggle OpenRGB / VIA Mode (QK_KB_0)"
  },
  {
    "code": 23985,
    "label": "RGB Reverse",
    "name": "RGB_REV",
    "category": "custom",
    "title": "Toggle Reverse RGB Direction (QK_KB_1)"
  },
  { "code": 30464, "label": "M0", "name": "M0", "category": "macro", "title": "Execute Macro 0 (QK_MACRO_0)" },
  { "code": 30465, "label": "M1", "name": "M1", "category": "macro", "title": "Execute Macro 1 (QK_MACRO_1)" },
  { "code": 30466, "label": "M2", "name": "M2", "category": "macro", "title": "Execute Macro 2 (QK_MACRO_2)" },
  { "code": 30467, "label": "M3", "name": "M3", "category": "macro", "title": "Execute Macro 3 (QK_MACRO_3)" },
  { "code": 30468, "label": "M4", "name": "M4", "category": "macro", "title": "Execute Macro 4 (QK_MACRO_4)" },
  { "code": 30469, "label": "M5", "name": "M5", "category": "macro", "title": "Execute Macro 5 (QK_MACRO_5)" },
  { "code": 30470, "label": "M6", "name": "M6", "category": "macro", "title": "Execute Macro 6 (QK_MACRO_6)" },
  { "code": 30471, "label": "M7", "name": "M7", "category": "macro", "title": "Execute Macro 7 (QK_MACRO_7)" },
  { "code": 30472, "label": "M8", "name": "M8", "category": "macro", "title": "Execute Macro 8 (QK_MACRO_8)" },
  { "code": 30473, "label": "M9", "name": "M9", "category": "macro", "title": "Execute Macro 9 (QK_MACRO_9)" },
  { "code": 30474, "label": "M10", "name": "M10", "category": "macro", "title": "Execute Macro 10 (QK_MACRO_10)" },
  { "code": 30475, "label": "M11", "name": "M11", "category": "macro", "title": "Execute Macro 11 (QK_MACRO_11)" },
  { "code": 30476, "label": "M12", "name": "M12", "category": "macro", "title": "Execute Macro 12 (QK_MACRO_12)" },
  { "code": 30477, "label": "M13", "name": "M13", "category": "macro", "title": "Execute Macro 13 (QK_MACRO_13)" },
  { "code": 30478, "label": "M14", "name": "M14", "category": "macro", "title": "Execute Macro 14 (QK_MACRO_14)" },
  { "code": 30479, "label": "M15", "name": "M15", "category": "macro", "title": "Execute Macro 15 (QK_MACRO_15)" }
];

  // Quick lookup dictionary by 16-bit keycode
  const CODE_MAP = new Map();
  KEYCODES_DB.forEach(k => {
    if (k.code >= 0) CODE_MAP.set(k.code, k);
  });

  function getKeycodeInfo(code) {
    if (code === undefined || code === null) return { code: 0, label: "None", name: "KC_NO" };
    
    // Check known dictionary
    if (CODE_MAP.has(code)) {
      return CODE_MAP.get(code);
    }

    // Dynamic Layer Tap: LT(layer, kc) -> 0x4000 .. 0x4FFF (bits: 0100 llll kkkkkkkk)
    if ((code & 0xF000) === 0x4000) {
      const layer = (code >> 8) & 0x0F;
      const baseKc = code & 0xFF;
      const baseInfo = CODE_MAP.get(baseKc) || { label: `0x${baseKc.toString(16).toUpperCase()}` };
      return {
        code,
        label: `${baseInfo.label} Fn${layer}`,
        name: `LT(${layer}, ${baseInfo.name || baseInfo.label})`,
        category: "layers"
      };
    }

    // Dynamic layer decoding (MO, TO, TG, TT, OSL, DF, LM)
    const topByte = (code >> 8) & 0xFF;
    const layer = code & 0x1F;
    if (topByte === 0x52) {
      const type = (code >> 5) & 0x07;
      if (type === 0) return { code, label: `TO(${layer})`, name: `TO(${layer})`, category: "layers" };
      if (type === 1) return { code, label: `MO(${layer})`, name: `MO(${layer})`, category: "layers" };
      if (type === 2) return { code, label: `DF(${layer})`, name: `DF(${layer})`, category: "layers" };
      if (type === 3) return { code, label: `TG(${layer})`, name: `TG(${layer})`, category: "layers" };
      if (type === 4) return { code, label: `OSL(${layer})`, name: `OSL(${layer})`, category: "layers" };
      if (type === 5) {
        const mod = (code >> 5) & 0x1F;
        return { code, label: `LM(${layer})`, name: `LM(${layer},${mod})`, category: "layers" };
      }
      if (type === 6) return { code, label: `TT(${layer})`, name: `TT(${layer})`, category: "layers" };
    }

    // Dynamic macro decoding (M0 - M15)
    if (topByte === 0x77) {
      const macroId = code & 0x0F;
      return { code, label: `M${macroId}`, name: `M${macroId}`, category: "macro" };
    }

    // Dynamic Modified Keycodes (LSFT, LCTL, LALT, LGUI combos)
    if ((code & 0x0200) === 0x0200 && (code & 0xFF00) === 0x0200) {
      const baseKc = code & 0xFF;
      const baseInfo = CODE_MAP.get(baseKc);
      if (baseInfo) {
        return { code, label: `S(${baseInfo.label})`, name: `LSFT(${baseInfo.name})`, category: "special" };
      }
    }

    if (code === 0x0001) return { code: 0x0001, label: "▽ (Pass)", name: "KC_TRNS", category: "special" };
    if (code === 0x0000) return { code: 0x0000, label: "None", name: "KC_NO", category: "special" };

    return {
      code: code,
      label: `0x${code.toString(16).toUpperCase().padStart(4, "0")}`,
      name: `0x${code.toString(16).toUpperCase().padStart(4, "0")}`,
      category: "special"
    };
  }

  window.KEYCODES_DB = KEYCODES_DB;
  window.KEYCODE_CATEGORIES = KEYCODE_CATEGORIES;
  window.getKeycodeInfo = getKeycodeInfo;
})();
