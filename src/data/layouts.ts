import { KeyLayoutItem } from '../types/keyboard';

export const LAYOUT_100_ANSI = [
  {
    "id": "ESC",
    "label": "Esc",
    "matrix": [
      1,
      3
    ],
    "x": 0,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 41
  },
  {
    "id": "F1",
    "label": "F1",
    "matrix": [
      2,
      6
    ],
    "x": 2,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 58
  },
  {
    "id": "F2",
    "label": "F2",
    "matrix": [
      3,
      6
    ],
    "x": 3,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 59
  },
  {
    "id": "F3",
    "label": "F3",
    "matrix": [
      3,
      1
    ],
    "x": 4,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 60
  },
  {
    "id": "F4",
    "label": "F4",
    "matrix": [
      3,
      3
    ],
    "x": 5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 61
  },
  {
    "id": "F5",
    "label": "F5",
    "matrix": [
      0,
      7
    ],
    "x": 6.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 62
  },
  {
    "id": "F6",
    "label": "F6",
    "matrix": [
      6,
      3
    ],
    "x": 7.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 63
  },
  {
    "id": "F7",
    "label": "F7",
    "matrix": [
      7,
      1
    ],
    "x": 8.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 64
  },
  {
    "id": "F8",
    "label": "F8",
    "matrix": [
      7,
      6
    ],
    "x": 9.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 65
  },
  {
    "id": "F9",
    "label": "F9",
    "matrix": [
      10,
      6
    ],
    "x": 11,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 66
  },
  {
    "id": "F10",
    "label": "F10",
    "matrix": [
      10,
      7
    ],
    "x": 12,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 67
  },
  {
    "id": "F11",
    "label": "F11",
    "matrix": [
      10,
      3
    ],
    "x": 13,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 68
  },
  {
    "id": "F12",
    "label": "F12",
    "matrix": [
      10,
      5
    ],
    "x": 14,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 69
  },
  {
    "id": "PSCR",
    "label": "PrtSc",
    "matrix": [
      9,
      7
    ],
    "x": 15.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 70
  },
  {
    "id": "SCRL",
    "label": "ScrLk",
    "matrix": [
      10,
      0
    ],
    "x": 16.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 71
  },
  {
    "id": "PAUS",
    "label": "Pause",
    "matrix": [
      9,
      6
    ],
    "x": 17.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 72
  },
  {
    "id": "LOGO_LED",
    "label": "",
    "matrix": [
      -1,
      -1
    ],
    "x": 20.75,
    "y": 0.37,
    "w": 0.6,
    "h": 0.26,
    "group": "logo",
    "isLogo": true
  },
  {
    "id": "KNOB_PRESS",
    "label": "Mute",
    "matrix": [
      11,
      6
    ],
    "x": 21.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "knob",
    "isKnob": true,
    "defaultKeycode": 168
  },
  {
    "id": "GRV",
    "label": "~ `",
    "matrix": [
      1,
      6
    ],
    "x": 0,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 53
  },
  {
    "id": "1",
    "label": "! 1",
    "matrix": [
      1,
      7
    ],
    "x": 1,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 30
  },
  {
    "id": "2",
    "label": "@ 2",
    "matrix": [
      2,
      7
    ],
    "x": 2,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 31
  },
  {
    "id": "3",
    "label": "# 3",
    "matrix": [
      3,
      7
    ],
    "x": 3,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 32
  },
  {
    "id": "4",
    "label": "$ 4",
    "matrix": [
      4,
      7
    ],
    "x": 4,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 33
  },
  {
    "id": "5",
    "label": "% 5",
    "matrix": [
      4,
      6
    ],
    "x": 5,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 34
  },
  {
    "id": "6",
    "label": "^ 6",
    "matrix": [
      5,
      6
    ],
    "x": 6,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 35
  },
  {
    "id": "7",
    "label": "& 7",
    "matrix": [
      5,
      7
    ],
    "x": 7,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 36
  },
  {
    "id": "8",
    "label": "* 8",
    "matrix": [
      6,
      7
    ],
    "x": 8,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 37
  },
  {
    "id": "9",
    "label": "( 9",
    "matrix": [
      7,
      7
    ],
    "x": 9,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 38
  },
  {
    "id": "0",
    "label": ") 0",
    "matrix": [
      8,
      7
    ],
    "x": 10,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 39
  },
  {
    "id": "MINS",
    "label": "_ -",
    "matrix": [
      8,
      6
    ],
    "x": 11,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 45
  },
  {
    "id": "EQL",
    "label": "+ =",
    "matrix": [
      6,
      6
    ],
    "x": 12,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 46
  },
  {
    "id": "BSPC",
    "label": "Bksp",
    "matrix": [
      10,
      1
    ],
    "x": 13,
    "y": 1.25,
    "w": 2,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 42
  },
  {
    "id": "INS",
    "label": "Ins",
    "matrix": [
      7,
      5
    ],
    "x": 15.25,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 73
  },
  {
    "id": "HOME",
    "label": "Home",
    "matrix": [
      0,
      2
    ],
    "x": 16.25,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 74
  },
  {
    "id": "PGUP",
    "label": "PgUp",
    "matrix": [
      1,
      5
    ],
    "x": 17.25,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 75
  },
  {
    "id": "NUM",
    "label": "Num",
    "matrix": [
      11,
      4
    ],
    "x": 18.5,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 83
  },
  {
    "id": "PSLS",
    "label": "/",
    "matrix": [
      12,
      4
    ],
    "x": 19.5,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 84
  },
  {
    "id": "PAST",
    "label": "*",
    "matrix": [
      13,
      4
    ],
    "x": 20.5,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 85
  },
  {
    "id": "PMNS",
    "label": "-",
    "matrix": [
      13,
      5
    ],
    "x": 21.5,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 86
  },
  {
    "id": "TAB",
    "label": "Tab",
    "matrix": [
      1,
      1
    ],
    "x": 0,
    "y": 2.25,
    "w": 1.5,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 43
  },
  {
    "id": "Q",
    "label": "Q",
    "matrix": [
      1,
      0
    ],
    "x": 1.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 20
  },
  {
    "id": "W",
    "label": "W",
    "matrix": [
      2,
      0
    ],
    "x": 2.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 26
  },
  {
    "id": "E",
    "label": "E",
    "matrix": [
      3,
      0
    ],
    "x": 3.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 8
  },
  {
    "id": "R",
    "label": "R",
    "matrix": [
      4,
      0
    ],
    "x": 4.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 21
  },
  {
    "id": "T",
    "label": "T",
    "matrix": [
      4,
      1
    ],
    "x": 5.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 23
  },
  {
    "id": "Y",
    "label": "Y",
    "matrix": [
      5,
      1
    ],
    "x": 6.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 28
  },
  {
    "id": "U",
    "label": "U",
    "matrix": [
      5,
      0
    ],
    "x": 7.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 24
  },
  {
    "id": "I",
    "label": "I",
    "matrix": [
      6,
      0
    ],
    "x": 8.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 12
  },
  {
    "id": "O",
    "label": "O",
    "matrix": [
      7,
      0
    ],
    "x": 9.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 18
  },
  {
    "id": "P",
    "label": "P",
    "matrix": [
      8,
      0
    ],
    "x": 10.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 19
  },
  {
    "id": "LBRC",
    "label": "{ [",
    "matrix": [
      8,
      1
    ],
    "x": 11.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 47
  },
  {
    "id": "RBRC",
    "label": "} ]",
    "matrix": [
      6,
      1
    ],
    "x": 12.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 48
  },
  {
    "id": "BSLS",
    "label": "| \\",
    "matrix": [
      10,
      2
    ],
    "x": 13.5,
    "y": 2.25,
    "w": 1.5,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 49
  },
  {
    "id": "DEL",
    "label": "Del",
    "matrix": [
      6,
      5
    ],
    "x": 15.25,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 76
  },
  {
    "id": "END",
    "label": "End",
    "matrix": [
      12,
      6
    ],
    "x": 16.25,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 77
  },
  {
    "id": "PGDN",
    "label": "PgDn",
    "matrix": [
      2,
      5
    ],
    "x": 17.25,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 78
  },
  {
    "id": "P7",
    "label": "7",
    "matrix": [
      11,
      0
    ],
    "x": 18.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 95
  },
  {
    "id": "P8",
    "label": "8",
    "matrix": [
      12,
      0
    ],
    "x": 19.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 96
  },
  {
    "id": "P9",
    "label": "9",
    "matrix": [
      13,
      0
    ],
    "x": 20.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 97
  },
  {
    "id": "PPLS",
    "label": "+",
    "matrix": [
      11,
      3
    ],
    "x": 21.5,
    "y": 2.25,
    "w": 1,
    "h": 2,
    "group": "numpad",
    "defaultKeycode": 87
  },
  {
    "id": "CAPS",
    "label": "Caps",
    "matrix": [
      2,
      1
    ],
    "x": 0,
    "y": 3.25,
    "w": 1.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 57
  },
  {
    "id": "A",
    "label": "A",
    "matrix": [
      1,
      2
    ],
    "x": 1.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 4
  },
  {
    "id": "S",
    "label": "S",
    "matrix": [
      2,
      2
    ],
    "x": 2.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 22
  },
  {
    "id": "D",
    "label": "D",
    "matrix": [
      3,
      2
    ],
    "x": 3.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 7
  },
  {
    "id": "F",
    "label": "F",
    "matrix": [
      4,
      2
    ],
    "x": 4.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 9
  },
  {
    "id": "G",
    "label": "G",
    "matrix": [
      4,
      3
    ],
    "x": 5.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 10
  },
  {
    "id": "H",
    "label": "H",
    "matrix": [
      5,
      3
    ],
    "x": 6.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 11
  },
  {
    "id": "J",
    "label": "J",
    "matrix": [
      5,
      2
    ],
    "x": 7.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 13
  },
  {
    "id": "K",
    "label": "K",
    "matrix": [
      6,
      2
    ],
    "x": 8.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 14
  },
  {
    "id": "L",
    "label": "L",
    "matrix": [
      7,
      2
    ],
    "x": 9.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 15
  },
  {
    "id": "SCLN",
    "label": ": ;",
    "matrix": [
      8,
      2
    ],
    "x": 10.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 51
  },
  {
    "id": "QUOT",
    "label": "\" '",
    "matrix": [
      8,
      3
    ],
    "x": 11.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 52
  },
  {
    "id": "ENT",
    "label": "Enter",
    "matrix": [
      10,
      4
    ],
    "x": 12.75,
    "y": 3.25,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 40
  },
  {
    "id": "P4",
    "label": "4",
    "matrix": [
      11,
      1
    ],
    "x": 18.5,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 92
  },
  {
    "id": "P5",
    "label": "5",
    "matrix": [
      12,
      1
    ],
    "x": 19.5,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 93
  },
  {
    "id": "P6",
    "label": "6",
    "matrix": [
      13,
      1
    ],
    "x": 20.5,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 94
  },
  {
    "id": "LSFT",
    "label": "Shift",
    "matrix": [
      0,
      0
    ],
    "x": 0,
    "y": 4.25,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 225
  },
  {
    "id": "Z",
    "label": "Z",
    "matrix": [
      1,
      4
    ],
    "x": 2.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 29
  },
  {
    "id": "X",
    "label": "X",
    "matrix": [
      2,
      4
    ],
    "x": 3.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 27
  },
  {
    "id": "C",
    "label": "C",
    "matrix": [
      3,
      4
    ],
    "x": 4.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 6
  },
  {
    "id": "V",
    "label": "V",
    "matrix": [
      4,
      4
    ],
    "x": 5.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 25
  },
  {
    "id": "B",
    "label": "B",
    "matrix": [
      4,
      5
    ],
    "x": 6.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 5
  },
  {
    "id": "N",
    "label": "N",
    "matrix": [
      5,
      5
    ],
    "x": 7.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 17
  },
  {
    "id": "M",
    "label": "M",
    "matrix": [
      5,
      4
    ],
    "x": 8.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 16
  },
  {
    "id": "COMM",
    "label": "< ,",
    "matrix": [
      6,
      4
    ],
    "x": 9.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 54
  },
  {
    "id": "DOT",
    "label": "> .",
    "matrix": [
      7,
      4
    ],
    "x": 10.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 55
  },
  {
    "id": "SLSH",
    "label": "? /",
    "matrix": [
      8,
      5
    ],
    "x": 11.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 56
  },
  {
    "id": "RSFT",
    "label": "Shift",
    "matrix": [
      9,
      1
    ],
    "x": 12.25,
    "y": 4.25,
    "w": 2.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 229
  },
  {
    "id": "UP",
    "label": "▲",
    "matrix": [
      3,
      5
    ],
    "x": 16.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 82
  },
  {
    "id": "P1",
    "label": "1",
    "matrix": [
      11,
      2
    ],
    "x": 18.5,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 89
  },
  {
    "id": "P2",
    "label": "2",
    "matrix": [
      12,
      2
    ],
    "x": 19.5,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 90
  },
  {
    "id": "P3",
    "label": "3",
    "matrix": [
      13,
      2
    ],
    "x": 20.5,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 91
  },
  {
    "id": "PENT",
    "label": "Enter",
    "matrix": [
      13,
      6
    ],
    "x": 21.5,
    "y": 4.25,
    "w": 1,
    "h": 2,
    "group": "numpad",
    "defaultKeycode": 88
  },
  {
    "id": "LCTL",
    "label": "Ctrl",
    "matrix": [
      0,
      6
    ],
    "x": 0,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 224
  },
  {
    "id": "LWIN",
    "label": "Win",
    "matrix": [
      9,
      0
    ],
    "x": 1.25,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 227
  },
  {
    "id": "LALT",
    "label": "Alt",
    "matrix": [
      9,
      3
    ],
    "x": 2.5,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 226
  },
  {
    "id": "SPC",
    "label": "Space",
    "matrix": [
      9,
      4
    ],
    "x": 3.75,
    "y": 5.25,
    "w": 6.25,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 44,
    "qmkPoint": [
      66,
      64
    ]
  },
  {
    "id": "RALT",
    "label": "Alt",
    "matrix": [
      9,
      5
    ],
    "x": 10,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 230
  },
  {
    "id": "FN",
    "label": "Fn",
    "matrix": [
      9,
      2
    ],
    "x": 11.25,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 20993
  },
  {
    "id": "APP",
    "label": "Menu",
    "matrix": [
      8,
      4
    ],
    "x": 12.5,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 101
  },
  {
    "id": "RCTL",
    "label": "Ctrl",
    "matrix": [
      0,
      4
    ],
    "x": 13.75,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 228
  },
  {
    "id": "LEFT",
    "label": "◀",
    "matrix": [
      0,
      3
    ],
    "x": 15.25,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 80
  },
  {
    "id": "DOWN",
    "label": "▼",
    "matrix": [
      7,
      3
    ],
    "x": 16.25,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 81
  },
  {
    "id": "RGHT",
    "label": "▶",
    "matrix": [
      0,
      5
    ],
    "x": 17.25,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 79
  },
  {
    "id": "P0",
    "label": "0",
    "matrix": [
      12,
      3
    ],
    "x": 18.5,
    "y": 5.25,
    "w": 2,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 98
  },
  {
    "id": "PDOT",
    "label": ".",
    "matrix": [
      13,
      3
    ],
    "x": 20.5,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 99
  }
] as KeyLayoutItem[];
export const LAYOUT_75_ANSI = [
  {
    "id": "ESC",
    "label": "Esc",
    "matrix": [
      1,
      3
    ],
    "x": 0,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 41
  },
  {
    "id": "F1",
    "label": "F1",
    "matrix": [
      2,
      6
    ],
    "x": 1.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 58
  },
  {
    "id": "F2",
    "label": "F2",
    "matrix": [
      3,
      6
    ],
    "x": 2.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 59
  },
  {
    "id": "F3",
    "label": "F3",
    "matrix": [
      3,
      1
    ],
    "x": 3.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 60
  },
  {
    "id": "F4",
    "label": "F4",
    "matrix": [
      3,
      3
    ],
    "x": 4.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 61
  },
  {
    "id": "F5",
    "label": "F5",
    "matrix": [
      0,
      7
    ],
    "x": 5.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 62
  },
  {
    "id": "F6",
    "label": "F6",
    "matrix": [
      6,
      3
    ],
    "x": 6.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 63
  },
  {
    "id": "F7",
    "label": "F7",
    "matrix": [
      7,
      1
    ],
    "x": 7.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 64
  },
  {
    "id": "F8",
    "label": "F8",
    "matrix": [
      7,
      6
    ],
    "x": 8.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 65
  },
  {
    "id": "F9",
    "label": "F9",
    "matrix": [
      10,
      6
    ],
    "x": 9.75,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 66
  },
  {
    "id": "F10",
    "label": "F10",
    "matrix": [
      10,
      7
    ],
    "x": 10.75,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 67
  },
  {
    "id": "F11",
    "label": "F11",
    "matrix": [
      10,
      3
    ],
    "x": 11.75,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 68
  },
  {
    "id": "F12",
    "label": "F12",
    "matrix": [
      10,
      5
    ],
    "x": 12.75,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 69
  },
  {
    "id": "LOGO_LED",
    "label": "",
    "matrix": [
      -1,
      -1
    ],
    "x": 14.1,
    "y": 0.37,
    "w": 0.55,
    "h": 0.26,
    "group": "logo",
    "isLogo": true
  },
  {
    "id": "KNOB_PRESS",
    "label": "Mute",
    "matrix": [
      11,
      6
    ],
    "x": 15,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "knob",
    "isKnob": true,
    "defaultKeycode": 168
  },
  {
    "id": "GRV",
    "label": "~ `",
    "matrix": [
      1,
      6
    ],
    "x": 0,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 53
  },
  {
    "id": "1",
    "label": "! 1",
    "matrix": [
      1,
      7
    ],
    "x": 1,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 30
  },
  {
    "id": "2",
    "label": "@ 2",
    "matrix": [
      2,
      7
    ],
    "x": 2,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 31
  },
  {
    "id": "3",
    "label": "# 3",
    "matrix": [
      3,
      7
    ],
    "x": 3,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 32
  },
  {
    "id": "4",
    "label": "$ 4",
    "matrix": [
      4,
      7
    ],
    "x": 4,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 33
  },
  {
    "id": "5",
    "label": "% 5",
    "matrix": [
      4,
      6
    ],
    "x": 5,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 34
  },
  {
    "id": "6",
    "label": "^ 6",
    "matrix": [
      5,
      6
    ],
    "x": 6,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 35
  },
  {
    "id": "7",
    "label": "& 7",
    "matrix": [
      5,
      7
    ],
    "x": 7,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 36
  },
  {
    "id": "8",
    "label": "* 8",
    "matrix": [
      6,
      7
    ],
    "x": 8,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 37
  },
  {
    "id": "9",
    "label": "( 9",
    "matrix": [
      7,
      7
    ],
    "x": 9,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 38
  },
  {
    "id": "0",
    "label": ") 0",
    "matrix": [
      8,
      7
    ],
    "x": 10,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 39
  },
  {
    "id": "MINS",
    "label": "_ -",
    "matrix": [
      8,
      6
    ],
    "x": 11,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 45
  },
  {
    "id": "EQL",
    "label": "+ =",
    "matrix": [
      6,
      6
    ],
    "x": 12,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 46
  },
  {
    "id": "BSPC",
    "label": "Bksp",
    "matrix": [
      10,
      1
    ],
    "x": 13,
    "y": 1.25,
    "w": 2,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 42
  },
  {
    "id": "DEL",
    "label": "Del",
    "matrix": [
      6,
      5
    ],
    "x": 15,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 76
  },
  {
    "id": "TAB",
    "label": "Tab",
    "matrix": [
      1,
      1
    ],
    "x": 0,
    "y": 2.25,
    "w": 1.5,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 43
  },
  {
    "id": "Q",
    "label": "Q",
    "matrix": [
      1,
      0
    ],
    "x": 1.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 20
  },
  {
    "id": "W",
    "label": "W",
    "matrix": [
      2,
      0
    ],
    "x": 2.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 26
  },
  {
    "id": "E",
    "label": "E",
    "matrix": [
      3,
      0
    ],
    "x": 3.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 8
  },
  {
    "id": "R",
    "label": "R",
    "matrix": [
      4,
      0
    ],
    "x": 4.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 21
  },
  {
    "id": "T",
    "label": "T",
    "matrix": [
      4,
      1
    ],
    "x": 5.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 23
  },
  {
    "id": "Y",
    "label": "Y",
    "matrix": [
      5,
      1
    ],
    "x": 6.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 28
  },
  {
    "id": "U",
    "label": "U",
    "matrix": [
      5,
      0
    ],
    "x": 7.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 24
  },
  {
    "id": "I",
    "label": "I",
    "matrix": [
      6,
      0
    ],
    "x": 8.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 12
  },
  {
    "id": "O",
    "label": "O",
    "matrix": [
      7,
      0
    ],
    "x": 9.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 18
  },
  {
    "id": "P",
    "label": "P",
    "matrix": [
      8,
      0
    ],
    "x": 10.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 19
  },
  {
    "id": "LBRC",
    "label": "{ [",
    "matrix": [
      8,
      1
    ],
    "x": 11.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 47
  },
  {
    "id": "RBRC",
    "label": "} ]",
    "matrix": [
      6,
      1
    ],
    "x": 12.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 48
  },
  {
    "id": "BSLS",
    "label": "| \\",
    "matrix": [
      10,
      2
    ],
    "x": 13.5,
    "y": 2.25,
    "w": 1.5,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 49
  },
  {
    "id": "PGUP",
    "label": "PgUp",
    "matrix": [
      1,
      5
    ],
    "x": 15,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 75
  },
  {
    "id": "CAPS",
    "label": "Caps",
    "matrix": [
      2,
      1
    ],
    "x": 0,
    "y": 3.25,
    "w": 1.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 57
  },
  {
    "id": "A",
    "label": "A",
    "matrix": [
      1,
      2
    ],
    "x": 1.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 4
  },
  {
    "id": "S",
    "label": "S",
    "matrix": [
      2,
      2
    ],
    "x": 2.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 22
  },
  {
    "id": "D",
    "label": "D",
    "matrix": [
      3,
      2
    ],
    "x": 3.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 7
  },
  {
    "id": "F",
    "label": "F",
    "matrix": [
      4,
      2
    ],
    "x": 4.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 9
  },
  {
    "id": "G",
    "label": "G",
    "matrix": [
      4,
      3
    ],
    "x": 5.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 10
  },
  {
    "id": "H",
    "label": "H",
    "matrix": [
      5,
      3
    ],
    "x": 6.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 11
  },
  {
    "id": "J",
    "label": "J",
    "matrix": [
      5,
      2
    ],
    "x": 7.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 13
  },
  {
    "id": "K",
    "label": "K",
    "matrix": [
      6,
      2
    ],
    "x": 8.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 14
  },
  {
    "id": "L",
    "label": "L",
    "matrix": [
      7,
      2
    ],
    "x": 9.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 15
  },
  {
    "id": "SCLN",
    "label": ": ;",
    "matrix": [
      8,
      2
    ],
    "x": 10.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 51
  },
  {
    "id": "QUOT",
    "label": "\" '",
    "matrix": [
      8,
      3
    ],
    "x": 11.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 52
  },
  {
    "id": "ENT",
    "label": "Enter",
    "matrix": [
      10,
      4
    ],
    "x": 12.75,
    "y": 3.25,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 40
  },
  {
    "id": "PGDN",
    "label": "PgDn",
    "matrix": [
      2,
      5
    ],
    "x": 15,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 78
  },
  {
    "id": "LSFT",
    "label": "Shift",
    "matrix": [
      0,
      0
    ],
    "x": 0,
    "y": 4.25,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 225
  },
  {
    "id": "Z",
    "label": "Z",
    "matrix": [
      1,
      4
    ],
    "x": 2.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 29
  },
  {
    "id": "X",
    "label": "X",
    "matrix": [
      2,
      4
    ],
    "x": 3.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 27
  },
  {
    "id": "C",
    "label": "C",
    "matrix": [
      3,
      4
    ],
    "x": 4.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 6
  },
  {
    "id": "V",
    "label": "V",
    "matrix": [
      4,
      4
    ],
    "x": 5.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 25
  },
  {
    "id": "B",
    "label": "B",
    "matrix": [
      4,
      5
    ],
    "x": 6.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 5
  },
  {
    "id": "N",
    "label": "N",
    "matrix": [
      5,
      5
    ],
    "x": 7.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 17
  },
  {
    "id": "M",
    "label": "M",
    "matrix": [
      5,
      4
    ],
    "x": 8.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 16
  },
  {
    "id": "COMM",
    "label": "< ,",
    "matrix": [
      6,
      4
    ],
    "x": 9.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 54
  },
  {
    "id": "DOT",
    "label": "> .",
    "matrix": [
      7,
      4
    ],
    "x": 10.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 55
  },
  {
    "id": "SLSH",
    "label": "? /",
    "matrix": [
      8,
      5
    ],
    "x": 11.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 56
  },
  {
    "id": "RSFT",
    "label": "Shift",
    "matrix": [
      9,
      1
    ],
    "x": 12.25,
    "y": 4.25,
    "w": 1.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 229
  },
  {
    "id": "UP",
    "label": "▲",
    "matrix": [
      3,
      5
    ],
    "x": 14,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 82
  },
  {
    "id": "END",
    "label": "End",
    "matrix": [
      12,
      6
    ],
    "x": 15,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 77
  },
  {
    "id": "LCTL",
    "label": "Ctrl",
    "matrix": [
      0,
      6
    ],
    "x": 0,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 224
  },
  {
    "id": "LWIN",
    "label": "Win",
    "matrix": [
      9,
      0
    ],
    "x": 1.25,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 227
  },
  {
    "id": "LALT",
    "label": "Alt",
    "matrix": [
      9,
      3
    ],
    "x": 2.5,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 226
  },
  {
    "id": "SPC",
    "label": "Space",
    "matrix": [
      9,
      4
    ],
    "x": 3.75,
    "y": 5.25,
    "w": 6.25,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 44,
    "qmkPoint": [
      92,
      64
    ]
  },
  {
    "id": "RALT",
    "label": "Alt",
    "matrix": [
      9,
      5
    ],
    "x": 10,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 230
  },
  {
    "id": "FN",
    "label": "Fn",
    "matrix": [
      9,
      2
    ],
    "x": 11.25,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 20993
  },
  {
    "id": "LEFT",
    "label": "◀",
    "matrix": [
      0,
      3
    ],
    "x": 13,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 80
  },
  {
    "id": "DOWN",
    "label": "▼",
    "matrix": [
      7,
      3
    ],
    "x": 14,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 81
  },
  {
    "id": "RGHT",
    "label": "▶",
    "matrix": [
      0,
      5
    ],
    "x": 15,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 79
  }
] as KeyLayoutItem[];
export const LAYOUT_65_ANSI = [
  {
    "id": "ESC",
    "label": "Esc",
    "matrix": [
      1,
      6
    ],
    "x": 0,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 41
  },
  {
    "id": "1",
    "label": "! 1",
    "matrix": [
      1,
      7
    ],
    "x": 1,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 30
  },
  {
    "id": "2",
    "label": "@ 2",
    "matrix": [
      2,
      7
    ],
    "x": 2,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 31
  },
  {
    "id": "3",
    "label": "# 3",
    "matrix": [
      3,
      7
    ],
    "x": 3,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 32
  },
  {
    "id": "4",
    "label": "$ 4",
    "matrix": [
      4,
      7
    ],
    "x": 4,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 33
  },
  {
    "id": "5",
    "label": "% 5",
    "matrix": [
      4,
      6
    ],
    "x": 5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 34
  },
  {
    "id": "6",
    "label": "^ 6",
    "matrix": [
      5,
      6
    ],
    "x": 6,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 35
  },
  {
    "id": "7",
    "label": "& 7",
    "matrix": [
      5,
      7
    ],
    "x": 7,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 36
  },
  {
    "id": "8",
    "label": "* 8",
    "matrix": [
      6,
      7
    ],
    "x": 8,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 37
  },
  {
    "id": "9",
    "label": "( 9",
    "matrix": [
      7,
      7
    ],
    "x": 9,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 38
  },
  {
    "id": "0",
    "label": ") 0",
    "matrix": [
      8,
      7
    ],
    "x": 10,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 39
  },
  {
    "id": "MINS",
    "label": "_ -",
    "matrix": [
      8,
      6
    ],
    "x": 11,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 45
  },
  {
    "id": "EQL",
    "label": "+ =",
    "matrix": [
      6,
      6
    ],
    "x": 12,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 46
  },
  {
    "id": "BSPC",
    "label": "Bksp",
    "matrix": [
      10,
      1
    ],
    "x": 13,
    "y": 0,
    "w": 2,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 42
  },
  {
    "id": "KNOB_PRESS",
    "label": "Mute",
    "matrix": [
      11,
      6
    ],
    "x": 15,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "knob",
    "defaultKeycode": 127,
    "isKnob": true
  },
  {
    "id": "TAB",
    "label": "Tab",
    "matrix": [
      1,
      1
    ],
    "x": 0,
    "y": 1,
    "w": 1.5,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 43
  },
  {
    "id": "Q",
    "label": "Q",
    "matrix": [
      1,
      0
    ],
    "x": 1.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 20
  },
  {
    "id": "W",
    "label": "W",
    "matrix": [
      2,
      0
    ],
    "x": 2.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 26
  },
  {
    "id": "E",
    "label": "E",
    "matrix": [
      3,
      0
    ],
    "x": 3.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 8
  },
  {
    "id": "R",
    "label": "R",
    "matrix": [
      4,
      0
    ],
    "x": 4.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 21
  },
  {
    "id": "T",
    "label": "T",
    "matrix": [
      4,
      1
    ],
    "x": 5.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 23
  },
  {
    "id": "Y",
    "label": "Y",
    "matrix": [
      5,
      1
    ],
    "x": 6.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 28
  },
  {
    "id": "U",
    "label": "U",
    "matrix": [
      5,
      0
    ],
    "x": 7.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 24
  },
  {
    "id": "I",
    "label": "I",
    "matrix": [
      6,
      0
    ],
    "x": 8.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 12
  },
  {
    "id": "O",
    "label": "O",
    "matrix": [
      7,
      0
    ],
    "x": 9.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 18
  },
  {
    "id": "P",
    "label": "P",
    "matrix": [
      8,
      0
    ],
    "x": 10.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 19
  },
  {
    "id": "LBRC",
    "label": "{ [",
    "matrix": [
      8,
      1
    ],
    "x": 11.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 47
  },
  {
    "id": "RBRC",
    "label": "} ]",
    "matrix": [
      6,
      1
    ],
    "x": 12.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 48
  },
  {
    "id": "BSLS",
    "label": "| \\",
    "matrix": [
      10,
      2
    ],
    "x": 13.5,
    "y": 1,
    "w": 1.5,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 49
  },
  {
    "id": "CAPS",
    "label": "Caps",
    "matrix": [
      2,
      1
    ],
    "x": 0,
    "y": 2,
    "w": 1.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 57
  },
  {
    "id": "A",
    "label": "A",
    "matrix": [
      1,
      2
    ],
    "x": 1.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 4
  },
  {
    "id": "S",
    "label": "S",
    "matrix": [
      2,
      2
    ],
    "x": 2.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 22
  },
  {
    "id": "D",
    "label": "D",
    "matrix": [
      3,
      2
    ],
    "x": 3.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 7
  },
  {
    "id": "F",
    "label": "F",
    "matrix": [
      4,
      2
    ],
    "x": 4.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 9
  },
  {
    "id": "G",
    "label": "G",
    "matrix": [
      4,
      3
    ],
    "x": 5.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 10
  },
  {
    "id": "H",
    "label": "H",
    "matrix": [
      5,
      3
    ],
    "x": 6.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 11
  },
  {
    "id": "J",
    "label": "J",
    "matrix": [
      5,
      2
    ],
    "x": 7.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 13
  },
  {
    "id": "K",
    "label": "K",
    "matrix": [
      6,
      2
    ],
    "x": 8.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 14
  },
  {
    "id": "L",
    "label": "L",
    "matrix": [
      7,
      2
    ],
    "x": 9.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 15
  },
  {
    "id": "SCLN",
    "label": ": ;",
    "matrix": [
      8,
      2
    ],
    "x": 10.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 51
  },
  {
    "id": "QUOT",
    "label": "\" '",
    "matrix": [
      8,
      3
    ],
    "x": 11.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 52
  },
  {
    "id": "ENT",
    "label": "Enter",
    "matrix": [
      10,
      4
    ],
    "x": 12.75,
    "y": 2,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 40
  },
  {
    "id": "PGUP",
    "label": "PgUp",
    "matrix": [
      1,
      5
    ],
    "x": 15,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 75
  },
  {
    "id": "LSFT",
    "label": "Shift",
    "matrix": [
      0,
      0
    ],
    "x": 0,
    "y": 3,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 225
  },
  {
    "id": "Z",
    "label": "Z",
    "matrix": [
      1,
      4
    ],
    "x": 2.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 29
  },
  {
    "id": "X",
    "label": "X",
    "matrix": [
      2,
      4
    ],
    "x": 3.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 27
  },
  {
    "id": "C",
    "label": "C",
    "matrix": [
      3,
      4
    ],
    "x": 4.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 6
  },
  {
    "id": "V",
    "label": "V",
    "matrix": [
      4,
      4
    ],
    "x": 5.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 25
  },
  {
    "id": "B",
    "label": "B",
    "matrix": [
      4,
      5
    ],
    "x": 6.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 5
  },
  {
    "id": "N",
    "label": "N",
    "matrix": [
      5,
      5
    ],
    "x": 7.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 17
  },
  {
    "id": "M",
    "label": "M",
    "matrix": [
      5,
      4
    ],
    "x": 8.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 16
  },
  {
    "id": "COMM",
    "label": "< ,",
    "matrix": [
      6,
      4
    ],
    "x": 9.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 54
  },
  {
    "id": "DOT",
    "label": "> .",
    "matrix": [
      7,
      4
    ],
    "x": 10.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 55
  },
  {
    "id": "SLSH",
    "label": "? /",
    "matrix": [
      8,
      5
    ],
    "x": 11.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 56
  },
  {
    "id": "RSFT",
    "label": "Shift",
    "matrix": [
      9,
      1
    ],
    "x": 12.25,
    "y": 3,
    "w": 1.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 229
  },
  {
    "id": "UP",
    "label": "▲",
    "matrix": [
      3,
      5
    ],
    "x": 14,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 82
  },
  {
    "id": "END",
    "label": "End",
    "matrix": [
      2,
      5
    ],
    "x": 15,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 77
  },
  {
    "id": "LCTL",
    "label": "Ctrl",
    "matrix": [
      0,
      6
    ],
    "x": 0,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 224
  },
  {
    "id": "LWIN",
    "label": "Win",
    "matrix": [
      9,
      0
    ],
    "x": 1.25,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 227
  },
  {
    "id": "LALT",
    "label": "Alt",
    "matrix": [
      9,
      3
    ],
    "x": 2.5,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 226
  },
  {
    "id": "SPC",
    "label": "Space",
    "matrix": [
      9,
      4
    ],
    "x": 3.75,
    "y": 4,
    "w": 6.25,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 44,
    "qmkPoint": [
      97,
      64
    ]
  },
  {
    "id": "RALT",
    "label": "Alt",
    "matrix": [
      9,
      5
    ],
    "x": 10,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 230
  },
  {
    "id": "FN",
    "label": "Fn",
    "matrix": [
      9,
      2
    ],
    "x": 11.25,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 20993
  },
  {
    "id": "LEFT",
    "label": "◀",
    "matrix": [
      0,
      3
    ],
    "x": 13,
    "y": 4,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 80
  },
  {
    "id": "DOWN",
    "label": "▼",
    "matrix": [
      7,
      3
    ],
    "x": 14,
    "y": 4,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 81
  },
  {
    "id": "RGHT",
    "label": "▶",
    "matrix": [
      0,
      5
    ],
    "x": 15,
    "y": 4,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 79
  }
] as KeyLayoutItem[];

