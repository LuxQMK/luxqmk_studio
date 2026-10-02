/**
 * LuxQMK Studio - 60 FPS Real-Time Software Lighting & Audio Visualizer Engine
 * Backward-compatibility Facade re-exporting from the modular visualizer architecture.
 *
 * All modules are organized cleanly under `src/core/visualizer/`:
 * - `types.ts`: Core interfaces (KeyGeometry, RenderContext, AudioRenderContext, etc.)
 * - `palettes/`: Color palettes, HSV utilities, cyclic & linear gradient samplers
 * - `geometry/`: Keycap center coordinates, spatial direction mappers, hardware LED index caching
 * - `audio/`: Web Audio API / WASAPI loopback analyzer, frequency & peak extraction, audio effects
 * - `effects/`: 30+ PC procedural animations with 6 spatial directions
 * - `sidelights/`: Hardware & DOM underglow rendering engine
 * - `visualizer-engine.ts`: 60 FPS orchestration loop & direct WebHID hardware frame streaming
 */

export * from './visualizer';
