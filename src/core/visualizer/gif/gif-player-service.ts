/**
 * LuxQMK Studio - GIF Animation Matrix Player & Spatial Sampler
 * Decodes GIF files at full frame precision and samples 2D matrix coordinates to LED keys
 */

import { KeyGeometry } from '../types';
import { StudioLightingConfig } from '../../../types/lighting';

export interface DecodedGifFrame {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData;
  durationMs: number;
}

export interface GifMetadata {
  width: number;
  height: number;
  frameCount: number;
  totalDurationMs: number;
  fileName: string;
  fileSizeBytes: number;
}

export class GifPlayerService {
  private frames: DecodedGifFrame[] = [];
  private metadata: GifMetadata | null = null;
  private currentFrameIndex: number = 0;
  private frameAccumulatorMs: number = 0;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private cachedDataUrl: string | null = null;

  public get isGifLoaded(): boolean {
    return this.isLoaded && this.frames.length > 0;
  }

  public get gifMetadata(): GifMetadata | null {
    return this.metadata;
  }

  public get currentFrameNumber(): number {
    return this.frames.length > 0 ? this.currentFrameIndex + 1 : 0;
  }

  public get totalFrames(): number {
    return this.frames.length;
  }

  public get dataUrl(): string | null {
    return this.cachedDataUrl;
  }

  /**
   * Load and decode a GIF file from ArrayBuffer, Blob, or File
   */
  public async loadGif(
    source: ArrayBuffer | Blob | File,
    fileName: string = 'animation.gif',
    fileSizeBytes: number = 0
  ): Promise<{ success: boolean; frameCount: number; width: number; height: number; error?: string }> {
    if (this.isLoading) {
      return { success: false, frameCount: 0, width: 0, height: 0, error: 'Decoder busy' };
    }

    this.isLoading = true;

    try {
      let arrayBuffer: ArrayBuffer;
      let blob: Blob;

      if (source instanceof ArrayBuffer) {
        arrayBuffer = source;
        blob = new Blob([arrayBuffer], { type: 'image/gif' });
      } else {
        blob = source;
        arrayBuffer = await source.arrayBuffer();
        if (!fileSizeBytes && (source as File).size) {
          fileSizeBytes = (source as File).size;
        }
        if (!fileName && (source as File).name) {
          fileName = (source as File).name;
        }
      }

      if (!fileSizeBytes) {
        fileSizeBytes = arrayBuffer.byteLength;
      }

      // Convert to Data URL for thumbnail preview and persistence
      const dataUrl = await this._blobToDataUrl(blob);
      this.cachedDataUrl = dataUrl;

      // Decode frames using native ImageDecoder if available
      const decodedFrames = await this._decodeWithImageDecoder(arrayBuffer);

      if (decodedFrames.length === 0) {
        throw new Error('No valid frames decoded from GIF file');
      }

      // Clean up previous frames
      this.clear();

      this.frames = decodedFrames;
      this.currentFrameIndex = 0;
      this.frameAccumulatorMs = 0;
      this.isLoaded = true;

      const firstFrame = this.frames[0];
      let totalDurationMs = 0;
      for (const f of this.frames) {
        totalDurationMs += f.durationMs;
      }

      this.metadata = {
        width: firstFrame.imageData.width,
        height: firstFrame.imageData.height,
        frameCount: this.frames.length,
        totalDurationMs,
        fileName,
        fileSizeBytes
      };

      this.cachedDataUrl = dataUrl;
      this.isLoading = false;

      return {
        success: true,
        frameCount: this.frames.length,
        width: this.metadata.width,
        height: this.metadata.height
      };
    } catch (err: any) {
      console.error('Error decoding GIF file:', err);
      this.isLoading = false;
      return {
        success: false,
        frameCount: 0,
        width: 0,
        height: 0,
        error: err.message || 'Failed to decode GIF'
      };
    }
  }

