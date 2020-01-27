import { MemberExpression, Node, CallExpression } from "@babel/types";
import { Kind, FieldNode } from "graphql";
import { NodePath } from "@babel/core";
import { graphqlAST, callExpressionArguments } from "./utils";

// == Types ================================================================

type TParsableNodeTypes = MemberExpression | CallExpression;

// == Constants ============================================================

// == Functions ============================================================

function findOrCreateFieldNode(
  fieldNode: FieldNode,
  propertyName: string,
  argumentsPath: NodePath<CallExpression> | null
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

function getParentPropertyName(node: TParsableNodeTypes): string | null {
  if (node.type === "MemberExpression") {
    const { object } = node;
    switch (object.type) {
      case "Identifier":
        return object.name;
      case "MemberExpression":
        return object.property.name;
      default:
        return null;
    }
  } else if (node.type === "CallExpression" && node.callee.type === "Identifier") {
    return node.callee.name;
  }
  return null;
}

function getArgumentsPath(path: NodePath<TParsableNodeTypes>): NodePath<CallExpression> | null {
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
  if (node.type === "CallExpression" && node.callee.type === "Identifier") return node.callee.name;
  return null;
}

// == Exports ==============================================================

export class ReferencePathParser {
  static canParse(path: NodePath<Node>): path is NodePath<TParsableNodeTypes> {
    return path.isMemberExpression() || path.isCallExpression();
  }

  path: NodePath<Node>;

  fieldNode: $Writeable<FieldNode>;

  dataIdentifier: string;

  parentFieldNode?: $Writeable<FieldNode>;

  constructor(path: NodePath<Node>, fieldNode: FieldNode, dataIdentifier: string) {
    this.path = path;
    this.fieldNode = fieldNode;
    this.dataIdentifier = dataIdentifier;
  }

  parse() {
    const ancestors = this.path.getAncestry();
    for (const ancestorPath of ancestors.slice(1)) {
      if (ancestorPath.shouldSkip) continue;
      if (!ReferencePathParser.canParse(ancestorPath)) continue;

      if (this.dataIdentifier === getParentPropertyName(ancestorPath.node)) {
        this.parentFieldNode = addFieldNodeForPathNode(ancestorPath, this.fieldNode);
      } else {
        if (!this.parentFieldNode) return;
        this.parentFieldNode = addFieldNodeForPathNode(ancestorPath, this.parentFieldNode);
      }
    }
  }
}
