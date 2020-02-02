import * as t from "@babel/types";
import { FieldNode } from "graphql";
import { NodePath } from "@babel/core";
import {
  addFieldNodeForPathNode,
  canParsePath,
  callExpressionArguments,
  mergeArgumentNodesIntoFieldNode,
  TParsableNodeTypes,
} from "./utils";
import { DataIdentifiersParser } from "./DataIdentifiersParser";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

export class ReferencePathParser {
  path: NodePath<t.Node>;

  fieldNode: $Writeable<FieldNode>;

  dataIdentifier: string;

  isTopLevel: boolean;

  constructor(
    path: NodePath<t.Identifier>,
    fieldNode: FieldNode,
    dataIdentifier: string,
    isTopLevel = false
  ) {
    this.path = path;
    this.fieldNode = fieldNode;
    this.dataIdentifier = dataIdentifier;
    this.isTopLevel = isTopLevel;
  }

  parse() {
    const ancestors = this.path.getAncestry();
    for (const ancestorPath of ancestors.slice(this.isTopLevel ? 1 : 0)) {
      if (ancestorPath.shouldSkip) continue;

      if (ancestorPath.isVariableDeclarator()) {
        this.parseVariableDeclarator(ancestorPath);
      } else if (ancestorPath.isCallExpression()) {
        this.parseCallExpression(ancestorPath);
      } else if (canParsePath(ancestorPath)) {
        this.parseParsableNodes(ancestorPath);
      } else {
        break;
      }
    }
  }

  private parseVariableDeclarator(ancestorPath: NodePath<t.VariableDeclarator>) {
    if (ancestorPath.node.id.type === "Identifier") {
      new DataIdentifiersParser(ancestorPath, this.fieldNode, ancestorPath.node.id.name).parse();
    } else if (ancestorPath.node.id.type === "ObjectPattern") {
      for (const property of ancestorPath.node.id.properties) {
        if (property.type !== "ObjectProperty") continue;

        // eslint-disable-next-line
        const { Parser } = require("./Parser");
        new Parser(ancestorPath, this.fieldNode).parse();
      }
    }
  }

  private parseParsableNodes(ancestorPath: NodePath<TParsableNodeTypes>) {
    if (ancestorPath.isIdentifier() && this.fieldNode.name.value === ancestorPath.node.name) {
      return;
    }

    this.fieldNode = addFieldNodeForPathNode(ancestorPath, this.fieldNode);
  }

  private parseCallExpression(ancestorPath: NodePath<t.CallExpression>) {
    const options = callExpressionArguments(ancestorPath);
    const newIdentifier = t.identifier(this.fieldNode.alias?.value || this.fieldNode.name.value);

    if (ancestorPath.node.callee.type === "MemberExpression") {
      ancestorPath.node.callee.property = newIdentifier;
    } else if (ancestorPath.node.callee.type === "Identifier") {
      ancestorPath.node.callee = newIdentifier;
    }
    ancestorPath.replaceWith(ancestorPath.node.callee);
    ancestorPath.skip();
    mergeArgumentNodesIntoFieldNode(this.fieldNode, options.argumentNodes, options.directiveNodes);
  }
}
