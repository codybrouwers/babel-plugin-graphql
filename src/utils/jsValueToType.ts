import babelTypes, { Node } from "@babel/types";
import {
  ValueNode,
  coerceInputValue,
  Kind,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

/**
 * @todo Handle more types
 */
export function jsValueToType(value: Node): ValueNode | null {
  switch (value.type) {
    case "StringLiteral":
      return {
        kind: Kind.STRING,
        value: coerceInputValue(value.value, GraphQLString),
      };
    case "NumericLiteral":
      return {
        kind: Kind.INT,
        value: coerceInputValue(value.value, GraphQLInt),
      };
    case "BooleanLiteral":
      return {
        kind: Kind.BOOLEAN,
        value: coerceInputValue(value.value, GraphQLBoolean),
      };
    default:
      return null;
  }
}