export const LAYOUT_GMMK2_65_ANSI = [
  {
    "id": "ESC",
    "label": "Esc",
    "matrix": [
      1,
      3
    ],
    "x": 0,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 41
  },
  {
    "id": "1",
    "label": "! 1",
    "matrix": [
      1,
      7
    ],
    "x": 1,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 30
  },
  {
    "id": "2",
    "label": "@ 2",
    "matrix": [
      2,
      7
    ],
    "x": 2,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 31
  },
  {
    "id": "3",
    "label": "# 3",
    "matrix": [
      3,
      7
    ],
    "x": 3,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 32
  },
  {
    "id": "4",
    "label": "$ 4",
    "matrix": [
      4,
      7
    ],
    "x": 4,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 33
  },
  {
    "id": "5",
    "label": "% 5",
    "matrix": [
      4,
      6
    ],
    "x": 5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 34
  },
  {
    "id": "6",
    "label": "^ 6",
    "matrix": [
      5,
      6
    ],
    "x": 6,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 35
  },
  {
    "id": "7",
    "label": "& 7",
    "matrix": [
      5,
      7
    ],
    "x": 7,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 36
  },
  {
    "id": "8",
    "label": "* 8",
    "matrix": [
      6,
      7
    ],
    "x": 8,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 37
  },
  {
    "id": "9",
    "label": "( 9",
    "matrix": [
      7,
      7
    ],
    "x": 9,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 38
  },
  {
    "id": "0",
    "label": ") 0",
    "matrix": [
      8,
      7
    ],
    "x": 10,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 39
  },
  {
    "id": "MINS",
    "label": "_ -",
    "matrix": [
      8,
      6
    ],
    "x": 11,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 45
  },
  {
    "id": "EQL",
    "label": "+ =",
    "matrix": [
      6,
      6
    ],
    "x": 12,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 46
  },
  {
    "id": "BSPC",
    "label": "Bksp",
    "matrix": [
      7,
      1
    ],
    "x": 13,
    "y": 0,
    "w": 2,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 42
  },
  {
    "id": "DEL",
    "label": "Del",
    "matrix": [
      2,
      5
    ],
    "x": 15,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 76
  },
  {
    "id": "TAB",
    "label": "Tab",
    "matrix": [
      1,
      1
    ],
    "x": 0,
    "y": 1,
    "w": 1.5,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 43
  },
  {
    "id": "Q",
    "label": "Q",
    "matrix": [
      1,
      0
    ],
    "x": 1.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 20
  },
  {
    "id": "W",
    "label": "W",
    "matrix": [
      2,
      0
    ],
    "x": 2.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 26
  },
  {
    "id": "E",
    "label": "E",
    "matrix": [
      3,
      0
    ],
    "x": 3.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 8
  },
  {
    "id": "R",
    "label": "R",
    "matrix": [
      4,
      0
    ],
    "x": 4.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 21
  },
  {
    "id": "T",
    "label": "T",
    "matrix": [
      4,
      1
    ],
    "x": 5.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 23
  },
  {
    "id": "Y",
    "label": "Y",
    "matrix": [
      5,
      1
    ],
    "x": 6.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 28
  },
  {
    "id": "U",
    "label": "U",
    "matrix": [
      5,
      0
    ],
    "x": 7.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 24
  },
  {
    "id": "I",
    "label": "I",
    "matrix": [
      6,
      0
    ],
    "x": 8.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 12
  },
  {
    "id": "O",
    "label": "O",
    "matrix": [
      7,
      0
    ],
    "x": 9.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 18
  },
  {
    "id": "P",
    "label": "P",
    "matrix": [
      8,
      0
    ],
    "x": 10.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 19
  },
  {
    "id": "LBRC",
    "label": "{ [",
    "matrix": [
      8,
      1
    ],
    "x": 11.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 47
  },
  {
    "id": "RBRC",
    "label": "} ]",
    "matrix": [
      6,
      1
    ],
    "x": 12.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 48
  },
  {
    "id": "BSLS",
    "label": "| \\",
    "matrix": [
      7,
      6
    ],
    "x": 13.5,
    "y": 1,
    "w": 1.5,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 49
  },
  {
    "id": "PGUP",
    "label": "PgUp",
    "matrix": [
      2,
      6
    ],
    "x": 15,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 75
  },
  {
    "id": "CAPS",
    "label": "Caps",
    "matrix": [
      2,
      1
    ],
    "x": 0,
    "y": 2,
    "w": 1.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 57
  },
  {
    "id": "A",
    "label": "A",
    "matrix": [
      1,
      2
    ],
    "x": 1.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 4
  },
  {
    "id": "S",
    "label": "S",
    "matrix": [
      2,
      2
    ],
    "x": 2.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 22
  },
  {
    "id": "D",
    "label": "D",
    "matrix": [
      3,
      2
    ],
    "x": 3.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 7
  },
  {
    "id": "F",
    "label": "F",
    "matrix": [
      4,
      2
    ],
    "x": 4.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 9
  },
  {
    "id": "G",
    "label": "G",
    "matrix": [
      4,
      3
    ],
    "x": 5.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 10
  },
  {
    "id": "H",
    "label": "H",
    "matrix": [
      5,
      3
    ],
    "x": 6.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 11
  },
  {
    "id": "J",
    "label": "J",
    "matrix": [
      5,
      2
    ],
    "x": 7.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 13
  },
  {
    "id": "K",
    "label": "K",
    "matrix": [
      6,
      2
    ],
    "x": 8.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 14
  },
  {
    "id": "L",
    "label": "L",
    "matrix": [
      7,
      2
    ],
    "x": 9.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 15
  },
  {
    "id": "SCLN",
    "label": ": ;",
    "matrix": [
      8,
      2
    ],
    "x": 10.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 51
  },
  {
    "id": "QUOT",
    "label": "\" '",
    "matrix": [
      8,
      3
    ],
    "x": 11.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 52
  },
  {
    "id": "ENT",
    "label": "Enter",
    "matrix": [
      8,
      4
    ],
    "x": 12.75,
    "y": 2,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 40
  },
  {
    "id": "PGDN",
    "label": "PgDn",
    "matrix": [
      6,
      5
    ],
    "x": 15,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 78
  },
  {
    "id": "LSFT",
    "label": "Shift",
    "matrix": [
      0,
      0
    ],
    "x": 0,
    "y": 3,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 225
  },
  {
    "id": "Z",
    "label": "Z",
    "matrix": [
      1,
      4
    ],
    "x": 2.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 29
  },
  {
    "id": "X",
    "label": "X",
    "matrix": [
      2,
      4
    ],
    "x": 3.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 27
  },
  {
    "id": "C",
    "label": "C",
    "matrix": [
      3,
      4
    ],
    "x": 4.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 6
  },
  {
    "id": "V",
    "label": "V",
    "matrix": [
      4,
      4
    ],
    "x": 5.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 25
  },
  {
    "id": "B",
    "label": "B",
    "matrix": [
      4,
      5
    ],
    "x": 6.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 5
  },
  {
    "id": "N",
    "label": "N",
    "matrix": [
      5,
      5
    ],
    "x": 7.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 17
  },
  {
    "id": "M",
    "label": "M",
    "matrix": [
      5,
      4
    ],
    "x": 8.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 16
  },
  {
    "id": "COMM",
    "label": "< ,",
    "matrix": [
      6,
      4
    ],
    "x": 9.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 54
  },
  {
    "id": "DOT",
    "label": "> .",
    "matrix": [
      7,
      4
    ],
    "x": 10.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 55
  },
  {
    "id": "SLSH",
    "label": "? /",
    "matrix": [
      8,
      5
    ],
    "x": 11.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 56
  },
  {
    "id": "RSFT",
    "label": "Shift",
    "matrix": [
      0,
      7
    ],
    "x": 12.25,
    "y": 3,
    "w": 1.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 229
  },
  {
    "id": "UP",
    "label": "▲",
    "matrix": [
      3,
      5
    ],
    "x": 14,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 82
  },
  {
    "id": "END",
    "label": "End",
    "matrix": [
      0,
      1
    ],
    "x": 15,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 77
  },
  {
    "id": "LCTL",
    "label": "Ctrl",
    "matrix": [
      0,
      6
    ],
    "x": 0,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 224
  },
  {
    "id": "LWIN",
    "label": "Win",
    "matrix": [
      1,
      5
    ],
    "x": 1.25,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 227
  },
  {
    "id": "LALT",
    "label": "Alt",
    "matrix": [
      2,
      3
    ],
    "x": 2.5,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 226
  },
  {
    "id": "SPC",
    "label": "Space",
    "matrix": [
      3,
      1
    ],
    "x": 3.75,
    "y": 4,
    "w": 6.25,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 44,
    "qmkPoint": [
      97,
      64
    ]
  },
  {
    "id": "RALT",
    "label": "Alt",
    "matrix": [
      3,
      6
    ],
    "x": 10,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 230
  },
  {
    "id": "FN",
    "label": "Fn",
    "matrix": [
      3,
      3
    ],
    "x": 11.25,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 20993
  },
  {
    "id": "LEFT",
    "label": "◀",
    "matrix": [
      0,
      3
    ],
    "x": 13,
    "y": 4,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 80
  },
  {
    "id": "DOWN",
    "label": "▼",
    "matrix": [
      7,
      3
    ],
    "x": 14,
    "y": 4,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 81
  },
  {
    "id": "RGHT",
    "label": "▶",
    "matrix": [
      0,
      5
    ],
    "x": 15,
    "y": 4,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 79
  }
] as KeyLayoutItem[];
export const LAYOUT_96_ANSI = [
  {
    "id": "ESC",
    "label": "Esc",
    "matrix": [
      0,
      0
    ],
    "x": 0,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 41
  },
  {
    "id": "F1",
    "label": "F1",
    "matrix": [
      1,
      0
    ],
    "x": 1.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 58
  },
  {
    "id": "F2",
    "label": "F2",
    "matrix": [
      2,
      0
    ],
    "x": 2.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 59
  },
  {
    "id": "F3",
    "label": "F3",
    "matrix": [
      3,
      0
    ],
    "x": 3.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 60
  },
  {
    "id": "F4",
    "label": "F4",
    "matrix": [
      4,
      0
    ],
    "x": 4.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 61
  },
  {
    "id": "F5",
    "label": "F5",
    "matrix": [
      5,
      0
    ],
    "x": 5.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 62
  },
  {
    "id": "F6",
    "label": "F6",
    "matrix": [
      6,
      0
    ],
    "x": 6.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 63
  },
  {
    "id": "F7",
    "label": "F7",
    "matrix": [
      7,
      0
    ],
    "x": 7.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 64
  },
  {
    "id": "F8",
    "label": "F8",
    "matrix": [
      8,
      0
    ],
    "x": 8.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 65
  },
  {
    "id": "F9",
    "label": "F9",
    "matrix": [
      9,
      0
    ],
    "x": 9.75,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 66
  },
  {
    "id": "F10",
    "label": "F10",
    "matrix": [
      10,
      0
    ],
    "x": 10.75,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 67
  },
  {
    "id": "F11",
    "label": "F11",
    "matrix": [
      11,
      0
    ],
    "x": 11.75,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 68
  },
  {
    "id": "F12",
    "label": "F12",
    "matrix": [
      12,
      0
    ],
    "x": 12.75,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 69
  },
  {
    "id": "DEL",
    "label": "Del",
    "matrix": [
      13,
      0
    ],
    "x": 14,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 76
  },
  {
    "id": "NUM",
    "label": "Num",
    "matrix": [
      0,
      6
    ],
    "x": 15.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 83
  },
  {
    "id": "PSLS",
    "label": "/",
    "matrix": [
      1,
      6
    ],
    "x": 16.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 84
  },
  {
    "id": "PAST",
    "label": "*",
    "matrix": [
      2,
      6
    ],
    "x": 17.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 85
  },
  {
    "id": "PMNS",
    "label": "-",
    "matrix": [
      3,
      6
    ],
    "x": 18.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 86
  },
  {
    "id": "GRV",
    "label": "~ `",
    "matrix": [
      0,
      1
    ],
    "x": 0,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 53
  },
  {
    "id": "1",
    "label": "! 1",
    "matrix": [
      1,
      1
    ],
    "x": 1,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 30
  },
  {
    "id": "2",
    "label": "@ 2",
    "matrix": [
      2,
      1
    ],
    "x": 2,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 31
  },
  {
    "id": "3",
    "label": "# 3",
    "matrix": [
      3,
      1
    ],
    "x": 3,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 32
  },
  {
    "id": "4",
    "label": "$ 4",
    "matrix": [
      4,
      1
    ],
    "x": 4,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 33
  },
  {
    "id": "5",
    "label": "% 5",
    "matrix": [
      5,
      1
    ],
    "x": 5,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 34
  },
  {
    "id": "6",
    "label": "^ 6",
    "matrix": [
      6,
      1
    ],
    "x": 6,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 35
  },
  {
    "id": "7",
    "label": "& 7",
    "matrix": [
      7,
      1
    ],
    "x": 7,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 36
  },
  {
    "id": "8",
    "label": "* 8",
    "matrix": [
      8,
      1
    ],
    "x": 8,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 37
  },
  {
    "id": "9",
    "label": "( 9",
    "matrix": [
      9,
      1
    ],
    "x": 9,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 38
  },
  {
    "id": "0",
    "label": ") 0",
    "matrix": [
      10,
      1
    ],
    "x": 10,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 39
  },
  {
    "id": "MINS",
    "label": "_ -",
    "matrix": [
      11,
      1
    ],
    "x": 11,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 45
  },
  {
    "id": "EQL",
    "label": "+ =",
    "matrix": [
      12,
      1
    ],
    "x": 12,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 46
  },
  {
    "id": "BSPC",
    "label": "Bksp",
    "matrix": [
      13,
      1
    ],
    "x": 13,
    "y": 1.25,
    "w": 2,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 42
  },
  {
    "id": "P7",
    "label": "7",
    "matrix": [
      5,
      6
    ],
    "x": 15.25,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 95
  },
  {
    "id": "P8",
    "label": "8",
    "matrix": [
      6,
      6
    ],
    "x": 16.25,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 96
  },
  {
    "id": "P9",
    "label": "9",
    "matrix": [
      7,
      6
    ],
    "x": 17.25,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 97
  },
  {
    "id": "PPLS",
    "label": "+",
    "matrix": [
      4,
      6
    ],
    "x": 18.25,
    "y": 1.25,
    "w": 1,
    "h": 2,
    "group": "numpad",
    "defaultKeycode": 87
  },
  {
    "id": "TAB",
    "label": "Tab",
    "matrix": [
      0,
      2
    ],
    "x": 0,
    "y": 2.25,
    "w": 1.5,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 43
  },
  {
    "id": "Q",
    "label": "Q",
    "matrix": [
      1,
      2
    ],
    "x": 1.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 20
  },
  {
    "id": "W",
    "label": "W",
    "matrix": [
      2,
      2
    ],
    "x": 2.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 26
  },
  {
    "id": "E",
    "label": "E",
    "matrix": [
      3,
      2
    ],
    "x": 3.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 8
  },
  {
    "id": "R",
    "label": "R",
    "matrix": [
      4,
      2
    ],
    "x": 4.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 21
  },
  {
    "id": "T",
    "label": "T",
    "matrix": [
      5,
      2
    ],
    "x": 5.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 23
  },
  {
    "id": "Y",
    "label": "Y",
    "matrix": [
      6,
      2
    ],
    "x": 6.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 28
  },
  {
    "id": "U",
    "label": "U",
    "matrix": [
      7,
      2
    ],
    "x": 7.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 24
  },
  {
    "id": "I",
    "label": "I",
    "matrix": [
      8,
      2
    ],
    "x": 8.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 12
  },
  {
    "id": "O",
    "label": "O",
    "matrix": [
      9,
      2
    ],
    "x": 9.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 18
  },
  {
    "id": "P",
    "label": "P",
    "matrix": [
      10,
      2
    ],
    "x": 10.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 19
  },
  {
    "id": "LBRC",
    "label": "{ [",
    "matrix": [
      11,
      2
    ],
    "x": 11.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 47
  },
  {
    "id": "RBRC",
    "label": "} ]",
    "matrix": [
      12,
      2
    ],
    "x": 12.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 48
  },
  {
    "id": "BSLS",
    "label": "| \\",
    "matrix": [
      13,
      2
    ],
    "x": 13.5,
    "y": 2.25,
    "w": 1.5,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 49
  },
  {
    "id": "P4",
    "label": "4",
    "matrix": [
      8,
      6
    ],
    "x": 15.25,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 92
  },
  {
    "id": "P5",
    "label": "5",
    "matrix": [
      9,
      6
    ],
    "x": 16.25,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 93
  },
  {
    "id": "P6",
    "label": "6",
    "matrix": [
      10,
      6
    ],
    "x": 17.25,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 94
  },
  {
    "id": "CAPS",
    "label": "Caps",
    "matrix": [
      0,
      3
    ],
    "x": 0,
    "y": 3.25,
    "w": 1.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 57
  },
  {
    "id": "A",
    "label": "A",
    "matrix": [
      1,
      3
    ],
    "x": 1.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 4
  },
  {
    "id": "S",
    "label": "S",
    "matrix": [
      2,
      3
    ],
    "x": 2.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 22
  },
  {
    "id": "D",
    "label": "D",
    "matrix": [
      3,
      3
    ],
    "x": 3.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 7
  },
  {
    "id": "F",
    "label": "F",
    "matrix": [
      4,
      3
    ],
    "x": 4.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 9
  },
  {
    "id": "G",
    "label": "G",
    "matrix": [
      5,
      3
    ],
    "x": 5.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 10
  },
  {
    "id": "H",
    "label": "H",
    "matrix": [
      6,
      3
    ],
    "x": 6.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 11
  },
  {
    "id": "J",
    "label": "J",
    "matrix": [
      7,
      3
    ],
    "x": 7.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 13
  },
  {
    "id": "K",
    "label": "K",
    "matrix": [
      8,
      3
    ],
    "x": 8.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 14
  },
  {
    "id": "L",
    "label": "L",
    "matrix": [
      9,
      3
    ],
    "x": 9.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 15
  },
  {
    "id": "SCLN",
    "label": ": ;",
    "matrix": [
      10,
      3
    ],
    "x": 10.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 51
  },
  {
    "id": "QUOT",
    "label": "\" '",
    "matrix": [
      11,
      3
    ],
    "x": 11.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 52
  },
  {
    "id": "ENT",
    "label": "Enter",
    "matrix": [
      12,
      3
    ],
    "x": 12.75,
    "y": 3.25,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 40
  },
  {
    "id": "P1",
    "label": "1",
    "matrix": [
      11,
      6
    ],
    "x": 15.25,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 89
  },
  {
    "id": "P2",
    "label": "2",
    "matrix": [
      12,
      6
    ],
    "x": 16.25,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 90
  },
  {
    "id": "P3",
    "label": "3",
    "matrix": [
      13,
      6
    ],
    "x": 17.25,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 91
  },
  {
    "id": "PENT",
    "label": "Enter",
    "matrix": [
      0,
      7
    ],
    "x": 18.25,
    "y": 3.25,
    "w": 1,
    "h": 2,
    "group": "numpad",
    "defaultKeycode": 88
  },
  {
    "id": "LSFT",
    "label": "Shift",
    "matrix": [
      0,
      4
    ],
    "x": 0,
    "y": 4.25,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 225
  },
  {
    "id": "Z",
    "label": "Z",
    "matrix": [
      1,
      4
    ],
    "x": 2.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 29
  },
  {
    "id": "X",
    "label": "X",
    "matrix": [
      2,
      4
    ],
    "x": 3.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 27
  },
  {
    "id": "C",
    "label": "C",
    "matrix": [
      3,
      4
    ],
    "x": 4.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 6
  },
  {
    "id": "V",
    "label": "V",
    "matrix": [
      4,
      4
    ],
    "x": 5.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 25
  },
  {
    "id": "B",
    "label": "B",
    "matrix": [
      5,
      4
    ],
    "x": 6.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 5
  },
  {
    "id": "N",
    "label": "N",
    "matrix": [
      6,
      4
    ],
    "x": 7.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 17
  },
  {
    "id": "M",
    "label": "M",
    "matrix": [
      7,
      4
    ],
    "x": 8.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 16
  },
  {
    "id": "COMM",
    "label": "< ,",
    "matrix": [
      8,
      4
    ],
    "x": 9.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 54
  },
  {
    "id": "DOT",
    "label": "> .",
    "matrix": [
      9,
      4
    ],
    "x": 10.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 55
  },
  {
    "id": "SLSH",
    "label": "? /",
    "matrix": [
      10,
      4
    ],
    "x": 11.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 56
  },
  {
    "id": "RSFT",
    "label": "Shift",
    "matrix": [
      11,
      4
    ],
    "x": 12.25,
    "y": 4.25,
    "w": 1.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 229
  },
  {
    "id": "UP",
    "label": "▲",
    "matrix": [
      12,
      4
    ],
    "x": 14.125,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 82
  },
  {
    "id": "P0",
    "label": "0",
    "matrix": [
      1,
      7
    ],
    "x": 15.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 98
  },
  {
    "id": "PDOT",
    "label": ".",
    "matrix": [
      2,
      7
    ],
    "x": 16.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "numpad",
    "defaultKeycode": 99
  },
  {
    "id": "LCTL",
    "label": "Ctrl",
    "matrix": [
      0,
      5
    ],
    "x": 0,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 224
  },
  {
    "id": "LWIN",
    "label": "Win",
    "matrix": [
      1,
      5
    ],
    "x": 1.25,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 227
  },
  {
    "id": "LALT",
    "label": "Alt",
    "matrix": [
      2,
      5
    ],
    "x": 2.5,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 226
  },
  {
    "id": "SPC",
    "label": "Space",
    "matrix": [
      6,
      5
    ],
    "x": 3.75,
    "y": 5.25,
    "w": 6.25,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 44,
    "qmkPoint": [
      80,
      64
    ]
  },
  {
    "id": "RALT",
    "label": "Alt",
    "matrix": [
      9,
      5
    ],
    "x": 10,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 230
  },
  {
    "id": "FN",
    "label": "Fn",
    "matrix": [
      10,
      5
    ],
    "x": 11.25,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 20993
  },
  {
    "id": "LEFT",
    "label": "◀",
    "matrix": [
      11,
      5
    ],
    "x": 13.125,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 80
  },
  {
    "id": "DOWN",
    "label": "▼",
    "matrix": [
      12,
      5
    ],
    "x": 14.125,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 81
  },
  {
    "id": "RGHT",
    "label": "▶",
    "matrix": [
      13,
      5
    ],
    "x": 15.125,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 79
  }
] as KeyLayoutItem[];
export const LAYOUT_TKL_ANSI = [
  {
    "id": "ESC",
    "label": "Esc",
    "matrix": [
      0,
      0
    ],
    "x": 0,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 41
  },
  {
    "id": "F1",
    "label": "F1",
    "matrix": [
      0,
      1
    ],
    "x": 2,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 58
  },
  {
    "id": "F2",
    "label": "F2",
    "matrix": [
      0,
      2
    ],
    "x": 3,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 59
  },
  {
    "id": "F3",
    "label": "F3",
    "matrix": [
      0,
      3
    ],
    "x": 4,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 60
  },
  {
    "id": "F4",
    "label": "F4",
    "matrix": [
      0,
      4
    ],
    "x": 5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 61
  },
  {
    "id": "F5",
    "label": "F5",
    "matrix": [
      0,
      5
    ],
    "x": 6.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 62
  },
  {
    "id": "F6",
    "label": "F6",
    "matrix": [
      0,
      6
    ],
    "x": 7.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 63
  },
  {
    "id": "F7",
    "label": "F7",
    "matrix": [
      0,
      7
    ],
    "x": 8.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 64
  },
  {
    "id": "F8",
    "label": "F8",
    "matrix": [
      0,
      8
    ],
    "x": 9.5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 65
  },
  {
    "id": "F9",
    "label": "F9",
    "matrix": [
      0,
      9
    ],
    "x": 11,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 66
  },
  {
    "id": "F10",
    "label": "F10",
    "matrix": [
      0,
      10
    ],
    "x": 12,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 67
  },
  {
    "id": "F11",
    "label": "F11",
    "matrix": [
      0,
      11
    ],
    "x": 13,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 68
  },
  {
    "id": "F12",
    "label": "F12",
    "matrix": [
      0,
      12
    ],
    "x": 14,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 69
  },
  {
    "id": "PSCR",
    "label": "PrtSc",
    "matrix": [
      0,
      13
    ],
    "x": 15.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 70
  },
  {
    "id": "SCRL",
    "label": "ScrLk",
    "matrix": [
      0,
      14
    ],
    "x": 16.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 71
  },
  {
    "id": "PAUS",
    "label": "Pause",
    "matrix": [
      0,
      15
    ],
    "x": 17.25,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 72
  },
  {
    "id": "GRV",
    "label": "~ `",
    "matrix": [
      1,
      0
    ],
    "x": 0,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 53
  },
  {
    "id": "1",
    "label": "! 1",
    "matrix": [
      1,
      1
    ],
    "x": 1,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 30
  },
  {
    "id": "2",
    "label": "@ 2",
    "matrix": [
      1,
      2
    ],
    "x": 2,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 31
  },
  {
    "id": "3",
    "label": "# 3",
    "matrix": [
      1,
      3
    ],
    "x": 3,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 32
  },
  {
    "id": "4",
    "label": "$ 4",
    "matrix": [
      1,
      4
    ],
    "x": 4,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 33
  },
  {
    "id": "5",
    "label": "% 5",
    "matrix": [
      1,
      5
    ],
    "x": 5,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 34
  },
  {
    "id": "6",
    "label": "^ 6",
    "matrix": [
      1,
      6
    ],
    "x": 6,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 35
  },
  {
    "id": "7",
    "label": "& 7",
    "matrix": [
      1,
      7
    ],
    "x": 7,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 36
  },
  {
    "id": "8",
    "label": "* 8",
    "matrix": [
      1,
      8
    ],
    "x": 8,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 37
  },
  {
    "id": "9",
    "label": "( 9",
    "matrix": [
      1,
      9
    ],
    "x": 9,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 38
  },
  {
    "id": "0",
    "label": ") 0",
    "matrix": [
      1,
      10
    ],
    "x": 10,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 39
  },
  {
    "id": "MINS",
    "label": "_ -",
    "matrix": [
      1,
      11
    ],
    "x": 11,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 45
  },
  {
    "id": "EQL",
    "label": "+ =",
    "matrix": [
      1,
      12
    ],
    "x": 12,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 46
  },
  {
    "id": "BSPC",
    "label": "Bksp",
    "matrix": [
      1,
      13
    ],
    "x": 13,
    "y": 1.25,
    "w": 2,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 42
  },
  {
    "id": "INS",
    "label": "Ins",
    "matrix": [
      1,
      14
    ],
    "x": 15.25,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 73
  },
  {
    "id": "HOME",
    "label": "Home",
    "matrix": [
      1,
      15
    ],
    "x": 16.25,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 74
  },
  {
    "id": "PGUP",
    "label": "PgUp",
    "matrix": [
      1,
      16
    ],
    "x": 17.25,
    "y": 1.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 75
  },
  {
    "id": "TAB",
    "label": "Tab",
    "matrix": [
      2,
      0
    ],
    "x": 0,
    "y": 2.25,
    "w": 1.5,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 43
  },
  {
    "id": "Q",
    "label": "Q",
    "matrix": [
      2,
      1
    ],
    "x": 1.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 20
  },
  {
    "id": "W",
    "label": "W",
    "matrix": [
      2,
      2
    ],
    "x": 2.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 26
  },
  {
    "id": "E",
    "label": "E",
    "matrix": [
      2,
      3
    ],
    "x": 3.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 8
  },
  {
    "id": "R",
    "label": "R",
    "matrix": [
      2,
      4
    ],
    "x": 4.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 21
  },
  {
    "id": "T",
    "label": "T",
    "matrix": [
      2,
      5
    ],
    "x": 5.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 23
  },
  {
    "id": "Y",
    "label": "Y",
    "matrix": [
      2,
      6
    ],
    "x": 6.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 28
  },
  {
    "id": "U",
    "label": "U",
    "matrix": [
      2,
      7
    ],
    "x": 7.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 24
  },
  {
    "id": "I",
    "label": "I",
    "matrix": [
      2,
      8
    ],
    "x": 8.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 12
  },
  {
    "id": "O",
    "label": "O",
    "matrix": [
      2,
      9
    ],
    "x": 9.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 18
  },
  {
    "id": "P",
    "label": "P",
    "matrix": [
      2,
      10
    ],
    "x": 10.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 19
  },
  {
    "id": "LBRC",
    "label": "{ [",
    "matrix": [
      2,
      11
    ],
    "x": 11.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 47
  },
  {
    "id": "RBRC",
    "label": "} ]",
    "matrix": [
      2,
      12
    ],
    "x": 12.5,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 48
  },
  {
    "id": "BSLS",
    "label": "| \\",
    "matrix": [
      2,
      13
    ],
    "x": 13.5,
    "y": 2.25,
    "w": 1.5,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 49
  },
  {
    "id": "DEL",
    "label": "Del",
    "matrix": [
      2,
      14
    ],
    "x": 15.25,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 76
  },
  {
    "id": "END",
    "label": "End",
    "matrix": [
      2,
      15
    ],
    "x": 16.25,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 77
  },
  {
    "id": "PGDN",
    "label": "PgDn",
    "matrix": [
      2,
      16
    ],
    "x": 17.25,
    "y": 2.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 78
  },
  {
    "id": "CAPS",
    "label": "Caps",
    "matrix": [
      3,
      0
    ],
    "x": 0,
    "y": 3.25,
    "w": 1.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 57
  },
  {
    "id": "A",
    "label": "A",
    "matrix": [
      3,
      1
    ],
    "x": 1.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 4
  },
  {
    "id": "S",
    "label": "S",
    "matrix": [
      3,
      2
    ],
    "x": 2.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 22
  },
  {
    "id": "D",
    "label": "D",
    "matrix": [
      3,
      3
    ],
    "x": 3.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 7
  },
  {
    "id": "F",
    "label": "F",
    "matrix": [
      3,
      4
    ],
    "x": 4.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 9
  },
  {
    "id": "G",
    "label": "G",
    "matrix": [
      3,
      5
    ],
    "x": 5.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 10
  },
  {
    "id": "H",
    "label": "H",
    "matrix": [
      3,
      6
    ],
    "x": 6.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 11
  },
  {
    "id": "J",
    "label": "J",
    "matrix": [
      3,
      7
    ],
    "x": 7.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 13
  },
  {
    "id": "K",
    "label": "K",
    "matrix": [
      3,
      8
    ],
    "x": 8.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 14
  },
  {
    "id": "L",
    "label": "L",
    "matrix": [
      3,
      9
    ],
    "x": 9.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 15
  },
  {
    "id": "SCLN",
    "label": ": ;",
    "matrix": [
      3,
      10
    ],
    "x": 10.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 51
  },
  {
    "id": "QUOT",
    "label": "\" '",
    "matrix": [
      3,
      11
    ],
    "x": 11.75,
    "y": 3.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 52
  },
  {
    "id": "ENT",
    "label": "Enter",
    "matrix": [
      3,
      12
    ],
    "x": 12.75,
    "y": 3.25,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 40
  },
  {
    "id": "LSFT",
    "label": "Shift",
    "matrix": [
      4,
      0
    ],
    "x": 0,
    "y": 4.25,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 225
  },
  {
    "id": "Z",
    "label": "Z",
    "matrix": [
      4,
      1
    ],
    "x": 2.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 29
  },
  {
    "id": "X",
    "label": "X",
    "matrix": [
      4,
      2
    ],
    "x": 3.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 27
  },
  {
    "id": "C",
    "label": "C",
    "matrix": [
      4,
      3
    ],
    "x": 4.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 6
  },
  {
    "id": "V",
    "label": "V",
    "matrix": [
      4,
      4
    ],
    "x": 5.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 25
  },
  {
    "id": "B",
    "label": "B",
    "matrix": [
      4,
      5
    ],
    "x": 6.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 5
  },
  {
    "id": "N",
    "label": "N",
    "matrix": [
      4,
      6
    ],
    "x": 7.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 17
  },
  {
    "id": "M",
    "label": "M",
    "matrix": [
      4,
      7
    ],
    "x": 8.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 16
  },
  {
    "id": "COMM",
    "label": "< ,",
    "matrix": [
      4,
      8
    ],
    "x": 9.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 54
  },
  {
    "id": "DOT",
    "label": "> .",
    "matrix": [
      4,
      9
    ],
    "x": 10.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 55
  },
  {
    "id": "SLSH",
    "label": "? /",
    "matrix": [
      4,
      10
    ],
    "x": 11.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 56
  },
  {
    "id": "RSFT",
    "label": "Shift",
    "matrix": [
      4,
      11
    ],
    "x": 12.25,
    "y": 4.25,
    "w": 2.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 229
  },
  {
    "id": "UP",
    "label": "▲",
    "matrix": [
      4,
      15
    ],
    "x": 16.25,
    "y": 4.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 82
  },
  {
    "id": "LCTL",
    "label": "Ctrl",
    "matrix": [
      5,
      0
    ],
    "x": 0,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 224
  },
  {
    "id": "LWIN",
    "label": "Win",
    "matrix": [
      5,
      1
    ],
    "x": 1.25,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 227
  },
  {
    "id": "LALT",
    "label": "Alt",
    "matrix": [
      5,
      2
    ],
    "x": 2.5,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 226
  },
  {
    "id": "SPC",
    "label": "Space",
    "matrix": [
      5,
      3
    ],
    "x": 3.75,
    "y": 5.25,
    "w": 6.25,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 44,
    "qmkPoint": [
      66,
      64
    ]
  },
  {
    "id": "RALT",
    "label": "Alt",
    "matrix": [
      5,
      4
    ],
    "x": 10,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 230
  },
  {
    "id": "FN",
    "label": "Fn",
    "matrix": [
      5,
      5
    ],
    "x": 11.25,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 20993
  },
  {
    "id": "APP",
    "label": "Menu",
    "matrix": [
      5,
      6
    ],
    "x": 12.5,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 101
  },
  {
    "id": "RCTL",
    "label": "Ctrl",
    "matrix": [
      5,
      7
    ],
    "x": 13.75,
    "y": 5.25,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 228
  },
  {
    "id": "LEFT",
    "label": "◀",
    "matrix": [
      5,
      14
    ],
    "x": 15.25,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 80
  },
  {
    "id": "DOWN",
    "label": "▼",
    "matrix": [
      5,
      15
    ],
    "x": 16.25,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 81
  },
  {
    "id": "RGHT",
    "label": "▶",
    "matrix": [
      5,
      16
    ],
    "x": 17.25,
    "y": 5.25,
    "w": 1,
    "h": 1,
    "group": "nav",
    "defaultKeycode": 79
  }
] as KeyLayoutItem[];
export const LAYOUT_60_ANSI = [
  {
    "id": "ESC",
    "label": "Esc",
    "matrix": [
      0,
      0
    ],
    "x": 0,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "func",
    "defaultKeycode": 41
  },
  {
    "id": "1",
    "label": "! 1",
    "matrix": [
      0,
      1
    ],
    "x": 1,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 30
  },
  {
    "id": "2",
    "label": "@ 2",
    "matrix": [
      0,
      2
    ],
    "x": 2,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 31
  },
  {
    "id": "3",
    "label": "# 3",
    "matrix": [
      0,
      3
    ],
    "x": 3,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 32
  },
  {
    "id": "4",
    "label": "$ 4",
    "matrix": [
      0,
      4
    ],
    "x": 4,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 33
  },
  {
    "id": "5",
    "label": "% 5",
    "matrix": [
      0,
      5
    ],
    "x": 5,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 34
  },
  {
    "id": "6",
    "label": "^ 6",
    "matrix": [
      0,
      6
    ],
    "x": 6,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 35
  },
  {
    "id": "7",
    "label": "& 7",
    "matrix": [
      0,
      7
    ],
    "x": 7,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 36
  },
  {
    "id": "8",
    "label": "* 8",
    "matrix": [
      0,
      8
    ],
    "x": 8,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 37
  },
  {
    "id": "9",
    "label": "( 9",
    "matrix": [
      0,
      9
    ],
    "x": 9,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 38
  },
  {
    "id": "0",
    "label": ") 0",
    "matrix": [
      0,
      10
    ],
    "x": 10,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 39
  },
  {
    "id": "MINS",
    "label": "_ -",
    "matrix": [
      0,
      11
    ],
    "x": 11,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 45
  },
  {
    "id": "EQL",
    "label": "+ =",
    "matrix": [
      0,
      12
    ],
    "x": 12,
    "y": 0,
    "w": 1,
    "h": 1,
    "group": "num",
    "defaultKeycode": 46
  },
  {
    "id": "BSPC",
    "label": "Bksp",
    "matrix": [
      0,
      13
    ],
    "x": 13,
    "y": 0,
    "w": 2,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 42
  },
  {
    "id": "TAB",
    "label": "Tab",
    "matrix": [
      1,
      0
    ],
    "x": 0,
    "y": 1,
    "w": 1.5,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 43
  },
  {
    "id": "Q",
    "label": "Q",
    "matrix": [
      1,
      1
    ],
    "x": 1.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 20
  },
  {
    "id": "W",
    "label": "W",
    "matrix": [
      1,
      2
    ],
    "x": 2.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 26
  },
  {
    "id": "E",
    "label": "E",
    "matrix": [
      1,
      3
    ],
    "x": 3.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 8
  },
  {
    "id": "R",
    "label": "R",
    "matrix": [
      1,
      4
    ],
    "x": 4.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 21
  },
  {
    "id": "T",
    "label": "T",
    "matrix": [
      1,
      5
    ],
    "x": 5.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 23
  },
  {
    "id": "Y",
    "label": "Y",
    "matrix": [
      1,
      6
    ],
    "x": 6.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 28
  },
  {
    "id": "U",
    "label": "U",
    "matrix": [
      1,
      7
    ],
    "x": 7.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 24
  },
  {
    "id": "I",
    "label": "I",
    "matrix": [
      1,
      8
    ],
    "x": 8.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 12
  },
  {
    "id": "O",
    "label": "O",
    "matrix": [
      1,
      9
    ],
    "x": 9.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 18
  },
  {
    "id": "P",
    "label": "P",
    "matrix": [
      1,
      10
    ],
    "x": 10.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 19
  },
  {
    "id": "LBRC",
    "label": "{ [",
    "matrix": [
      1,
      11
    ],
    "x": 11.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 47
  },
  {
    "id": "RBRC",
    "label": "} ]",
    "matrix": [
      1,
      12
    ],
    "x": 12.5,
    "y": 1,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 48
  },
  {
    "id": "BSLS",
    "label": "| \\",
    "matrix": [
      1,
      13
    ],
    "x": 13.5,
    "y": 1,
    "w": 1.5,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 49
  },
  {
    "id": "CAPS",
    "label": "Caps",
    "matrix": [
      2,
      0
    ],
    "x": 0,
    "y": 2,
    "w": 1.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 57
  },
  {
    "id": "A",
    "label": "A",
    "matrix": [
      2,
      1
    ],
    "x": 1.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 4
  },
  {
    "id": "S",
    "label": "S",
    "matrix": [
      2,
      2
    ],
    "x": 2.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 22
  },
  {
    "id": "D",
    "label": "D",
    "matrix": [
      2,
      3
    ],
    "x": 3.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 7
  },
  {
    "id": "F",
    "label": "F",
    "matrix": [
      2,
      4
    ],
    "x": 4.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 9
  },
  {
    "id": "G",
    "label": "G",
    "matrix": [
      2,
      5
    ],
    "x": 5.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 10
  },
  {
    "id": "H",
    "label": "H",
    "matrix": [
      2,
      6
    ],
    "x": 6.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 11
  },
  {
    "id": "J",
    "label": "J",
    "matrix": [
      2,
      7
    ],
    "x": 7.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 13
  },
  {
    "id": "K",
    "label": "K",
    "matrix": [
      2,
      8
    ],
    "x": 8.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 14
  },
  {
    "id": "L",
    "label": "L",
    "matrix": [
      2,
      9
    ],
    "x": 9.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 15
  },
  {
    "id": "SCLN",
    "label": ": ;",
    "matrix": [
      2,
      10
    ],
    "x": 10.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 51
  },
  {
    "id": "QUOT",
    "label": "\" '",
    "matrix": [
      2,
      11
    ],
    "x": 11.75,
    "y": 2,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 52
  },
  {
    "id": "ENT",
    "label": "Enter",
    "matrix": [
      2,
      12
    ],
    "x": 12.75,
    "y": 2,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 40
  },
  {
    "id": "LSFT",
    "label": "Shift",
    "matrix": [
      3,
      0
    ],
    "x": 0,
    "y": 3,
    "w": 2.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 225
  },
  {
    "id": "Z",
    "label": "Z",
    "matrix": [
      3,
      1
    ],
    "x": 2.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 29
  },
  {
    "id": "X",
    "label": "X",
    "matrix": [
      3,
      2
    ],
    "x": 3.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 27
  },
  {
    "id": "C",
    "label": "C",
    "matrix": [
      3,
      3
    ],
    "x": 4.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 6
  },
  {
    "id": "V",
    "label": "V",
    "matrix": [
      3,
      4
    ],
    "x": 5.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 25
  },
  {
    "id": "B",
    "label": "B",
    "matrix": [
      3,
      5
    ],
    "x": 6.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 5
  },
  {
    "id": "N",
    "label": "N",
    "matrix": [
      3,
      6
    ],
    "x": 7.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 17
  },
  {
    "id": "M",
    "label": "M",
    "matrix": [
      3,
      7
    ],
    "x": 8.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 16
  },
  {
    "id": "COMM",
    "label": "< ,",
    "matrix": [
      3,
      8
    ],
    "x": 9.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 54
  },
  {
    "id": "DOT",
    "label": "> .",
    "matrix": [
      3,
      9
    ],
    "x": 10.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 55
  },
  {
    "id": "SLSH",
    "label": "? /",
    "matrix": [
      3,
      10
    ],
    "x": 11.25,
    "y": 3,
    "w": 1,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 56
  },
  {
    "id": "RSFT",
    "label": "Shift",
    "matrix": [
      3,
      11
    ],
    "x": 12.25,
    "y": 3,
    "w": 2.75,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 229
  },
  {
    "id": "LCTL",
    "label": "Ctrl",
    "matrix": [
      4,
      0
    ],
    "x": 0,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 224
  },
  {
    "id": "LWIN",
    "label": "Win",
    "matrix": [
      4,
      1
    ],
    "x": 1.25,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 227
  },
  {
    "id": "LALT",
    "label": "Alt",
    "matrix": [
      4,
      2
    ],
    "x": 2.5,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 226
  },
  {
    "id": "SPC",
    "label": "Space",
    "matrix": [
      4,
      3
    ],
    "x": 3.75,
    "y": 4,
    "w": 6.25,
    "h": 1,
    "group": "alpha",
    "defaultKeycode": 44,
    "qmkPoint": [
      97,
      64
    ]
  },
  {
    "id": "RALT",
    "label": "Alt",
    "matrix": [
      4,
      4
    ],
    "x": 10,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 230
  },
  {
    "id": "RWIN",
    "label": "Win",
    "matrix": [
      4,
      5
    ],
    "x": 11.25,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 231
  },
  {
    "id": "FN",
    "label": "Fn",
    "matrix": [
      4,
      6
    ],
    "x": 12.5,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 20993
  },
  {
    "id": "RCTL",
    "label": "Ctrl",
    "matrix": [
      4,
      7
    ],
    "x": 13.75,
    "y": 4,
    "w": 1.25,
    "h": 1,
    "group": "mod",
    "defaultKeycode": 228
  }
] as KeyLayoutItem[];

