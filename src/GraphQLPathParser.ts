import { MemberExpression, Node, CallExpression } from "@babel/types";
import { Kind, FieldNode } from "graphql";
import { NodePath } from "@babel/core";
import { graphqlAST, callExpressionArguments } from "./utils";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

function findOrCreateFieldNode(
  fieldNode: FieldNode,
  propertyName: string,
  argumentsNode: CallExpression | null
) {
  const existingFieldNode = findFieldNode(fieldNode, propertyName);
  const options = argumentsNode ? callExpressionArguments(argumentsNode) : undefined;
  if (existingFieldNode) {
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
    (node): node is FieldNode => node.kind === Kind.FIELD && node.name.value === propertyName
  );
}

function filterFieldNodesWithoutProperty(fieldNode: FieldNode, propertyName: string) {
  return (
    fieldNode.selectionSet?.selections.filter(
      (node): node is FieldNode => node.kind === Kind.FIELD && node.name.value !== propertyName
    ) || []
  );
}

function getParentPropertyName(node: MemberExpression | CallExpression): string | null {
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

function getArgumentsNode(path: NodePath<MemberExpression | CallExpression>) {
  if (path.isMemberExpression() && path.parent.type === "CallExpression") return path.parent;
  if (path.isCallExpression()) return path.node;
  return null;
}

function addFieldNodeForPathNode(
  path: NodePath<MemberExpression | CallExpression>,
  fieldNode: $Writeable<FieldNode>
): FieldNode {
  const { node } = path;
  const propertyName = nodeName(node);
  if (!propertyName) return fieldNode;

  const propertyFieldNode = findOrCreateFieldNode(fieldNode, propertyName, getArgumentsNode(path));
  const existingFieldNodes = filterFieldNodesWithoutProperty(fieldNode, propertyName);
  fieldNode.selectionSet = graphqlAST.newSelectionSet([...existingFieldNodes, propertyFieldNode]);
  return propertyFieldNode;
}

function nodeName(node: MemberExpression | CallExpression) {
  if (node.type === "MemberExpression") return node.property.name;
  if (node.type === "CallExpression" && node.callee.type === "Identifier") return node.callee.name;
  return null;
}

// == Exports ==============================================================

export class GraphQLPathParser {
  path: NodePath<Node>;

  queryFieldNode: $Writeable<FieldNode>;

  dataIdentifier: string;

  parentFieldNode?: $Writeable<FieldNode>;

  constructor(path: NodePath<Node>, queryFieldNode: FieldNode, dataIdentifier: string) {
    this.path = path;
    this.queryFieldNode = queryFieldNode;
    this.dataIdentifier = dataIdentifier;
  }

  addNodes() {
    const ancestors = this.path.getAncestry();
    for (const ancestorPath of ancestors.slice(1)) {
      if (!ancestorPath.isMemberExpression() && !ancestorPath.isCallExpression()) continue;
      if (this.dataIdentifier === getParentPropertyName(ancestorPath.node)) {
        this.parentFieldNode = addFieldNodeForPathNode(ancestorPath, this.queryFieldNode);
      } else {
        if (!this.parentFieldNode) return;
        this.parentFieldNode = addFieldNodeForPathNode(ancestorPath, this.parentFieldNode);
      }
    }
  }
}
