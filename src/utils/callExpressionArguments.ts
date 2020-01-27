/**
 * TODO:
 * - Look at only aliasing fields if there are more then one of the same field with different arguments
 */

import * as t from "@babel/types";
import { ArgumentNode, DirectiveNode } from "graphql";
import { NodePath } from "@babel/core";
import { objectExpressionArguments } from "./objectExpressionArguments";
import graphqlAST, { INewFieldNodeOptions } from "./graphqlAST";

// == Types ================================================================

// == Constants ============================================================

const DIRECTIVE_REGEX = /^@([a-z_]+)$/i;

// == Functions ============================================================

// Remove arguments and directives call expression
function replaceWithUIDIdentifier(path: NodePath<t.CallExpression>): string | undefined {
  switch (path.node.callee.type) {
    case "MemberExpression": {
      const { name } = path.node.callee.property;
      const uid = path.scope.generateUidIdentifier(name);
      path.node.callee.property = uid;
      path.replaceWith(path.node.callee);
      path.skip();
      return uid.name;
    }
    case "Identifier": {
      const { name } = path.node.callee;
      const uid = path.scope.generateUidIdentifier(name);
      path.node.callee = uid;
      path.replaceWith(path.node.callee);
      path.skip();
      return uid.name;
    }
    default: {
      console.warn("TODO: Unrecognized callee type for CallExpression", path.node.callee.type); // eslint-disable-line no-console
      return undefined;
    }
  }
}

// == Exports ==============================================================

export function callExpressionArguments(path: NodePath<t.CallExpression>): INewFieldNodeOptions {
  const { node } = path;
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
        throw new Error("Only objects or directives with an @ prefix are allowed as arguments");
    }
  }
  let aliasName;
  if (argumentNodes?.length || directiveNodes?.length) {
    aliasName = replaceWithUIDIdentifier(path);
  }
  return { argumentNodes, directiveNodes, aliasName };
}
