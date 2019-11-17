import { looksLike } from "./looksLike";

export function isUseQuery(path) {
  return looksLike(path, { node: { name: "useQuery" } });
}