  /**
   * Decode GIF frames using Chromium WebCodecs ImageDecoder API
   */
  private async _decodeWithImageDecoder(arrayBuffer: ArrayBuffer): Promise<DecodedGifFrame[]> {
    if (typeof (window as any).ImageDecoder === 'undefined') {
      return this._fallbackDecode(arrayBuffer);
    }

    try {
      const decoder = new (window as any).ImageDecoder({
        data: arrayBuffer,
        type: 'image/gif'
      });

      await decoder.tracks.ready;
      const track = decoder.tracks.selectedTrack;
      const frameCount = track ? track.frameCount : 1;
      const frames: DecodedGifFrame[] = [];

      for (let i = 0; i < frameCount; i++) {
        const frameResult = await decoder.decode({ frameIndex: i });
        const videoFrame = frameResult.image;
        const width = videoFrame.displayWidth || videoFrame.codedWidth;
        const height = videoFrame.displayHeight || videoFrame.codedHeight;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          videoFrame.close();
          continue;
        }

        ctx.drawImage(videoFrame, 0, 0, width, height);
        const durationMicro = videoFrame.duration || 100000; // default 100ms
        const durationMs = Math.max(16, Math.round(durationMicro / 1000));
        videoFrame.close();

        const imageData = ctx.getImageData(0, 0, width, height);

        frames.push({
          canvas,
          ctx,
          imageData,
          durationMs
        });
      }

      return frames;
    } catch (err) {
      console.warn('ImageDecoder failed, falling back:', err);
      return this._fallbackDecode(arrayBuffer);
    }
  }

  /**
   * Fallback decoder using HTMLImageElement for single-frame or simple environments
   */
  private async _fallbackDecode(arrayBuffer: ArrayBuffer): Promise<DecodedGifFrame[]> {
    return new Promise((resolve, reject) => {
      const blob = new Blob([arrayBuffer], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        URL.revokeObjectURL(url);
        const width = img.naturalWidth || img.width || 64;
        const height = img.naturalHeight || img.height || 32;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);

        resolve([
          {
            canvas,
            ctx,
            imageData,
            durationMs: 100
          }
        ]);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image in fallback decoder'));
      };

      img.src = url;
    });
  }

  private _blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Advance animation clock and sample LED keys
   */
  public tick(
    now: number,
    dt: number,
    config: StudioLightingConfig,
    keys: KeyGeometry[],
    maxX: number,
    maxY: number,
    applyKeyStyle: (k: KeyGeometry, r: number, g: number, b: number, bright: number) => void
  ): void {
    if (!this.isLoaded || this.frames.length === 0) {
      // Clear or dim keys if no GIF is loaded
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (!k.isKnob) {
          applyKeyStyle(k, 0, 0, 0, 0);
        }
      }
      return;
    }

    // 1. Advance timeline
    const speed = Math.max(0.1, Math.min(5.0, config.gifSpeed || 1.0));
    this.frameAccumulatorMs += dt * speed;

    let currentFrame = this.frames[this.currentFrameIndex];
    while (this.frameAccumulatorMs >= currentFrame.durationMs && this.frames.length > 1) {
      this.frameAccumulatorMs -= currentFrame.durationMs;
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
      currentFrame = this.frames[this.currentFrameIndex];
    }

    const { imageData } = currentFrame;
    const imgW = imageData.width;
    const imgH = imageData.height;
    const data = imageData.data;

    // 2. Compute Spatial Fit / Mapping Box
    const fitMode = config.gifFitMode || 'fit';
    const kbdAspect = maxX / (maxY || 1);
    const gifAspect = imgW / (imgH || 1);

    let scaledW = maxX;
    let scaledH = maxY;
    let offsetX = 0;
    let offsetY = 0;

    if (fitMode === 'fit') {
      // Letterbox / Contain
      if (gifAspect > kbdAspect) {
        scaledW = maxX;
        scaledH = maxX / gifAspect;
        offsetX = 0;
        offsetY = (maxY - scaledH) / 2;
      } else {
        scaledH = maxY;
        scaledW = maxY * gifAspect;
        offsetX = (maxX - scaledW) / 2;
        offsetY = 0;
      }
    } else if (fitMode === 'fill') {
      // Crop / Cover
      if (gifAspect > kbdAspect) {
        scaledH = maxY;
        scaledW = maxY * gifAspect;
        offsetX = (maxX - scaledW) / 2;
        offsetY = 0;
      } else {
        scaledW = maxX;
        scaledH = maxX / gifAspect;
        offsetX = 0;
        offsetY = (maxY - scaledH) / 2;
      }
    } else {
      // Stretch
      scaledW = maxX;
      scaledH = maxY;
      offsetX = 0;
      offsetY = 0;
    }

    const intensity = config.gifIntensity !== undefined ? config.gifIntensity : 1.0;
    const contrast = config.gifContrast !== undefined ? config.gifContrast : 1.0;

    // 3. Multi-point area sampling for each key
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.isKnob) continue;

      const halfW = (k.w || 1) * 0.35;
      const halfH = (k.h || 1) * 0.35;

      // 5 sample points per key (Center + 4 corners)
      const samplePoints = [
        { x: k.centerX, y: k.centerY },
        { x: k.centerX - halfW, y: k.centerY - halfH },
        { x: k.centerX + halfW, y: k.centerY - halfH },
        { x: k.centerX - halfW, y: k.centerY + halfH },
        { x: k.centerX + halfW, y: k.centerY + halfH }
      ];

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let sampleCount = 0;

      for (let s = 0; s < samplePoints.length; s++) {
        const pt = samplePoints[s];
        const normU = (pt.x - offsetX) / scaledW;
        const normV = (pt.y - offsetY) / scaledH;

        if (normU >= 0 && normU <= 1 && normV >= 0 && normV <= 1) {
          const px = Math.min(imgW - 1, Math.max(0, Math.floor(normU * imgW)));
          const py = Math.min(imgH - 1, Math.max(0, Math.floor(normV * imgH)));
          const pIdx = (py * imgW + px) * 4;

          const a = data[pIdx + 3];
          if (a > 20) {
            const alphaFactor = a / 255;
            sumR += data[pIdx + 0] * alphaFactor;
            sumG += data[pIdx + 1] * alphaFactor;
            sumB += data[pIdx + 2] * alphaFactor;
            sampleCount++;
          }
        }
      }

      if (sampleCount === 0) {
        applyKeyStyle(k, 0, 0, 0, 0);
        continue;
      }

      let avgR = sumR / sampleCount;
      let avgG = sumG / sampleCount;
      let avgB = sumB / sampleCount;

      // Contrast adjustment
      if (contrast !== 1.0) {
        avgR = Math.max(0, Math.min(255, ((avgR / 255 - 0.5) * contrast + 0.5) * 255));
        avgG = Math.max(0, Math.min(255, ((avgG / 255 - 0.5) * contrast + 0.5) * 255));
        avgB = Math.max(0, Math.min(255, ((avgB / 255 - 0.5) * contrast + 0.5) * 255));
      }

      applyKeyStyle(k, avgR, avgG, avgB, intensity);
    }
  }

  /**
   * Sidelight color calculation for left/right underglow strips
   */
  public computeSidelightRgb(
    side: 'left' | 'right',
    normY: number,
    config: StudioLightingConfig
  ): { r: number; g: number; b: number } {
    if (!this.isLoaded || this.frames.length === 0) {
      return { r: 0, g: 0, b: 0 };
    }

    const mode = config.gifSidelightMode || 'edge';
    if (mode === 'off') {
      return { r: 0, g: 0, b: 0 };
    }

    const currentFrame = this.frames[this.currentFrameIndex];
    const { imageData } = currentFrame;
    const imgW = imageData.width;
    const imgH = imageData.height;
    const data = imageData.data;

    const intensity = config.gifIntensity !== undefined ? config.gifIntensity : 1.0;
    const contrast = config.gifContrast !== undefined ? config.gifContrast : 1.0;

    const centerY = Math.min(imgH - 1, Math.max(0, Math.floor(normY * imgH)));
    const yRadius = Math.max(1, Math.floor(imgH * 0.12)); // 12% vertical band

    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let count = 0;

    if (mode === 'edge') {
      // Sample 30% lateral band on the specified side to capture non-transparent animation colors
      const startX = side === 'left' ? 0 : Math.max(0, Math.floor(imgW * 0.70));
      const endX = side === 'left' ? Math.min(imgW, Math.max(1, Math.floor(imgW * 0.30))) : imgW;
      const startY = Math.max(0, centerY - yRadius);
      const endY = Math.min(imgH, centerY + yRadius + 1);

      const stepX = Math.max(1, Math.floor((endX - startX) / 5));
      const stepY = Math.max(1, Math.floor((endY - startY) / 3));

      for (let y = startY; y < endY; y += stepY) {
        for (let x = startX; x < endX; x += stepX) {
          const pIdx = (y * imgW + x) * 4;
          const a = data[pIdx + 3];
          if (a > 20) {
            const alphaFactor = a / 255;
            sumR += data[pIdx + 0] * alphaFactor;
            sumG += data[pIdx + 1] * alphaFactor;
            sumB += data[pIdx + 2] * alphaFactor;
            count++;
          }
        }
      }
    }

    // Fallback: If edge region had no valid non-transparent pixels or mode is dominant:
    if (count === 0 || mode === 'dominant') {
      const stepX = Math.max(1, Math.floor(imgW / 8));
      const stepY = Math.max(1, Math.floor(imgH / 8));
      let fallbackR = 0;
      let fallbackG = 0;
      let fallbackB = 0;
      let fallbackCount = 0;

      for (let y = 0; y < imgH; y += stepY) {
        for (let x = 0; x < imgW; x += stepX) {
          const pIdx = (y * imgW + x) * 4;
          const a = data[pIdx + 3];
          if (a > 20) {
            const alphaFactor = a / 255;
            fallbackR += data[pIdx + 0] * alphaFactor;
            fallbackG += data[pIdx + 1] * alphaFactor;
            fallbackB += data[pIdx + 2] * alphaFactor;
            fallbackCount++;
          }
        }
      }

      if (fallbackCount > 0) {
        sumR = fallbackR;
        sumG = fallbackG;
        sumB = fallbackB;
        count = fallbackCount;
      }
    }

    if (count === 0) {
      return { r: 0, g: 0, b: 0 };
    }

    let avgR = sumR / count;
    let avgG = sumG / count;
    let avgB = sumB / count;

    if (contrast !== 1.0) {
      avgR = Math.max(0, Math.min(255, ((avgR / 255 - 0.5) * contrast + 0.5) * 255));
      avgG = Math.max(0, Math.min(255, ((avgG / 255 - 0.5) * contrast + 0.5) * 255));
      avgB = Math.max(0, Math.min(255, ((avgB / 255 - 0.5) * contrast + 0.5) * 255));
    }

    return {
      r: Math.max(0, Math.min(255, Math.round(avgR * intensity))),
      g: Math.max(0, Math.min(255, Math.round(avgG * intensity))),
      b: Math.max(0, Math.min(255, Math.round(avgB * intensity)))
    };
  }

  /**
   * Release cached frames and clear decoder memory
   */
  public clear(): void {
    this.frames = [];
    this.metadata = null;
    this.currentFrameIndex = 0;
    this.frameAccumulatorMs = 0;
    this.isLoaded = false;
    this.cachedDataUrl = null;
  }
}

export const gifPlayerService = new GifPlayerService();
