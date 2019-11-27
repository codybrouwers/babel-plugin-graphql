import { ObjectExpression } from "@babel/types";
import { ArgumentNode } from "graphql";
import { jsValueToType } from "./jsValueToType";
import graphqlAST from "./graphqlAST";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

export function objectExpressionArguments(argumentProperties: ObjectExpression["properties"]) {
  return argumentProperties.reduce<ArgumentNode[]>((argumentsObject, property) => {
    // TODO: Account for spread elements
    if (property.type !== "ObjectProperty") return argumentsObject;
    // TODO: Throw warning for computed properties
    if (property.computed) return argumentsObject;
    if (property.key.type !== "Identifier") return argumentsObject;

    const value = jsValueToType(property.value);
    if (!value) return argumentsObject;

    argumentsObject.push(graphqlAST.newArgumentNode(property.key.name, value));
    return argumentsObject;
  }, []);
}
