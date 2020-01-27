import * as t from "@babel/types";
import { ArgumentNode } from "graphql";
import { jsValueToType } from "./jsValueToType";
import graphqlAST from "./graphqlAST";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

export function objectExpressionArguments(argumentProperties: t.ObjectExpression["properties"]) {
  const argumentNodes: ArgumentNode[] = [];
  for (const property of argumentProperties) {
    // TODO: Account for spread elements
    if (property.type !== "ObjectProperty") continue;
    // TODO: Throw warning for computed properties
    if (property.computed) continue;
    if (property.key.type !== "Identifier") continue;

    const value = jsValueToType(property.value);
    if (!value) continue;

    argumentNodes.push(graphqlAST.newArgumentNode(property.key.name, value));
  }
  return argumentNodes;
}
