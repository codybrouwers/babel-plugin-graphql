import babelTypes, { VariableDeclarator } from "@babel/types";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

export function getQueryType(t: typeof babelTypes, { init }: VariableDeclarator) {
  if (!t.isCallExpression(init)) return null;

  const queryArg = init.arguments[0];
  if (!t.isStringLiteral(queryArg)) {
    throw new Error(
      "The first argument of useQuery must be a string specifying the graphql type the query is on."
    );
  }
  return queryArg.value;
}
