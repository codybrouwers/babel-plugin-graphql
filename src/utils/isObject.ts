import { looksLike } from "./looksLike";

export function isObject(path) {
  return looksLike(path, { key: "object" });
}
