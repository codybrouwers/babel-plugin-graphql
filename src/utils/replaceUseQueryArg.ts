import babelTypes, { VariableDeclarator, throwStatement } from "@babel/types";
import { NodePath } from "@babel/traverse";
import { USE_QUERY } from "../constants/index";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

/**
 * Replace the top level type argument of a useQuery hook with a given generated query constant
 * @example
 * useQuery("GetMovie")
 * ↓ ↓ ↓ ↓ ↓ ↓
 * useQuery(MY_COMPONENT_GETMOVIEQUERY)
 */
export function replaceUseQueryArg(
  t: typeof babelTypes,
  path: NodePath<VariableDeclarator>,
  queryName: string
) {
  const useQueryCallExpressionPath = path.get("init");
  if (
    !t.isCallExpression(useQueryCallExpressionPath) ||
    !t.isCallExpression(useQueryCallExpressionPath.node)
  ) {
    throw new Error();
  }
  if (!t.isIdentifier(useQueryCallExpressionPath.node.callee, { name: USE_QUERY })) {
    throw new Error();
  }
  useQueryCallExpressionPath.replaceWith(
    t.callExpression(useQueryCallExpressionPath.node.callee, [t.identifier(queryName)])
  );
}