export const GMMK3_ENCODER = {
  "id": "ENCODER_0",
  "name": "Volume Knob",
  "encoderIndex": 0,
  "pressMatrix": [
    11,
    6
  ],
  "directions": [
    {
      "id": "CCW",
      "name": "Rotate Left (CCW)",
      "default": 170
    },
    {
      "id": "CW",
      "name": "Rotate Right (CW)",
      "default": 169
    }
  ]
};
export const GMMK3_SIDE_LEDS = {
  "left": [
    {
      "id": "SLED1",
      "x": 0,
      "y": 1.02,
      "qmkPoint": [
        0,
        15
      ]
    },
    {
      "id": "SLED2",
      "x": 0,
      "y": 1.48,
      "qmkPoint": [
        0,
        20
      ]
    },
    {
      "id": "SLED3",
      "x": 0,
      "y": 1.95,
      "qmkPoint": [
        0,
        25
      ]
    },
    {
      "id": "SLED4",
      "x": 0,
      "y": 2.41,
      "qmkPoint": [
        0,
        30
      ]
    },
    {
      "id": "SLED5",
      "x": 0,
      "y": 2.87,
      "qmkPoint": [
        0,
        35
      ]
    },
    {
      "id": "SLED6",
      "x": 0,
      "y": 3.33,
      "qmkPoint": [
        0,
        40
      ]
    },
    {
      "id": "SLED7",
      "x": 0,
      "y": 3.79,
      "qmkPoint": [
        0,
        45
      ]
    },
    {
      "id": "SLED8",
      "x": 0,
      "y": 4.26,
      "qmkPoint": [
        0,
        50
      ]
    },
    {
      "id": "SLED9",
      "x": 0,
      "y": 4.72,
      "qmkPoint": [
        0,
        55
      ]
    },
    {
      "id": "SLED10",
      "x": 0,
      "y": 5.18,
      "qmkPoint": [
        0,
        60
      ]
    }
  ],
  "right": [
    {
      "id": "SLED11",
      "x": 22.5,
      "y": 5.18,
      "qmkPoint": [
        224,
        60
      ]
    },
    {
      "id": "SLED12",
      "x": 22.5,
      "y": 4.72,
      "qmkPoint": [
        224,
        55
      ]
    },
    {
      "id": "SLED13",
      "x": 22.5,
      "y": 4.26,
      "qmkPoint": [
        224,
        50
      ]
    },
    {
      "id": "SLED14",
      "x": 22.5,
      "y": 3.79,
      "qmkPoint": [
        224,
        45
      ]
    },
    {
      "id": "SLED15",
      "x": 22.5,
      "y": 3.33,
      "qmkPoint": [
        224,
        40
      ]
    },
    {
      "id": "SLED16",
      "x": 22.5,
      "y": 2.87,
      "qmkPoint": [
        224,
        35
      ]
    },
    {
      "id": "SLED17",
      "x": 22.5,
      "y": 2.41,
      "qmkPoint": [
        224,
        30
      ]
    },
    {
      "id": "SLED18",
      "x": 22.5,
      "y": 1.95,
      "qmkPoint": [
        224,
        25
      ]
    },
    {
      "id": "SLED19",
      "x": 22.5,
      "y": 1.48,
      "qmkPoint": [
        224,
        20
      ]
    },
    {
      "id": "SLED20",
      "x": 22.5,
      "y": 1.02,
      "qmkPoint": [
        224,
        15
      ]
    }
  ]
};

