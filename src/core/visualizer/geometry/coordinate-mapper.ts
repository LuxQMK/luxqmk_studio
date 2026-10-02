/**
 * LuxQMK Studio - Spatial Coordinate Mapper (6 Directions)
 */

export function getDirectedCoordinate(x: number, y: number, dir: string, maxX: number = 22.5, maxY: number = 5.5) {
  const normX = Math.max(0, Math.min(1, x / (maxX || 1)));
  const normY = Math.max(0, Math.min(1, y / (maxY || 1)));
  const centerX = maxX / 2;
  const centerY = maxY / 2;
  const distCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
  const maxDist = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
  const normDist = Math.min(1, distCenter / (maxDist || 1));

  switch (dir) {
    case 'left_to_right':
      return { primary: normX, secondary: normY, dist: normDist };
    case 'right_to_left':
      return { primary: 1 - normX, secondary: normY, dist: normDist };
    case 'bottom_to_top':
      return { primary: 1 - normY, secondary: normX, dist: normDist };
    case 'top_to_bottom':
      return { primary: normY, secondary: normX, dist: normDist };
    case 'center_out':
      return { primary: normDist, secondary: normDist, dist: normDist };
    case 'perimeter_in':
      return { primary: 1 - normDist, secondary: 1 - normDist, dist: 1 - normDist };
    default:
      return { primary: normX, secondary: normY, dist: normDist };
  }
}
