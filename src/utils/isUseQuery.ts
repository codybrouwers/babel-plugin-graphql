import * as t from "@babel/types";
import { USE_QUERY } from "../constants/index";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

/**
 * Takes a VariableDeclarator path and returns true or false if it is a useQuery declarator
 */
export function isUseQuery({ init }: t.VariableDeclarator) {
  if (!t.isCallExpression(init)) return false;
  if (!t.isIdentifier(init.callee, { name: USE_QUERY })) return false;
  return true;
}
