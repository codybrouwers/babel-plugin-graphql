/* eslint-disable no-console */
import jsx from "@babel/plugin-syntax-jsx";
import { PluginObj, NodePath } from "@babel/core";
import babelTypes, { MemberExpression } from "@babel/types";
import { print, Kind, SelectionNode, FieldNode } from "graphql";
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

          return referencePaths.reduce((fieldNode, referencePath) => {
            if (referencePath.node.type !== "Identifier") return fieldNode;
            if (referencePath.parent.type !== "MemberExpression") return fieldNode;

            const ancestors = referencePath.getAncestry();
            const memberExpressionAncestors = ancestors
              .slice(1)
              .filter((ancestor) => ancestor.node.type === "MemberExpression");

            let parentFieldNode: SelectionNode | undefined;
            for (const ancestorPath of memberExpressionAncestors) {
              const parentPropertyName =
                ancestorPath.node.object?.property?.name || ancestorPath.node?.object?.name;
              const propertyName = ancestorPath.node.property.name;
              const argumentsAndDirectives = callExpressionArguments(ancestorPath.parent);

              if (dataIdentifier === parentPropertyName) {
                const propertyFieldNode =
                  fieldNode.selectionSet?.selections.find(
                    (node) => node.kind === Kind.FIELD && node.name.value === propertyName
                  ) || graphqlAST.newFieldNode(propertyName, argumentsAndDirectives);
                const existingFieldNodes =
                  fieldNode.selectionSet?.selections.filter(
                    (node) => node.kind === Kind.FIELD && node.name.value !== propertyName
                  ) || [];
                if (!fieldNode.selectionSet) {
                  fieldNode.selectionSet = graphqlAST.newSelectionSet([propertyFieldNode]);
                } else {
                  fieldNode.selectionSet.selections = [...existingFieldNodes, propertyFieldNode];
                }
                parentFieldNode = propertyFieldNode;
                continue;
                // -------------
              } else if (!parentFieldNode?.selectionSet) {
                const propertyFieldNode = graphqlAST.newFieldNode(
                  propertyName,
                  argumentsAndDirectives
                );
                parentFieldNode.selectionSet = graphqlAST.newSelectionSet([propertyFieldNode]);
                parentFieldNode = propertyFieldNode;
                // -------------
              } else {
                const propertyFieldNode =
                  parentFieldNode.selectionSet.selections.find(
                    (node) => node.kind === Kind.FIELD && node.name.value === propertyName
                  ) || graphqlAST.newFieldNode(propertyName, argumentsAndDirectives);
                const existingFieldNodes = parentFieldNode.selectionSet.selections.filter(
                  (node) => node.kind === Kind.FIELD && node.name.value !== propertyName
                );
                parentFieldNode.selectionSet.selections = [
                  ...existingFieldNodes,
                  propertyFieldNode,
                ];
                parentFieldNode = propertyFieldNode;
              }
            }
            return fieldNode;
          }, graphqlAST.newFieldNode(parentType));
        });

        // console.log("--querySelections", querySelections);
        const documentNode = graphqlAST.newDocumentNode(queryName, querySelections);

        // console.log(JSON.stringify(AST, null, 2));
        console.log(print(documentNode));
      },
    },
  };
}
