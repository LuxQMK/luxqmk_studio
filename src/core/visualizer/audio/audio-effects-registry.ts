/**
 * LuxQMK Studio - Audio Effects Registry
 */

import { AudioEffectRenderer } from '../types';
import { EqualizerEffect } from './effects/equalizer';

class AudioEffectsRegistry {
  private effects: Map<string, AudioEffectRenderer> = new Map();

  constructor() {
    this.register(new EqualizerEffect());
  }

  public register(effect: AudioEffectRenderer): void {
    this.effects.set(effect.id, effect);
    if (effect.init) effect.init();
  }

  public get(id: string): AudioEffectRenderer | undefined {
    return this.effects.get(id) || this.effects.get('equalizer');
  }

  public resetAll(): void {
    this.effects.forEach((eff) => {
      if (eff.reset) eff.reset();
    });
  }
}

export const audioEffectsRegistry = new AudioEffectsRegistry();