export const LAYOUT_REGISTRY: Record<string, KeyLayoutItem[]> = {
  'gmmk3-100-ansi': LAYOUT_100_ANSI,
  'gmmk3-75-ansi': LAYOUT_75_ANSI,
  'gmmk3-65-ansi': LAYOUT_65_ANSI,
  'gmmk2-96-ansi': LAYOUT_96_ANSI,
  'gmmk2-65-ansi': LAYOUT_GMMK2_65_ANSI,
  'generic-tkl': LAYOUT_TKL_ANSI,
  'generic-60': LAYOUT_60_ANSI,
  'generic-via': LAYOUT_100_ANSI,

  // Keychron Q Series
  'keychron-q1v2-ansi-encoder': LAYOUT_75_ANSI,
  'keychron-q1v2-iso-encoder': LAYOUT_75_ANSI,
  'keychron-q1v2-ansi': LAYOUT_75_ANSI,
  'keychron-q2-ansi-encoder': LAYOUT_65_ANSI,
  'keychron-q3-ansi-encoder': LAYOUT_TKL_ANSI,
  'keychron-q4-ansi': LAYOUT_60_ANSI,
  'keychron-q5-ansi-encoder': LAYOUT_96_ANSI,
  'keychron-q6-ansi-encoder': LAYOUT_100_ANSI,
  'keychron-q7-ansi': LAYOUT_65_ANSI,
  'keychron-q8-ansi-encoder': LAYOUT_65_ANSI,
  'keychron-q10-ansi-encoder': LAYOUT_75_ANSI,
  'keychron-q11-ansi-encoder': LAYOUT_75_ANSI,
  'keychron-q12-ansi-encoder': LAYOUT_96_ANSI,
  'keychron-q0': LAYOUT_100_ANSI,

  // Keychron V Series
  'keychron-v1-ansi-encoder': LAYOUT_75_ANSI,
  'keychron-v1-iso-encoder': LAYOUT_75_ANSI,
  'keychron-v2-ansi-encoder': LAYOUT_65_ANSI,
  'keychron-v3-ansi-encoder': LAYOUT_TKL_ANSI,
  'keychron-v4-ansi': LAYOUT_60_ANSI,
  'keychron-v5-ansi-encoder': LAYOUT_96_ANSI,
  'keychron-v6-ansi-encoder': LAYOUT_100_ANSI,
  'keychron-v8-ansi-encoder': LAYOUT_65_ANSI,
  'keychron-v10-ansi-encoder': LAYOUT_75_ANSI,

  // Keychron C Pro & S Series
  'keychron-c1pro-ansi': LAYOUT_TKL_ANSI,
  'keychron-c2pro-ansi': LAYOUT_100_ANSI,
  'keychron-c3pro-ansi': LAYOUT_TKL_ANSI,
  'keychron-s1-ansi': LAYOUT_75_ANSI,
};

