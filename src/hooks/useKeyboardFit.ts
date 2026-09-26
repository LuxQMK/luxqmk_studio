import { useEffect, useRef } from 'react';

/**
 * Hook to automatically scale and center the virtual keyboard canvas inside its container,
 * preventing clipping on smaller resolutions or resized windows.
 */
export function useKeyboardFit(canvasWidth: number, canvasHeight: number) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fit = () => {
      const wrapper = wrapperRef.current;
      const canvas = canvasRef.current;
      if (!wrapper || !canvas) return;

      const containerWidth = wrapper.clientWidth;
      if (containerWidth <= 0) return;

      const baseWidth = canvasWidth;
      const baseHeight = canvasHeight;

      if (containerWidth < baseWidth) {
        const scale = Math.min(1, containerWidth / baseWidth);
        canvas.style.transform = `scale(${scale})`;
        canvas.style.transformOrigin = 'top center';
        wrapper.style.height = `${Math.ceil(baseHeight * scale) + 24}px`;
      } else {
        canvas.style.transform = 'none';
        wrapper.style.height = `${baseHeight + 16}px`;
      }
    };

    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && wrapperRef.current) {
      resizeObserver = new ResizeObserver(fit);
      resizeObserver.observe(wrapperRef.current);
    }

    const timer1 = setTimeout(fit, 60);
    const timer2 = setTimeout(fit, 300);

    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [canvasWidth, canvasHeight]);

  return { wrapperRef, canvasRef };
}
