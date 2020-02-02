/**
 * TODO:
 * - Look at only aliasing fields if there are more then one of the same field with different arguments
 */

import * as t from "@babel/types";
import { ArgumentNode, DirectiveNode } from "graphql";
import { NodePath } from "@babel/core";
import { objectExpressionArguments } from "./objectExpressionArguments";
import { newGraphQLDirectiveNode } from "./graphqlASTBuilders";

// == Types ================================================================

interface IArgumentNodes {
  argumentNodes?: ArgumentNode[];
  directiveNodes?: DirectiveNode[];
}

// == Constants ============================================================

const DIRECTIVE_REGEX = /^@([a-z_]+)$/i;

// == Functions ============================================================

// == Exports ==============================================================

export function callExpressionArguments(path: NodePath<t.CallExpression>): IArgumentNodes {
  const { node } = path;
  if (node.type !== "CallExpression") return {};

  let argumentNodes: ArgumentNode[] | undefined;
  let directiveNodes: DirectiveNode[] | undefined;
  for (const argument of node.arguments) {
    switch (argument.type) {
      case "ObjectExpression":
        if (argumentNodes) throw path.buildCodeFrameError("You can only have one arguments object");
        argumentNodes = objectExpressionArguments(argument.properties);
        break;
      case "StringLiteral": {
        if (!directiveNodes) directiveNodes = [];
        const value = argument.value.match(DIRECTIVE_REGEX);
        if (!value) {
          throw path.buildCodeFrameError(
            `Directives must be prefixed with '@' and match against this regular expression ${DIRECTIVE_REGEX}`
          );
        }
        directiveNodes.push(newGraphQLDirectiveNode(value[1]));
        break;
      }
      default:
        throw path.buildCodeFrameError(
          "Only objects or directives with an @ prefix are allowed as arguments"
        );
    }
  }
  return { argumentNodes, directiveNodes };
}

// Remove arguments and directives call expression
export function replaceNodeWithUIDIdentifier(path: NodePath<t.CallExpression>): string | undefined {
  switch (path.node.callee.type) {
    case "MemberExpression": {
      const { name } = path.node.callee.property;
      const uid = path.scope.generateUidIdentifier(name);
      return uid.name;
    }
    case "Identifier": {
      const { name } = path.node.callee;
      const uid = path.scope.generateUidIdentifier(name);
      return uid.name;
    }
    default: {
      throw path.buildCodeFrameError("Unrecognized callee type for CallExpression");
    }
  }
}
