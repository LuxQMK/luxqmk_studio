/**
 * GMMK Studio - Keyboard Physical & Matrix Layout Definition
 * Hardware: Glorious GMMK 3 100% ANSI (105 keys + 1 Rotary Encoder)
 * Point coordinates matched 1:1 with QMK firmware (keyboards/gmmk/gmmk3/p100/ansi/ansi.c)
 */

(function () {
  const GMMK3_LAYOUT = [
    // --- ROW 0: Function Row (y = 0) ---
    { id: "ESC",  label: "Esc",   matrix: [1, 3], x: 0,    y: 0, w: 1,    h: 1, group: "func", qmkPoint: [0, 0], defaultKeycode: 0x0029 /* KC_ESC */ },
    { id: "F1",   label: "F1",    matrix: [2, 6], x: 2,    y: 0, w: 1,    h: 1, group: "func", qmkPoint: [21, 0], defaultKeycode: 0x003A /* KC_F1 */ },
    { id: "F2",   label: "F2",    matrix: [3, 6], x: 3,    y: 0, w: 1,    h: 1, group: "func", qmkPoint: [31, 0], defaultKeycode: 0x003B /* KC_F2 */ },
    { id: "F3",   label: "F3",    matrix: [3, 1], x: 4,    y: 0, w: 1,    h: 1, group: "func", qmkPoint: [42, 0], defaultKeycode: 0x003C /* KC_F3 */ },
    { id: "F4",   label: "F4",    matrix: [3, 3], x: 5,    y: 0, w: 1,    h: 1, group: "func", qmkPoint: [52, 0], defaultKeycode: 0x003D /* KC_F4 */ },
    { id: "F5",   label: "F5",    matrix: [0, 7], x: 6.5,  y: 0, w: 1,    h: 1, group: "func", qmkPoint: [68, 0], defaultKeycode: 0x003E /* KC_F5 */ },
    { id: "F6",   label: "F6",    matrix: [6, 3], x: 7.5,  y: 0, w: 1,    h: 1, group: "func", qmkPoint: [78, 0], defaultKeycode: 0x003F /* KC_F6 */ },
    { id: "F7",   label: "F7",    matrix: [7, 1], x: 8.5,  y: 0, w: 1,    h: 1, group: "func", qmkPoint: [89, 0], defaultKeycode: 0x0040 /* KC_F7 */ },
    { id: "F8",   label: "F8",    matrix: [7, 6], x: 9.5,  y: 0, w: 1,    h: 1, group: "func", qmkPoint: [99, 0], defaultKeycode: 0x0041 /* KC_F8 */ },
    { id: "F9",   label: "F9",    matrix: [10, 6], x: 11,  y: 0, w: 1,    h: 1, group: "func", qmkPoint: [115, 0], defaultKeycode: 0x0042 /* KC_F9 */ },
    { id: "F10",  label: "F10",   matrix: [10, 7], x: 12,  y: 0, w: 1,    h: 1, group: "func", qmkPoint: [125, 0], defaultKeycode: 0x0043 /* KC_F10 */ },
    { id: "F11",  label: "F11",   matrix: [10, 3], x: 13,  y: 0, w: 1,    h: 1, group: "func", qmkPoint: [136, 0], defaultKeycode: 0x0044 /* KC_F11 */ },
    { id: "F12",  label: "F12",   matrix: [10, 5], x: 14,  y: 0, w: 1,    h: 1, group: "func", qmkPoint: [146, 0], defaultKeycode: 0x0045 /* KC_F12 */ },
    { id: "PSCR", label: "PrtSc", matrix: [9, 7], x: 15.25, y: 0, w: 1,   h: 1, group: "nav", qmkPoint: [159, 0], defaultKeycode: 0x0046 /* KC_PSCR */ },
    { id: "SCRL", label: "ScrLk", matrix: [10, 0], x: 16.25, y: 0, w: 1,  h: 1, group: "nav", qmkPoint: [169, 0], defaultKeycode: 0x0047 /* KC_SCRL */ },
    { id: "PAUS", label: "Pause", matrix: [9, 6], x: 17.25, y: 0, w: 1,  h: 1, group: "nav", qmkPoint: [180, 0], defaultKeycode: 0x0048 /* KC_PAUS */ },
    { id: "LOGO_LED", label: "", matrix: [-1, -1], x: 20.75, y: 0.37, w: 0.60, h: 0.26, group: "logo", qmkPoint: [214, 0], isLogo: true },
    { id: "KNOB_PRESS", label: "Mute", matrix: [11, 6], x: 21.5, y: 0, w: 1, h: 1, group: "knob", qmkPoint: [214, 0], isKnob: true, defaultKeycode: 0x00A8 /* KC_MUTE */ },

    // --- ROW 1: Number Row (y = 1.25) ---
    { id: "GRV",  label: "~ `",   matrix: [1, 6], x: 0,    y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [0, 15], defaultKeycode: 0x0035 /* KC_GRV */ },
    { id: "1",    label: "! 1",   matrix: [1, 7], x: 1,    y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [10, 15], defaultKeycode: 0x001E /* KC_1 */ },
    { id: "2",    label: "@ 2",   matrix: [2, 7], x: 2,    y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [21, 15], defaultKeycode: 0x001F /* KC_2 */ },
    { id: "3",    label: "# 3",   matrix: [3, 7], x: 3,    y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [31, 15], defaultKeycode: 0x0020 /* KC_3 */ },
    { id: "4",    label: "$ 4",   matrix: [4, 7], x: 4,    y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [42, 15], defaultKeycode: 0x0021 /* KC_4 */ },
    { id: "5",    label: "% 5",   matrix: [4, 6], x: 5,    y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [52, 15], defaultKeycode: 0x0022 /* KC_5 */ },
    { id: "6",    label: "^ 6",   matrix: [5, 6], x: 6,    y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [63, 15], defaultKeycode: 0x0023 /* KC_6 */ },
    { id: "7",    label: "& 7",   matrix: [5, 7], x: 7,    y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [73, 15], defaultKeycode: 0x0024 /* KC_7 */ },
    { id: "8",    label: "* 8",   matrix: [6, 7], x: 8,    y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [83, 15], defaultKeycode: 0x0025 /* KC_8 */ },
    { id: "9",    label: "( 9",   matrix: [7, 7], x: 9,    y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [94, 15], defaultKeycode: 0x0026 /* KC_9 */ },
    { id: "0",    label: ") 0",   matrix: [8, 7], x: 10,   y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [104, 15], defaultKeycode: 0x0027 /* KC_0 */ },
    { id: "MINS", label: "_ -",   matrix: [8, 6], x: 11,   y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [115, 15], defaultKeycode: 0x002D /* KC_MINS */ },
    { id: "EQL",  label: "+ =",   matrix: [6, 6], x: 12,   y: 1.25, w: 1, h: 1, group: "num", qmkPoint: [125, 15], defaultKeycode: 0x002E /* KC_EQL */ },
    { id: "BSPC", label: "Bksp",  matrix: [10, 1], x: 13,  y: 1.25, w: 2, h: 1, group: "mod", qmkPoint: [141, 15], defaultKeycode: 0x002A /* KC_BSPC */ },
    { id: "INS",  label: "Ins",   matrix: [7, 5], x: 15.25, y: 1.25, w: 1, h: 1, group: "nav", qmkPoint: [159, 15], defaultKeycode: 0x0049 /* KC_INS */ },
    { id: "HOME", label: "Home",  matrix: [0, 2], x: 16.25, y: 1.25, w: 1, h: 1, group: "nav", qmkPoint: [169, 15], defaultKeycode: 0x004A /* KC_HOME */ },
    { id: "PGUP", label: "PgUp",  matrix: [1, 5], x: 17.25, y: 1.25, w: 1, h: 1, group: "nav", qmkPoint: [180, 15], defaultKeycode: 0x004B /* KC_PGUP */ },
    { id: "NUM",  label: "Num",   matrix: [11, 4], x: 18.5, y: 1.25, w: 1, h: 1, group: "numpad", qmkPoint: [193, 15], defaultKeycode: 0x0053 /* KC_NUM */ },
    { id: "PSLS", label: "/",     matrix: [12, 4], x: 19.5, y: 1.25, w: 1, h: 1, group: "numpad", qmkPoint: [203, 15], defaultKeycode: 0x0054 /* KC_PSLS */ },
    { id: "PAST", label: "*",     matrix: [13, 4], x: 20.5, y: 1.25, w: 1, h: 1, group: "numpad", qmkPoint: [214, 15], defaultKeycode: 0x0055 /* KC_PAST */ },
    { id: "PMNS", label: "-",     matrix: [13, 5], x: 21.5, y: 1.25, w: 1, h: 1, group: "numpad", qmkPoint: [224, 15], defaultKeycode: 0x0056 /* KC_PMNS */ },

    // --- ROW 2: QWERTY Row (y = 2.25) ---
    { id: "TAB",  label: "Tab",   matrix: [1, 1], x: 0,    y: 2.25, w: 1.5, h: 1, group: "mod", qmkPoint: [3, 27], defaultKeycode: 0x002B /* KC_TAB */ },
    { id: "Q",    label: "Q",     matrix: [1, 0], x: 1.5,  y: 2.25, w: 1,   h: 1, group: "alpha", qmkPoint: [16, 27], defaultKeycode: 0x0014 /* KC_Q */ },
    { id: "W",    label: "W",     matrix: [2, 0], x: 2.5,  y: 2.25, w: 1,   h: 1, group: "alpha", qmkPoint: [26, 27], defaultKeycode: 0x001A /* KC_W */ },
    { id: "E",    label: "E",     matrix: [3, 0], x: 3.5,  y: 2.25, w: 1,   h: 1, group: "alpha", qmkPoint: [36, 27], defaultKeycode: 0x0008 /* KC_E */ },
    { id: "R",    label: "R",     matrix: [4, 0], x: 4.5,  y: 2.25, w: 1,   h: 1, group: "alpha", qmkPoint: [47, 27], defaultKeycode: 0x0015 /* KC_R */ },
    { id: "T",    label: "T",     matrix: [4, 1], x: 5.5,  y: 2.25, w: 1,   h: 1, group: "alpha", qmkPoint: [57, 27], defaultKeycode: 0x0017 /* KC_T */ },
    { id: "Y",    label: "Y",     matrix: [5, 1], x: 6.5,  y: 2.25, w: 1,   h: 1, group: "alpha", qmkPoint: [68, 27], defaultKeycode: 0x001C /* KC_Y */ },
    { id: "U",    label: "U",     matrix: [5, 0], x: 7.5,  y: 2.25, w: 1,   h: 1, group: "alpha", qmkPoint: [78, 27], defaultKeycode: 0x0018 /* KC_U */ },
    { id: "I",    label: "I",     matrix: [6, 0], x: 8.5,  y: 2.25, w: 1,   h: 1, group: "alpha", qmkPoint: [89, 27], defaultKeycode: 0x000C /* KC_I */ },
    { id: "O",    label: "O",     matrix: [7, 0], x: 9.5,  y: 2.25, w: 1,   h: 1, group: "alpha", qmkPoint: [99, 27], defaultKeycode: 0x0012 /* KC_O */ },
    { id: "P",    label: "P",     matrix: [8, 0], x: 10.5, y: 2.25, w: 1,   h: 1, group: "alpha", qmkPoint: [109, 27], defaultKeycode: 0x0013 /* KC_P */ },
    { id: "LBRC", label: "{ [",   matrix: [8, 1], x: 11.5, y: 2.25, w: 1,   h: 1, group: "alpha", qmkPoint: [120, 27], defaultKeycode: 0x002F /* KC_LBRC */ },
    { id: "RBRC", label: "} ]",   matrix: [6, 1], x: 12.5, y: 2.25, w: 1,   h: 1, group: "alpha", qmkPoint: [130, 27], defaultKeycode: 0x0030 /* KC_RBRC */ },
    { id: "BSLS", label: "| \\",  matrix: [10, 2], x: 13.5, y: 2.25, w: 1.5, h: 1, group: "alpha", qmkPoint: [143, 27], defaultKeycode: 0x0031 /* KC_BSLS */ },
    { id: "DEL",  label: "Del",   matrix: [6, 5], x: 15.25, y: 2.25, w: 1,  h: 1, group: "nav", qmkPoint: [159, 27], defaultKeycode: 0x004C /* KC_DEL */ },
    { id: "END",  label: "End",   matrix: [12, 6], x: 16.25, y: 2.25, w: 1, h: 1, group: "nav", qmkPoint: [169, 27], defaultKeycode: 0x004D /* KC_END */ },
    { id: "PGDN", label: "PgDn",  matrix: [2, 5], x: 17.25, y: 2.25, w: 1,  h: 1, group: "nav", qmkPoint: [180, 27], defaultKeycode: 0x004E /* KC_PGDN */ },
    { id: "P7",   label: "7",     matrix: [11, 0], x: 18.5, y: 2.25, w: 1,  h: 1, group: "numpad", qmkPoint: [193, 27], defaultKeycode: 0x005F /* KC_P7 */ },
    { id: "P8",   label: "8",     matrix: [12, 0], x: 19.5, y: 2.25, w: 1,  h: 1, group: "numpad", qmkPoint: [203, 27], defaultKeycode: 0x0060 /* KC_P8 */ },
    { id: "P9",   label: "9",     matrix: [13, 0], x: 20.5, y: 2.25, w: 1,  h: 1, group: "numpad", qmkPoint: [214, 27], defaultKeycode: 0x0061 /* KC_P9 */ },
    { id: "PPLS", label: "+",     matrix: [11, 3], x: 21.5, y: 2.25, w: 1,  h: 2, group: "numpad", qmkPoint: [224, 34], defaultKeycode: 0x0057 /* KC_PPLS */ },

    // --- ROW 3: Home Row (y = 3.25) ---
    { id: "CAPS", label: "Caps",  matrix: [2, 1], x: 0,    y: 3.25, w: 1.75, h: 1, group: "mod", qmkPoint: [4, 40], defaultKeycode: 0x0039 /* KC_CAPS */ },
    { id: "A",    label: "A",     matrix: [1, 2], x: 1.75, y: 3.25, w: 1,    h: 1, group: "alpha", qmkPoint: [18, 40], defaultKeycode: 0x0004 /* KC_A */ },
    { id: "S",    label: "S",     matrix: [2, 2], x: 2.75, y: 3.25, w: 1,    h: 1, group: "alpha", qmkPoint: [29, 40], defaultKeycode: 0x0016 /* KC_S */ },
    { id: "D",    label: "D",     matrix: [3, 2], x: 3.75, y: 3.25, w: 1,    h: 1, group: "alpha", qmkPoint: [39, 40], defaultKeycode: 0x0007 /* KC_D */ },
    { id: "F",    label: "F",     matrix: [4, 2], x: 4.75, y: 3.25, w: 1,    h: 1, group: "alpha", qmkPoint: [50, 40], defaultKeycode: 0x0009 /* KC_F */ },
    { id: "G",    label: "G",     matrix: [4, 3], x: 5.75, y: 3.25, w: 1,    h: 1, group: "alpha", qmkPoint: [60, 40], defaultKeycode: 0x000A /* KC_G */ },
    { id: "H",    label: "H",     matrix: [5, 3], x: 6.75, y: 3.25, w: 1,    h: 1, group: "alpha", qmkPoint: [70, 40], defaultKeycode: 0x000B /* KC_H */ },
    { id: "J",    label: "J",     matrix: [5, 2], x: 7.75, y: 3.25, w: 1,    h: 1, group: "alpha", qmkPoint: [81, 40], defaultKeycode: 0x000D /* KC_J */ },
    { id: "K",    label: "K",     matrix: [6, 2], x: 8.75, y: 3.25, w: 1,    h: 1, group: "alpha", qmkPoint: [91, 40], defaultKeycode: 0x000E /* KC_K */ },
    { id: "L",    label: "L",     matrix: [7, 2], x: 9.75, y: 3.25, w: 1,    h: 1, group: "alpha", qmkPoint: [102, 40], defaultKeycode: 0x000F /* KC_L */ },
    { id: "SCLN", label: ": ;",   matrix: [8, 2], x: 10.75, y: 3.25, w: 1,   h: 1, group: "alpha", qmkPoint: [112, 40], defaultKeycode: 0x0033 /* KC_SCLN */ },
    { id: "QUOT", label: "\" '",  matrix: [8, 3], x: 11.75, y: 3.25, w: 1,   h: 1, group: "alpha", qmkPoint: [123, 40], defaultKeycode: 0x0034 /* KC_QUOT */ },
    { id: "ENT",  label: "Enter", matrix: [10, 4], x: 12.75, y: 3.25, w: 2.25, h: 1, group: "mod", qmkPoint: [139, 40], defaultKeycode: 0x0028 /* KC_ENT */ },
    { id: "P4",   label: "4",     matrix: [11, 1], x: 18.5, y: 3.25, w: 1,   h: 1, group: "numpad", qmkPoint: [193, 40], defaultKeycode: 0x005C /* KC_P4 */ },
    { id: "P5",   label: "5",     matrix: [12, 1], x: 19.5, y: 3.25, w: 1,   h: 1, group: "numpad", qmkPoint: [203, 40], defaultKeycode: 0x005D /* KC_P5 */ },
    { id: "P6",   label: "6",     matrix: [13, 1], x: 20.5, y: 3.25, w: 1,   h: 1, group: "numpad", qmkPoint: [214, 40], defaultKeycode: 0x005E /* KC_P6 */ },

    // --- ROW 4: Shift Row (y = 4.25) ---
    { id: "LSFT", label: "Shift", matrix: [0, 0], x: 0,    y: 4.25, w: 2.25, h: 1, group: "mod", qmkPoint: [7, 52], defaultKeycode: 0x00E1 /* KC_LSFT */ },
    { id: "Z",    label: "Z",     matrix: [1, 4], x: 2.25, y: 4.25, w: 1,    h: 1, group: "alpha", qmkPoint: [23, 52], defaultKeycode: 0x001D /* KC_Z */ },
    { id: "X",    label: "X",     matrix: [2, 4], x: 3.25, y: 4.25, w: 1,    h: 1, group: "alpha", qmkPoint: [34, 52], defaultKeycode: 0x001B /* KC_X */ },
    { id: "C",    label: "C",     matrix: [3, 4], x: 4.25, y: 4.25, w: 1,    h: 1, group: "alpha", qmkPoint: [44, 52], defaultKeycode: 0x0006 /* KC_C */ },
    { id: "V",    label: "V",     matrix: [4, 4], x: 5.25, y: 4.25, w: 1,    h: 1, group: "alpha", qmkPoint: [55, 52], defaultKeycode: 0x0019 /* KC_V */ },
    { id: "B",    label: "B",     matrix: [4, 5], x: 6.25, y: 4.25, w: 1,    h: 1, group: "alpha", qmkPoint: [65, 52], defaultKeycode: 0x0005 /* KC_B */ },
    { id: "N",    label: "N",     matrix: [5, 5], x: 7.25, y: 4.25, w: 1,    h: 1, group: "alpha", qmkPoint: [76, 52], defaultKeycode: 0x0011 /* KC_N */ },
    { id: "M",    label: "M",     matrix: [5, 4], x: 8.25, y: 4.25, w: 1,    h: 1, group: "alpha", qmkPoint: [86, 52], defaultKeycode: 0x0010 /* KC_M */ },
    { id: "COMM", label: "< ,",   matrix: [6, 4], x: 9.25, y: 4.25, w: 1,    h: 1, group: "alpha", qmkPoint: [96, 52], defaultKeycode: 0x0036 /* KC_COMM */ },
    { id: "DOT",  label: "> .",   matrix: [7, 4], x: 10.25, y: 4.25, w: 1,   h: 1, group: "alpha", qmkPoint: [107, 52], defaultKeycode: 0x0037 /* KC_DOT */ },
    { id: "SLSH", label: "? /",   matrix: [8, 5], x: 11.25, y: 4.25, w: 1,   h: 1, group: "alpha", qmkPoint: [117, 52], defaultKeycode: 0x0038 /* KC_SLSH */ },
    { id: "RSFT", label: "Shift", matrix: [9, 1], x: 12.25, y: 4.25, w: 2.75, h: 1, group: "mod", qmkPoint: [137, 52], defaultKeycode: 0x00E5 /* KC_RSFT */ },
    { id: "UP",   label: "▲",     matrix: [3, 5], x: 16.25, y: 4.25, w: 1,   h: 1, group: "nav", qmkPoint: [169, 52], defaultKeycode: 0x0052 /* KC_UP */ },
    { id: "P1",   label: "1",     matrix: [11, 2], x: 18.5, y: 4.25, w: 1,   h: 1, group: "numpad", qmkPoint: [193, 52], defaultKeycode: 0x0059 /* KC_P1 */ },
    { id: "P2",   label: "2",     matrix: [12, 2], x: 19.5, y: 4.25, w: 1,   h: 1, group: "numpad", qmkPoint: [203, 52], defaultKeycode: 0x005A /* KC_P2 */ },
    { id: "P3",   label: "3",     matrix: [13, 2], x: 20.5, y: 4.25, w: 1,   h: 1, group: "numpad", qmkPoint: [214, 52], defaultKeycode: 0x005B /* KC_P3 */ },
    { id: "PENT", label: "Enter", matrix: [13, 6], x: 21.5, y: 4.25, w: 1,   h: 2, group: "numpad", qmkPoint: [224, 58], defaultKeycode: 0x0058 /* KC_PENT */ },

    // --- ROW 5: Bottom Row (y = 5.25) ---
    { id: "LCTL", label: "Ctrl",  matrix: [0, 6], x: 0,    y: 5.25, w: 1.25, h: 1, group: "mod", qmkPoint: [1, 64], defaultKeycode: 0x00E0 /* KC_LCTL */ },
    { id: "LWIN", label: "Win",   matrix: [9, 0], x: 1.25, y: 5.25, w: 1.25, h: 1, group: "mod", qmkPoint: [14, 64], defaultKeycode: 0x00E3 /* KC_LGUI */ },
    { id: "LALT", label: "Alt",   matrix: [9, 3], x: 2.5,  y: 5.25, w: 1.25, h: 1, group: "mod", qmkPoint: [27, 64], defaultKeycode: 0x00E2 /* KC_LALT */ },
    { id: "SPC",  label: "Space", matrix: [9, 4], x: 3.75, y: 5.25, w: 6.25, h: 1, group: "alpha", qmkPoint: [66, 64], defaultKeycode: 0x002C /* KC_SPC */ },
    { id: "RALT", label: "Alt",   matrix: [9, 5], x: 10,   y: 5.25, w: 1.25, h: 1, group: "mod", qmkPoint: [105, 64], defaultKeycode: 0x00E6 /* KC_RALT */ },
    { id: "FN",   label: "Fn",    matrix: [9, 2], x: 11.25, y: 5.25, w: 1.25, h: 1, group: "mod", qmkPoint: [118, 64], defaultKeycode: 0x5201 /* MO(1) */ },
    { id: "APP",  label: "Menu",  matrix: [8, 4], x: 12.5, y: 5.25, w: 1.25, h: 1, group: "mod", qmkPoint: [131, 64], defaultKeycode: 0x0065 /* KC_APP */ },
    { id: "RCTL", label: "Ctrl",  matrix: [0, 4], x: 13.75, y: 5.25, w: 1.25, h: 1, group: "mod", qmkPoint: [145, 64], defaultKeycode: 0x00E4 /* KC_RCTL */ },
    { id: "LEFT", label: "◀",     matrix: [0, 3], x: 15.25, y: 5.25, w: 1,   h: 1, group: "nav", qmkPoint: [159, 64], defaultKeycode: 0x0050 /* KC_LEFT */ },
    { id: "DOWN", label: "▼",     matrix: [7, 3], x: 16.25, y: 5.25, w: 1,   h: 1, group: "nav", qmkPoint: [169, 64], defaultKeycode: 0x0051 /* KC_DOWN */ },
    { id: "RGHT", label: "▶",     matrix: [0, 5], x: 17.25, y: 5.25, w: 1,   h: 1, group: "nav", qmkPoint: [180, 64], defaultKeycode: 0x004F /* KC_RGHT */ },
    { id: "P0",   label: "0",     matrix: [12, 3], x: 18.5, y: 5.25, w: 2,   h: 1, group: "numpad", qmkPoint: [198, 64], defaultKeycode: 0x0062 /* KC_P0 */ },
    { id: "PDOT", label: ".",     matrix: [13, 3], x: 20.5, y: 5.25, w: 1,   h: 1, group: "numpad", qmkPoint: [214, 64], defaultKeycode: 0x0063 /* KC_PDOT */ }
  ];

  const GMMK3_ENCODER = {
    id: "ENCODER_0",
    name: "Volume Knob",
    encoderIndex: 0,
    pressMatrix: [11, 6],
    directions: [
      { id: "CCW", name: "Rotate Left (CCW)", default: 0x00AA /* KC_VOLD */ },
      { id: "CW",  name: "Rotate Right (CW)", default: 0x00A9 /* KC_VOLU */ }
    ]
  };

  const GMMK3_SIDE_LEDS = {
    left: [
      { id: "SLED1",  x: 0, y: 1.02, qmkPoint: [0, 10] },
      { id: "SLED2",  x: 0, y: 1.48, qmkPoint: [0, 16] },
      { id: "SLED3",  x: 0, y: 1.95, qmkPoint: [0, 22] },
      { id: "SLED4",  x: 0, y: 2.41, qmkPoint: [0, 28] },
      { id: "SLED5",  x: 0, y: 2.87, qmkPoint: [0, 34] },
      { id: "SLED6",  x: 0, y: 3.33, qmkPoint: [0, 40] },
      { id: "SLED7",  x: 0, y: 3.79, qmkPoint: [0, 46] },
      { id: "SLED8",  x: 0, y: 4.26, qmkPoint: [0, 52] },
      { id: "SLED9",  x: 0, y: 4.72, qmkPoint: [0, 58] },
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

  window.GMMK3_LAYOUT = GMMK3_LAYOUT;
  window.GMMK3_ENCODER = GMMK3_ENCODER;
  window.GMMK3_SIDE_LEDS = GMMK3_SIDE_LEDS;
})();
