/* eslint-disable no-console */
import jsx from "@babel/plugin-syntax-jsx";
import { PluginObj } from "@babel/core";
import babelTypes from "@babel/types";
import { print } from "graphql";
import {
  isUseQuery,
  getQueryName,
  getQueryType,
  newGraphQLFieldNode,
  newGraphQLDocumentNode,
  replaceUseQueryArg,
} from "./utils";
import { Parser } from "./Parser";

export default function({ types: t }: { types: typeof babelTypes }): PluginObj {
  return {
    name: "graphql",
    inherits: jsx,
    visitor: {
      VariableDeclarator: (path) => {
        if (!isUseQuery(path.node)) return;

        const functionParentPath = path.getFunctionParent();
        const queryType = getQueryType(path);
        const queryName = getQueryName(functionParentPath, queryType);
        const querySelections = newGraphQLFieldNode(queryType);

        // TODO: Better error messaging for when these aren't present
        if (!queryName || !queryType) return;

        new Parser(path, querySelections, "USE_QUERY").parse();

        // GraphQL AST is done
        const documentNode = newGraphQLDocumentNode(queryName, [querySelections]);
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

        replaceUseQueryArg(path, queryNameConstant.name);
        functionParentPath.insertBefore(queryDeclaration);
      },
    },
  };
}