export function getLayoutForPreset(presetId: string): KeyLayoutItem[] {
  if (LAYOUT_REGISTRY[presetId]) {
    return LAYOUT_REGISTRY[presetId];
  }
  const idLower = presetId.toLowerCase();
  if (idLower.includes('75')) return LAYOUT_75_ANSI;
  if (idLower.includes('65') || idLower.includes('alice')) return LAYOUT_65_ANSI;
  if (idLower.includes('60') || idLower.includes('40')) return LAYOUT_60_ANSI;
  if (idLower.includes('tkl') || idLower.includes('80')) return LAYOUT_TKL_ANSI;
  if (idLower.includes('96') || idLower.includes('1800')) return LAYOUT_96_ANSI;
  if (idLower.includes('100')) return LAYOUT_100_ANSI;
  return LAYOUT_100_ANSI;
}

export interface SideLedItem {
  id: string;
  side: 'left' | 'right';
  index: number;
  top: number;
  height: number;
}

export interface SideLedsLayout {
  left: SideLedItem[];
  right: SideLedItem[];
}

/**
 * Resolves whether a keyboard descriptor / preset ID supports hardware sidelight diffusers.
 */
export function isSidelightSupported(presetId: string, desc?: { capabilities?: { hasSidelights?: boolean } } | null): boolean {
  if (desc && desc.capabilities && typeof desc.capabilities.hasSidelights === 'boolean') {
    return desc.capabilities.hasSidelights;
  }
  return presetId.startsWith('gmmk3') || presetId.startsWith('gmmk2');
}

