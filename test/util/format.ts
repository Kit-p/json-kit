export function formatDuration(milliseconds: number) {
  if (milliseconds < 1000) {
    return `${milliseconds.toFixed(0)} ms`;
  }

  const seconds = milliseconds / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(3)} s`;
  }

  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(2)} m`;
  }

  const hours = minutes / 60;
  if (hours < 24) {
    return `${hours.toFixed(2)} h`;
  }

  const days = hours / 24;
  return `${days.toFixed(2)} d`;
}
