/**
 * WebHID & VIA Protocol Type Definitions for LuxQMK Studio
 */

export interface HIDDeviceDescriptor {
  vendorId: number;
  productId: number;
  productName: string;
  serialNumber?: string;
  device: HIDDevice;
}

export interface DeviceCapability {
  hasRgbMatrix: boolean;
  hasSidelights: boolean;
  hasLogoLed: boolean;
  hasRotaryEncoder: boolean;
  hasDualLayerReactive: boolean;
  hasDynamicDebounce: boolean;
  hasNkroToggle: boolean;
  hasPerKeyProfiles: boolean;
  hasMonochromeBacklight: boolean;
  eepromCustomSize: number;
  rows: number;
  cols: number;
  totalKeys: number;
}

export interface DeviceProfile {
  id: string;
  name: string;
  vendorId: number;
  productId: number;
  layoutName: string;
  capabilities: DeviceCapability;
}

// VIA Channel Raw Command Constants
export const VIA_RAW_EPSIZE = 32;

export enum ViaCommand {
  GET_PROTOCOL_VERSION = 0x01,
  GET_KEYBOARD_VALUE = 0x02,
  SET_KEYBOARD_VALUE = 0x03,
  DYNAMIC_KEYMAP_GET_KEYCODE = 0x04,
  DYNAMIC_KEYMAP_SET_KEYCODE = 0x05,
  DYNAMIC_KEYMAP_RESET = 0x06,
  CUSTOM_SET_VALUE = 0x07,
  CUSTOM_GET_VALUE = 0x08,
  CUSTOM_SAVE = 0x09,
  EEPROM_RESET = 0x0a,
  BOOTLOADER = 0x0b,
  DYNAMIC_KEYMAP_MACRO_GET_COUNT = 0x0c,
  DYNAMIC_KEYMAP_MACRO_GET_BUFFER_SIZE = 0x0d,
  DYNAMIC_KEYMAP_MACRO_GET_BUFFER = 0x0e,
  DYNAMIC_KEYMAP_MACRO_SET_BUFFER = 0x0f,
  DYNAMIC_KEYMAP_MACRO_RESET = 0x10,
  DYNAMIC_KEYMAP_GET_ENCODER = 0x11,
  DYNAMIC_KEYMAP_SET_ENCODER = 0x12,
}

export enum CustomMenuId {
  BACKLIGHT = 0x01,
  REACTIVE = 0x02,
  WINLOCK = 0x03,
  LAYER_LIGHTING = 0x04,
  LOGO_LOCKS = 0x05,
  PERKEY_PROFILE = 0x06,
  PERFORMANCE = 0x07,
  SIDELIGHT = 0x08,
}
