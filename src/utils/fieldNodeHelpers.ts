import * as t from "@babel/types";
import { Kind, FieldNode } from "graphql";
import { NodePath } from "@babel/core";
import { newGraphQLFieldNode, newGraphQLSelectionSet } from "./graphqlASTBuilders";

// == Types ================================================================

export type TParsableNodeTypes = t.MemberExpression | t.Identifier;

// == Constants ============================================================

// == Functions ============================================================

function findOrCreateFieldNode(fieldNode: FieldNode, propertyName: string) {
  const existingFieldNode = findFieldNode(fieldNode, propertyName);
  if (existingFieldNode) return existingFieldNode;

  return newGraphQLFieldNode(propertyName);
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

// == Exports ==============================================================

export function addFieldNodeForPathNode(
  path: NodePath<TParsableNodeTypes>,
  fieldNode: $Writeable<FieldNode>
): FieldNode {
  const { node } = path;
  const propertyName = getPropertyName(node);
  if (!propertyName) return fieldNode;

  const propertyFieldNode = findOrCreateFieldNode(fieldNode, propertyName);
  const existingFieldNodes = filterFieldNodesWithoutProperty(fieldNode, propertyName);
  fieldNode.selectionSet = newGraphQLSelectionSet([...existingFieldNodes, propertyFieldNode]);
  return propertyFieldNode;
}

export function addFieldNodeWithPropertyName(
  propertyName: string,
  fieldNode: $Writeable<FieldNode>
): FieldNode {
  if (!propertyName) return fieldNode;

  const propertyFieldNode = findOrCreateFieldNode(fieldNode, propertyName);
  const existingFieldNodes = filterFieldNodesWithoutProperty(fieldNode, propertyName);
  fieldNode.selectionSet = newGraphQLSelectionSet([...existingFieldNodes, propertyFieldNode]);
  return propertyFieldNode;
}

export function canParsePath(path: NodePath<t.Node>): path is NodePath<TParsableNodeTypes> {
  if (path.isIdentifier() && path.node.name === "data") return false;
  return path.isMemberExpression() || path.isIdentifier();
}

export function getPropertyName(node: TParsableNodeTypes): string | null {
  switch (node.type) {
    case "MemberExpression":
      return getPropertyName(node.property);
    case "Identifier":
      return node.name;
    default:
      return null;
  }
}
