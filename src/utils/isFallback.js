import { FALLBACK_COVER_IMAGE } from "../assets/icons";
export function isFallback(imgSrc) {
  if (typeof imgSrc !== "string") return false;

  return imgSrc.endsWith(FALLBACK_COVER_IMAGE);
}
