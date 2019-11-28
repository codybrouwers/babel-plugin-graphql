import { MemberExpression, Node } from "@babel/types";
import { Kind, FieldNode } from "graphql";
import { NodePath } from "@babel/core";
import { graphqlAST, callExpressionArguments } from "./utils";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

function findOrCreateFieldNode(fieldNode: FieldNode, propertyName: string, parent: Node) {
  return (
    findFieldNode(fieldNode, propertyName) ||
    graphqlAST.newFieldNode(propertyName, callExpressionArguments(parent))
  );
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

function getParentPropertyName({ object }: MemberExpression): string | null {
  switch (object.type) {
    case "Identifier":
      return object.name;
    case "MemberExpression":
      return object.property.name;
    default:
      return null;
  }
}

function addFieldNodeForPathNode(
  node: MemberExpression,
  parent: Node,
  fieldNode: $Writeable<FieldNode>
): FieldNode {
  const propertyName = node.property.name;
  const propertyFieldNode = findOrCreateFieldNode(fieldNode, propertyName, parent);
  const existingFieldNodes = filterFieldNodesWithoutProperty(fieldNode, propertyName);

  fieldNode.selectionSet = graphqlAST.newSelectionSet([...existingFieldNodes, propertyFieldNode]);
  return propertyFieldNode;
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
    for (const { node, parent } of ancestors.slice(1)) {
      if (node.type !== "MemberExpression") continue;

      if (this.dataIdentifier === getParentPropertyName(node)) {
        this.parentFieldNode = addFieldNodeForPathNode(node, parent, this.queryFieldNode);
      } else {
        if (!this.parentFieldNode) return;
        this.parentFieldNode = addFieldNodeForPathNode(node, parent, this.parentFieldNode);
      }
    }
  }
}