/**
 * Calculates dynamically scaled and evenly spaced side LED diffusers for any keyboard size.
 * Prevents side LEDs from overflowing beyond the chassis on 60%, 65%, and 75% form factors.
 */
export function getSideLedSegments(
  presetId: string,
  canvasHeight?: number,
  desc?: { capabilities?: { hasSidelights?: boolean; sidelightCount?: number } } | null
): SideLedsLayout | null {
  if (!isSidelightSupported(presetId, desc)) {
    return null;
  }

  // GMMK 3 has 20 side LEDs (10 per side); GMMK 2 65% has 16 (8 per side); GMMK 2 96% has 20 (10 per side)
  const totalSideLeds = desc?.capabilities?.sidelightCount || (presetId.includes('65') ? (presetId.includes('gmmk2') ? 16 : 20) : 20);
  const countPerSide = Math.max(1, Math.floor(totalSideLeds / 2));

  let startY = 1.02;
  let endY = 5.18;

  if (presetId.includes('65') || presetId.includes('60')) {
    // 5-row keyboard (starts at number row y=0 down to space row y=4)
    startY = 0.05;
    endY = 3.95;
  } else if (presetId.includes('75')) {
    // Compact 6-row keyboard (starts below compact F-row y=0.95 down to space row y=4.95)
    startY = 0.95;
    endY = 4.95;
  } else if (presetId.includes('96') || presetId.includes('100')) {
    // Standard 6-row keyboard with F-row gap (starts at number row y=1.02 down to space row y=5.18)
    startY = 1.02;
    endY = 5.18;
  }

  const unitSize = 46;
  const segmentHeight = 14;
  const left: SideLedItem[] = [];
  const right: SideLedItem[] = [];

  for (let i = 0; i < countPerSide; i++) {
    const fraction = countPerSide > 1 ? i / (countPerSide - 1) : 0.5;
    const y = startY + fraction * (endY - startY);
    const top = Math.round(y * unitSize + 18);
    left.push({
      id: `SLED_L_${i + 1}`,
      side: 'left',
      index: i,
      top,
      height: segmentHeight,
    });
    right.push({
      id: `SLED_R_${i + 1}`,
      side: 'right',
      index: i,
      top,
      height: segmentHeight,
    });
  }

  return { left, right };
}

