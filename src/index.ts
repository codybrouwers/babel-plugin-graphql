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
} from "./utils";
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
        console.log(print(documentNode));
      },
    },
  };
}
