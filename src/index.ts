/* eslint-disable no-console */
import jsx from "@babel/plugin-syntax-jsx";
import { PluginObj } from "@babel/core";
import babelTypes from "@babel/types";
import { print } from "graphql";
import {
  isUseQuery,
  getDataIdentifier,
  getQueryName,
  getQueryType,
  graphqlAST,
  replaceUseQueryArg,
} from "./utils";
import { GraphQLPathParser } from "./GraphQLPathParser";

export default function({ types: t }: { types: typeof babelTypes }): PluginObj {
  return {
    inherits: jsx,
    visitor: {
      VariableDeclarator: (path) => {
        if (!isUseQuery(t, path.node)) return;

        const functionParentPath = path.getFunctionParent();
        const queryType = getQueryType(t, path);
        const queryName = getQueryName(t, functionParentPath, queryType);
        const dataIdentifier = getDataIdentifier(t, path.node);

        // TODO: Better error messaging for when these aren't present
        if (!dataIdentifier || !queryName || !queryType) return;

        const querySelections = [queryType].map((parentType) => {
          const { referencePaths } = path.scope.bindings[dataIdentifier] || {};
          return referencePaths.reduce((queryFieldNode, referencePath) => {
            if (referencePath.node.type !== "Identifier") return queryFieldNode;
            if (referencePath.parent.type !== "MemberExpression") return queryFieldNode;

            const parser = new GraphQLPathParser(referencePath, queryFieldNode, dataIdentifier);
            parser.addNodes();
            return parser.queryFieldNode;
          }, graphqlAST.newFieldNode(parentType));
        });

        const documentNode = graphqlAST.newDocumentNode(queryName, querySelections);
        const printedQuery = print(documentNode);

        const templateExpression = t.taggedTemplateExpression(
          t.identifier("gql"),
          t.templateLiteral(
            [t.templateElement({ raw: printedQuery, cooked: printedQuery }, false)],
            []
          )
        );

        const queryNameConstant = path.scope.generateUidIdentifier(queryName.toUpperCase());
        const queryDeclaration = t.variableDeclaration("const", [
          t.variableDeclarator(queryNameConstant, templateExpression),
        ]);

        replaceUseQueryArg(t, path, queryNameConstant.name);
        functionParentPath.insertBefore(queryDeclaration);
      },
    },
  };
}