/**
 * Returns an intuitive, localized display name for a keyboard layer index,
 * taking into account keyboard-specific layer conventions (e.g. GMMK vs Keychron).
 */
export function getLayerDisplayName(
  layer: number,
  descOrFamily?: { family?: string; id?: string } | string | null,
  lang: 'en' | 'pl' = 'en'
): string {
  const isPl = lang === 'pl';
  const familyOrId = typeof descOrFamily === 'string'
    ? descOrFamily.toLowerCase()
    : `${descOrFamily?.family || ''} ${descOrFamily?.id || ''}`.toLowerCase();

  // 1. Keychron family (Layer 0/1 = Mac, Layer 2/3 = Win)
  if (familyOrId.includes('keychron')) {
    switch (layer) {
      case 0: return isPl ? 'Warstwa 0 (Mac)' : 'Layer 0 (Mac)';
      case 1: return isPl ? 'Warstwa 1 (Mac Fn)' : 'Layer 1 (Mac Fn)';
      case 2: return isPl ? 'Warstwa 2 (Win)' : 'Layer 2 (Win)';
      case 3: return isPl ? 'Warstwa 3 (Win Fn)' : 'Layer 3 (Win Fn)';
      default: return isPl ? `Warstwa ${layer}` : `Layer ${layer}`;
    }
  }

  // 2. GMMK family (Layer 0/1 = Win, Layer 2/3 = Mac)
  if (familyOrId.includes('gmmk')) {
    switch (layer) {
      case 0: return isPl ? 'Warstwa 0 (Win)' : 'Layer 0 (Win)';
      case 1: return isPl ? 'Warstwa 1 (Win Fn)' : 'Layer 1 (Win Fn)';
      case 2: return isPl ? 'Warstwa 2 (Mac)' : 'Layer 2 (Mac)';
      case 3: return isPl ? 'Warstwa 3 (Mac Fn)' : 'Layer 3 (Mac Fn)';
      default: return isPl ? `Warstwa ${layer}` : `Layer ${layer}`;
    }
  }

  // 3. Option B: Universal / Clean VIA Standard
  return isPl ? `Warstwa ${layer}` : `Layer ${layer}`;
}

