export function formatTimeHours(time) {
  if (!time) return "0分";

  const MS_HOUR = 3600000;
  const MS_MINUTE = 60000;

  const hours = Math.floor(time / MS_HOUR);
  const minutes = Math.floor((time % MS_HOUR) / MS_MINUTE);

  if (hours > 0) {
    return `${hours}時間 ${minutes}分`;
  } else {
    return `${minutes}分`;
  }
}
