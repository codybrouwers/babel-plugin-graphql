import * as t from "@babel/types";
import { Kind, FieldNode } from "graphql";
import { NodePath } from "@babel/core";
import { graphqlAST, callExpressionArguments } from "./utils";
import { DataIdentifierParser } from "./DataIdentifierParser";

// == Types ================================================================

type TParsableNodeTypes = t.MemberExpression | t.CallExpression | t.Identifier;

// == Constants ============================================================

// == Functions ============================================================

function findOrCreateFieldNode(
  fieldNode: FieldNode,
  propertyName: string,
  argumentsPath: NodePath<t.CallExpression> | null
) {
  const existingFieldNode = findFieldNode(fieldNode, propertyName);
  const options = argumentsPath ? callExpressionArguments(argumentsPath) : undefined;
  if (existingFieldNode && !options?.aliasName) {
    mergeCallExpressionArguments(existingFieldNode, options);
    return existingFieldNode;
  }
  return graphqlAST.newFieldNode(propertyName, options);
}

function mergeCallExpressionArguments(
  fieldNode: $Writeable<FieldNode>,
  { argumentNodes = [], directiveNodes = [] }: ReturnType<typeof callExpressionArguments> = {}
) {
  fieldNode.arguments = [...(fieldNode.arguments || []), ...argumentNodes];
  fieldNode.directives = [...(fieldNode.directives || []), ...directiveNodes];
}

function findFieldNode(fieldNode: FieldNode, propertyName: string) {
  return fieldNode.selectionSet?.selections.find(
    (node): node is FieldNode =>
      node.kind === Kind.FIELD && (node.alias?.value || node.name.value) === propertyName
  );
}

function filterFieldNodesWithoutProperty(fieldNode: FieldNode, propertyName: string) {
  return (
    fieldNode.selectionSet?.selections.filter(
      (node): node is FieldNode =>
        node.kind === Kind.FIELD && (node.alias?.value || node.name.value) !== propertyName
    ) || []
  );
}

function getPropertyName(node: TParsableNodeTypes): string | null {
  if (node.type === "MemberExpression") {
    const { object } = node;
    switch (object.type) {
      case "Identifier":
        if (object.name === "data") return object.name;
        return node.property.name;
      case "MemberExpression":
        return object.property.name;
      default:
        return null;
    }
  } else if (node.type === "Identifier") {
    return node.name;
  } else if (node.type === "CallExpression" && node.callee.type === "Identifier") {
    return node.callee.name;
  }
  return null;
}

function getArgumentsPath(path: NodePath<TParsableNodeTypes>): NodePath<t.CallExpression> | null {
  if (path.isMemberExpression() && path.parentPath.isCallExpression()) return path.parentPath;
  if (path.isCallExpression()) return path;
  return null;
}

function addFieldNodeForPathNode(
  path: NodePath<TParsableNodeTypes>,
  fieldNode: $Writeable<FieldNode>
): FieldNode {
  const { node } = path;
  const propertyName = nodeName(node);
  if (!propertyName) return fieldNode;

  const propertyFieldNode = findOrCreateFieldNode(fieldNode, propertyName, getArgumentsPath(path));
  const existingFieldNodes = filterFieldNodesWithoutProperty(fieldNode, propertyName);
  fieldNode.selectionSet = graphqlAST.newSelectionSet([...existingFieldNodes, propertyFieldNode]);
  return propertyFieldNode;
}

function nodeName(node: TParsableNodeTypes) {
  if (node.type === "MemberExpression") return node.property.name;
  if (node.type === "Identifier") return node.name;
  if (node.type === "CallExpression" && node.callee.type === "Identifier") return node.callee.name;
  return null;
}

// == Exports ==============================================================

export class ReferencePathParser {
  static canParse(path: NodePath<t.Node>): path is NodePath<TParsableNodeTypes> {
    if (path.isIdentifier() && path.node.name === "data") return false;
    return path.isMemberExpression() || path.isCallExpression() || path.isIdentifier();
  }

  path: NodePath<t.Node>;

  fieldNode: $Writeable<FieldNode>;

  dataIdentifier: string;

  parentFieldNode?: $Writeable<FieldNode>;

  constructor(path: NodePath<t.Identifier>, fieldNode: FieldNode, dataIdentifier: string) {
    this.path = path;
    this.fieldNode = fieldNode;
    this.dataIdentifier = dataIdentifier;
  }

  parse() {
    const ancestors = this.path.getAncestry();
    for (const ancestorPath of ancestors) {
      if (ancestorPath.shouldSkip) continue;
      if (!ReferencePathParser.canParse(ancestorPath)) continue;

      if (
        this.dataIdentifier === getPropertyName(ancestorPath.node) &&
        this.fieldNode.name.value !== this.dataIdentifier
      ) {
        this.parentFieldNode = addFieldNodeForPathNode(ancestorPath, this.fieldNode);
      } else if (this.fieldNode.name.value === getPropertyName(ancestorPath.node)) {
        this.parentFieldNode = this.fieldNode;
      } else {
        if (!this.parentFieldNode) return;

        this.parentFieldNode = addFieldNodeForPathNode(ancestorPath, this.parentFieldNode);
      }

      // TODO: Cleanup
      if (ancestorPath.parentPath.isVariableDeclarator()) {
        if (ancestorPath.parentPath.node.id.type === "Identifier") {
          new DataIdentifierParser(
            ancestorPath.parentPath,
            this.parentFieldNode,
            ancestorPath.parentPath.node.id.name
          ).parse();
        } else if (ancestorPath.parentPath.node.id.type === "ObjectPattern") {
          for (const property of ancestorPath.parentPath.node.id.properties) {
            if (property.type !== "ObjectProperty") continue;

            new DataIdentifierParser(
              ancestorPath.parentPath,
              this.parentFieldNode,
              property.key.name
            ).parse();
          }
        }
      }
    }
  }
}
