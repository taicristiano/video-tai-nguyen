export function calculateDurationInFrames(estimatedDurationSec: number, fps: number = 30): number {
  if (estimatedDurationSec < 60 || estimatedDurationSec > 240) {
    throw new RangeError(`estimated_duration must be between 60 and 240, got ${estimatedDurationSec}`);
  }
  return Math.ceil(estimatedDurationSec * fps) + 60;
}
