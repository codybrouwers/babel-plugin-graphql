import jsx from "@babel/plugin-syntax-jsx";
import babelTypes, { isObjectPattern } from "@babel/types";
import { NodePath, Node } from "@babel/traverse";

interface IUseQueryObject {
  name?: string;
  queryName?: string;
}

interface IFieldType {
  __arguments?: {
    [key: string]: any;
  };
  __fields?: TQueryBuilderMap;
}

type TQueryBuilderMap = Map<string, IFieldType>;

const queryObject: TQueryBuilderMap = new Map([
  ["id", {}],
  ["name", {}],
  [
    "updatedAt",
    {
      __arguments: { last: 5 },
    },
  ],
  [
    "likes",
    {
      __arguments: { first: 5 },
      __fields: new Map([
        ["id", {}],
        ["likeUser", { __fields: new Map([["id", {}]]) }],
      ]),
    },
  ],
  [
    "user",
    {
      __fields: new Map([["thing", {}]]),
    },
  ],
]);

const USE_QUERY = "useQuery";
const DATA_PROPERTY = "data";

export default function({ types: t }: { types: typeof babelTypes }): PluginObj {
  const useQueryObject: IUseQueryObject = {};
  return {
    name: "babel-blade",
    inherits: jsx,
    visitor: {
      VariableDeclarator: (path) => {
        const { init, id } = path.node;

        if (!init) return;
        if (init.type !== "CallExpression") return;
        if (!t.isIdentifier(init.callee, { name: USE_QUERY })) return;

        const queryArg = init.arguments[0];
        if (t.isStringLiteral(queryArg)) {
          useQueryObject.queryName = queryArg.value;
        } else {
          throw new Error(
            "The first argument of useQuery must be a string specifying the graphql type the query is on."
          );
        }
        if (t.isIdentifier(id)) {
          // EXAMPLE: const result = useQuery("Movie");
          useQueryObject.name = id.name;
        } else if (isObjectPattern(id)) {
          // Find data property in destructured object and get alias name
          // EXAMPLE: const { data: dataAlias } = useQuery("Movie");
          id.properties.forEach((property) => {
            if (
              t.isObjectProperty(property) &&
              t.isIdentifier(property.key, { name: DATA_PROPERTY })
            ) {
              if (t.isIdentifier(property.value)) {
                useQueryObject.name = property.value.name;
              }
            }
          });
        }
        console.log("----useQueryObject", useQueryObject);
        if (!useQueryObject.name) return;

        function recursivelyBuildQueryMap(
          queryMap: TQueryBuilderMap,
          { parentPath }: NodePath<babelTypes.Node>
        ): TQueryBuilderMap {
          if (t.isMemberExpression(parentPath.node)) {
            const propertyName = parentPath.node.property.name;
            // console.log({
            //   propertyName,
            //   mapHasPropertyName: queryMap.has(propertyName),
            //   nestedParentPathIsMemberExpression: t.isMemberExpression(parentPath.parentPath.node),
            // });

            const value: IFieldType = {};
            if (t.isMemberExpression(parentPath.parentPath.node)) {
              const propertyMap = queryMap.get(propertyName)?.__fields || new Map();
              value.__fields = recursivelyBuildQueryMap(propertyMap, parentPath);
            }
            return queryMap.set(propertyName, value);
          }
          return queryMap;
        }

        const { scope } = path;
        const { referencePaths } = scope.bindings[useQueryObject.name];
        const queryBuilderMap = referencePaths.reduce(
          (queryBuilder: TQueryBuilderMap, referencePath) =>
            recursivelyBuildQueryMap(queryBuilder, referencePath),
          new Map()
        );

        console.log("--queryBuilderMap", queryBuilderMap.get("Movie"));
        console.log(getFunctionDeclaration(path, t));
      },
    },
  };
}

function buildTypeString(map: TQueryBuilderMap, nestedLevel = 0) {
  const entries = map.entries();
  let next = entries.next();
  let string = "";
  const indentation = "  ".repeat(nestedLevel);
  let hasParent = false;
  console.log({ hasParent, done: next.done, value: next.value });
  while (!next.done && next.value) {
    if (next.value[1].__fields) {
      hasParent = true;
      string += `\n${indentation}${next.value[0]} {${buildTypeString(
        next.value[1].__fields,
        nestedLevel + 1
      )}`;
    } else {
      string += `\n${indentation}${next.value[0]}`;
    }
    next = entries.next();
  }
  console.log({ hasParent, done: next.done, indentation, nestedLevel });
  if (next.done && hasParent) {
    return `${string}\n${indentation}}`;
  }
  return string;
}

function getFunctionDeclaration(
  path: NodePath<babelTypes.Node>,
  t: typeof babelTypes
): NodePath<babelTypes.Node> & babelTypes.FunctionDeclaration {
  return t.isFunctionDeclaration(path.parentPath)
    ? path.parentPath
    : getFunctionDeclaration(path.parentPath, t);
}
