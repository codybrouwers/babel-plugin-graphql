import * as t from "@babel/types";
import { NodePath } from "@babel/traverse";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

/**
 * Generates name that will be used for the query based on the component's name and
 * the top level type query is based on.
 * @example
 * function MyComponentName() {
 *   const { data } = useQuery("GetMovie")
 * }
 * ↓ ↓ ↓ ↓ ↓ ↓
 * "MyComponentName__GetMovieQuery"
 *
 * @todo Handle component wrapper functions like
 * @example const MyComponent = memo(someWrapper((props) => ...
 */
export function getQueryName(parentPath: NodePath<t.Function>, queryType: string): null | string {
  let queryName;
  switch (parentPath.node.type) {
    case "FunctionDeclaration":
      queryName = parentPath.node.id?.name;
      break;
    case "FunctionExpression":
    case "ArrowFunctionExpression": {
      const { parent } = parentPath;
      if (!t.isVariableDeclarator(parent)) break;
      if (!t.isIdentifier(parent.id)) break;

      queryName = parent.id.name;
      break;
    }
    default:
      break;
  }

  if (!queryName) return null;
  return `${queryName}__${queryType}Query`;
}
