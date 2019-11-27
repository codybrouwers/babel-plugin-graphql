import { Node } from "@babel/types";
import { ArgumentNode, DirectiveNode } from "graphql";
import { objectExpressionArguments } from "./objectExpressionArguments";
import graphqlAST from "./graphqlAST";

// == Types ================================================================

interface IReturnType {
  argumentNodes?: ArgumentNode[];
  directiveNodes?: DirectiveNode[];
}

// == Constants ============================================================

const DIRECTIVE_REGEX = /^@([a-z_]+)$/i;

// == Functions ============================================================

// == Exports ==============================================================

export function callExpressionArguments(node: Node): IReturnType {
  if (node.type !== "CallExpression") return {};

  let argumentNodes: ArgumentNode[] | undefined;
  let directiveNodes: DirectiveNode[] | undefined;
  for (const argument of node.arguments) {
    switch (argument.type) {
      case "ObjectExpression":
        if (argumentNodes) throw new Error("You can only have one arguments object");
        argumentNodes = objectExpressionArguments(argument.properties);
        break;
      case "StringLiteral": {
        if (!directiveNodes) directiveNodes = [];
        const value = argument.value.match(DIRECTIVE_REGEX);
        if (!value) {
          throw new Error(
            `Directives must be prefixed with '@' and match against this regular expression ${DIRECTIVE_REGEX}`
          );
        }
        directiveNodes.push(graphqlAST.newDirectiveNode(value[1]));
        break;
      }
      default:
        break;
    }
  }
  return { argumentNodes, directiveNodes };
}
