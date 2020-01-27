/* eslint-disable no-console */
import jsx from "@babel/plugin-syntax-jsx";
import { PluginObj } from "@babel/core";
import babelTypes from "@babel/types";
import { print } from "graphql";
import {
  isUseQuery,
  getDataIdentifiers,
  getQueryName,
  getQueryType,
  graphqlAST,
  replaceUseQueryArg,
} from "./utils";
import { DataIdentifierParser } from "./DataIdentifierParser";

export default function({ types: t }: { types: typeof babelTypes }): PluginObj {
  return {
    name: "graphql",
    inherits: jsx,
    visitor: {
      VariableDeclarator: (path) => {
        if (!isUseQuery(t, path.node)) return;

        const functionParentPath = path.getFunctionParent();
        const queryType = getQueryType(path);
        const queryName = getQueryName(functionParentPath, queryType);
        const querySelections = graphqlAST.newFieldNode(queryType);
        const dataIdentifiers = getDataIdentifiers(path, querySelections);

        // TODO: Better error messaging for when these aren't present
        if (Object.keys(dataIdentifiers).length === 0 || !queryName || !queryType) return;

        for (const [identifier, fieldNode] of Object.entries(dataIdentifiers)) {
          new DataIdentifierParser(path, fieldNode, identifier).parse();
        }

        // GraphQL AST is done
        const documentNode = graphqlAST.newDocumentNode(queryName, [querySelections]);
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
