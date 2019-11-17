import { looksLike } from "./looksLike";

export function isPropertyCall(path, name) {
  return looksLike(path, {
    node: {
      type: "CallExpression",
      callee: {
        property: { name },
      },
    },
  });
}
