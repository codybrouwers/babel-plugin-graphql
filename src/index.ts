/* eslint-disable no-console */
import jsx from "@babel/plugin-syntax-jsx";
import { PluginObj } from "@babel/core";
import template from "@babel/template";
import babelTypes, { templateElement } from "@babel/types";
import { print } from "graphql";
import { isUseQuery, getDataIdentifier, getQueryName, getQueryType, graphqlAST } from "./utils";
import { GraphQLPathParser } from "./GraphQLPathParser";

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

            const parser = new GraphQLPathParser(referencePath, queryFieldNode, dataIdentifier);
            parser.addNodes();
            return parser.queryFieldNode;
          }, graphqlAST.newFieldNode(parentType));
        });

        // console.log("--querySelections", querySelections);
        const documentNode = graphqlAST.newDocumentNode(queryName, querySelections);
        // console.log(JSON.stringify(documentNode, null, 2));
        const printedQuery = print(documentNode);
        // console.log(printedQuery);

        const queryTemplate = template`
          COMPONENT_NAME = gqlQUERY;
        `;

        // const ast = babelTypes.templateLiteral(
        //   [babelTypes.templateElement("/user", false), babelTypes.templateElement("", true)],
        //   [babelTypes.identifier("id")]
        // );
        const templateExpression = t.taggedTemplateExpression(
          t.identifier("gql"),
          t.templateLiteral(
            [t.templateElement({ raw: printedQuery, cooked: printedQuery }, false)],
            []
          )
        );
        const queryDeclaration = t.variableDeclaration("const", [
          t.variableDeclarator(t.identifier("MOVIE_QUERY"), templateExpression),
        ]);
        // console.log(thing);
        // const queryAST = queryTemplate({
        //   COMPONENT_NAME: t.identifier("MOVIE_QUERY"),
        //   QUERY: t.templateElement({ raw: printedQuery, cooked: printedQuery }),
        // });
        // console.log(queryAST);
        const parent = path.getFunctionParent();
        parent.insertBefore(queryDeclaration);
      },
    },
  };
}
