import babelTypes, { VariableDeclarator } from "@babel/types";
import { NodePath } from "@babel/traverse";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

// TODO: Account for arrow functions
export function getQueryName(
  t: typeof babelTypes,
  path: NodePath<VariableDeclarator>
): null | string {
  const { node } = path.getFunctionParent();
  if (!t.isFunctionDeclaration(node)) return null;

  const queryName = node.id?.name;
  if (!queryName) return null;

  return `${queryName}Query`;
}
