import { FALLBACK_COVER_IMAGE } from "../assets/icons";

export function isFallback(imgSrc: string): boolean {
  if (typeof imgSrc !== "string") return false;

  return imgSrc.endsWith(FALLBACK_COVER_IMAGE);
}
