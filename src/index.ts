/* eslint-disable no-console */
import jsx from "@babel/plugin-syntax-jsx";
import { PluginObj } from "@babel/core";
import babelTypes, { MemberExpression, Node } from "@babel/types";
import { print, Kind, FieldNode } from "graphql";
import {
  isUseQuery,
  getDataIdentifier,
  getQueryName,
  getQueryType,
  graphqlAST,
  callExpressionArguments,
} from "./utils";

export default function({ types: t }: { types: typeof babelTypes }): PluginObj {
  return {
    name: "babel-plugin-graphql",
    inherits: jsx,
    visitor: {
      VariableDeclarator: (path) => {
        if (!isUseQuery(t, path.node)) return;

        const queryName = getQueryName(t, path);
        const queryType = getQueryType(t, path.node);
        const dataIdentifier = getDataIdentifier(t, path.node);

        // TODO: Better error messaging for when these aren't present
        if (!dataIdentifier || !queryName || !queryType) return;

        const querySelections = [queryType].map((parentType) => {
          const { referencePaths } = path.scope.bindings[dataIdentifier] || {};

          return referencePaths.reduce((queryFieldNode, referencePath) => {
            if (referencePath.node.type !== "Identifier") return queryFieldNode;
            if (referencePath.parent.type !== "MemberExpression") return queryFieldNode;

            const ancestors = referencePath.getAncestry();

            let parentFieldNode: FieldNode | undefined;
            for (const { node, parent } of ancestors.slice(1)) {
              if (!t.isMemberExpression(node)) continue;
              parentFieldNode = getFieldNodeForMemberExpressionPath(
                node,
                parent,
                dataIdentifier,
                queryFieldNode,
                parentFieldNode
              );
            }
            return queryFieldNode;
          }, graphqlAST.newFieldNode(parentType));
        });

        // console.log("--querySelections", querySelections);
        const documentNode = graphqlAST.newDocumentNode(queryName, querySelections);
        // console.log(JSON.stringify(documentNode, null, 2));
        console.log(print(documentNode));
      },
    },
  };
}

function getFieldNodeForMemberExpressionPath(
  node: MemberExpression,
  parent: Node,
  dataIdentifier: string,
  queryFieldNode: $Writeable<FieldNode>,
  parentFieldNode?: $Writeable<FieldNode>
): FieldNode {
  const propertyName = node.property.name;

  if (dataIdentifier === getParentPropertyName(node)) {
    const propertyFieldNode = findOrCreateFieldNode(queryFieldNode, propertyName, parent);
    const existingFieldNodes = fieldNodesWithoutProperty(queryFieldNode, propertyName);

    queryFieldNode.selectionSet = graphqlAST.newSelectionSet([
      ...existingFieldNodes,
      propertyFieldNode,
    ]);
    return propertyFieldNode;
  }

  if (!parentFieldNode) return graphqlAST.newFieldNode(propertyName);

  if (!parentFieldNode?.selectionSet) {
    const propertyFieldNode = graphqlAST.newFieldNode(
      propertyName,
      callExpressionArguments(parent)
    );
    parentFieldNode.selectionSet = graphqlAST.newSelectionSet([propertyFieldNode]);
    return propertyFieldNode;
  }

  const propertyFieldNode = findOrCreateFieldNode(parentFieldNode, propertyName, parent);
  const existingFieldNodes = fieldNodesWithoutProperty(parentFieldNode, propertyName);
  parentFieldNode.selectionSet.selections = [...existingFieldNodes, propertyFieldNode];
  return propertyFieldNode;
}

function findOrCreateFieldNode(fieldNode: FieldNode, propertyName: string, parent: Node) {
  return (
    fieldNode.selectionSet?.selections.find(
      (node): node is FieldNode => node.kind === Kind.FIELD && node.name.value === propertyName
    ) || graphqlAST.newFieldNode(propertyName, callExpressionArguments(parent))
  );
}

function fieldNodesWithoutProperty(fieldNode: FieldNode, propertyName: string) {
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
