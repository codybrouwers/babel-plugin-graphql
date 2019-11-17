import { looksLike } from "./looksLike";

export function isCreateFragment(path) {
  return looksLike(path, { node: { name: "createFragment" } });
}
