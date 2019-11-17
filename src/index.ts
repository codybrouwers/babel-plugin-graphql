import jsx from "@babel/plugin-syntax-jsx";
import { RazorData } from "./dataStructures";
import {
  isObject,
  isCallee,
  isUseQuery,
  isCreateFragment,
  getAssignTarget,
  getCalleeArgs,
  maybeGetSimpleString,
  getSimpleFragmentName,
} from "./utils";
import { semanticTrace } from "./semanticTrace";

/** **
 *
 * Discussion of babel strategy
 *
 * at the top level we give users createQuery and createFragment methods.
 * when these are called and assigned, whatever identifier they get assigned to becomes a "razor".
 *
 * the strategy is
 *
 * - declare an `aliasReplaceQueue` which is a `Map()`
 * - semanticTraverse entire AST
 *   - read into datastructure
 *   - where renaming will be needed, push the node into `aliasReplaceQueue`
 * - inject graphql
 * - `aliasReplaceQueue.forEach` and rename
 *
 * LHS cases to handle:
 * - const var1 = DATA
 * - const { var2 } = DATA
 * - const { var3, var4 } = DATA
 * - const { var5: var6  } = DATA
 * - const { var7: { var8: var9} } = DATA
 *
 * interaction cases to handle:
 * - const var1 = DATA.v2
 * - const { var2 } = DATA.v2
 * - const { var3, var4 } = DATA.v2
 * - const { var5: var6  } = DATA.v2
 * - const { var7: { var8: var9} } = DATA.v2
 *
 * RHS cases
 * - const var1 = DATA.v3
 * - const var2 = DATA.v3.var3
 * - const var4 = DATA.v3.var5
 * - const var6 = DATA.v3({ foo: 1, bar: 2})
 * - const var7 = DATA.v3({ foo: 3, bar: 4}).var8
 * - DATA.v3.var8 // no assignment!
 *
 * Array methods
 * - const var2 = DATA.v3.var3[0].foo
 * - DATA.foo.map(bar => bar.baz)
 * - DATA.foo.map(({bar}) => bar.baz)
 * - DATA.foo.map(function ({bar}) {bar.baz})
 *
 * */

export default function(babel) {
  const { types, version } = babel;

  return {
    name: "babel-blade",
    inherits: jsx,
    visitor: {
      Identifier(path) {
        handleCreateRazor(path, types);
      },
    },
  };
}

export function handleCreateRazor(path, types) {
  if (isUseQuery(path)) {
    // get the identifier and available args
    const identifier = getAssignTarget(path);
    console.log("---------identifier", identifier);

    let queryArgs;
    if (isCallee(path)) queryArgs = getCalleeArgs(path);
    // traverse scope for identifier references
    const refs = path.scope.bindings[identifier].referencePaths;
    console.log("---refs", refs);
    // clear the reference
    const razorParentPath = path.findParent((ppath) => ppath.isVariableDeclaration());
    if (!razorParentPath.parentPath.isExportNamedDeclaration()) {
      razorParentPath.remove(); // remove it unless its exported :)
    }
    // create the queue - we will defer alias replacement til all semantic traversals are done
    const aliasReplaceQueue = new Map();
    if (refs.length > 0) {
      let razorID = null;
      if (isCreateFragment(path) && !queryArgs[0])
        throw new Error(
          "createFragment must have one argument to specify the graphql type they are on"
        );
      const fragmentType = isCreateFragment(path) && maybeGetSimpleString(queryArgs[0]); // getFragmentName(path)
      const queryType = isCreateFragment(path) ? "fragment" : "query";
      const razorData = new RazorData({
        type: queryType,
        name: isCreateFragment(path) ? types.Identifier(identifier) : identifier,
        fragmentType,
        args: isCreateQuery(path) && queryArgs,
      });

      function idempotentAddToRazorData(semPath) {
        let currentRazor = razorData;
        semPath.forEach(([name, ref]) => {
          let aliasPath;
          let calleeArguments;
          if (isCallee(ref)) {
            // if its a callee, extract its args and push it into RHS
            // will parse out fragments/args/directives later
            calleeArguments = getCalleeArgs(ref);
            aliasPath = ref;
          }
          const args = [];
          const fragments = [];
          const directives = [];

          if (calleeArguments) {
            for (const x of calleeArguments) {
              if (x.type === "StringLiteral" || x.type === "TemplateLiteral") {
                // its an arg or a directive; peek at first character to decide
                const peek = x.quasis ? x.quasis[0].value.raw[0] : x.value[0];
                peek === "@" ? directives.push(x) : args.push(x);
              } else {
                // its a fragment
                fragments.push(x);
              }
            }
          }
          // const mockRazorToGetAlias = new BladeData({name, args}) // this is hacky, i know; a result of the datastructures being legacy
          /* console.log('b4',{name,
                           args: args.length && args[0].value,
                           currentRazor: [...currentRazor._children],
                           razorData: [...razorData._children],
                          }) */
          currentRazor = currentRazor.add({
            name,
            args,
            directives,
            fragments,
          });
          /* console.log('aftr',{
                           currentRazor: [...currentRazor._children],
                           razorData: [...razorData._children],
                          }) */
          if (currentRazor._args && aliasPath) {
            aliasReplaceQueue.set(aliasPath, currentRazor);
          }
        });
      }

      refs.forEach((razor) => {
        // define visitor
        const semanticVisitor = {
          CallExpression(...args) {
            // const [hand, ref, semPath, ...rest] = args
            const [, ref] = args;
            const callee = ref.get("callee");
            // console.log('CallExpression', hand, semPath, ref,callee)
            ref.replaceWith(callee);
          },
          Identifier(...args) {
            // const [hand, ref, semPath, ...rest] = args
            const [hand, , semPath] = args;
            // console.log("Identifier", hand, semPath, ref);
            if (hand === "origin") idempotentAddToRazorData(semPath);
          },
          MemberExpression(...topargs) {
            // const [hand, ref, semPath, ...rest] = topargs
            const [, , semPath] = topargs;
            // console.log('MemberExpression', hand, semPath, ref)
            idempotentAddToRazorData(semPath);
          },
          /*
          default(...args){
            console.log('[debugging callback]', ...args)
          },
          */
        };
        // go through all razors
        if (isCallee(razor)) {
          // we have been activated! time to make a blade!
          razorID = getAssignTarget(razor);
          // clear the reference
          if (razor.container.arguments[0])
            razor.parentPath.replaceWith(razor.container.arguments[0]);
          else razor.parentPath.remove();
          // extract data
          semanticTrace(razor, razorID, semanticVisitor);
        }
      });
      // insert query
      refs.forEach((razor) => {
        if (!isObject(razor)) {
          const { stringAccumulator, litAccumulator } = razorData.print();
          const graphqlOutput = types.templateLiteral(
            stringAccumulator.map((str) => types.templateElement({ raw: str, cooked: str })),
            litAccumulator.map((lit) => {
              if (litypes.isFragment) {
                // we tagged this inside BladeData
                return types.callExpression(lit, [types.stringLiteral(getSimpleFragmentName(lit))]);
              }
              return lit || types.nullLiteral();
            })
          );

          if (razor.isExportNamedDeclaration()) {
            // allow 1 export
            const decs = razor.get("declaration").get("declarations");
            if (decs.length > 1)
              throw new Error(
                "detected multiple export declarations in one line, you are restricted to 1 for now"
              );
            razor = decs[0].get("init"); // mutate razor to get ready for replacement
          }
          if (razorData._type === "fragment") {
            razor.replaceWith(
              types.arrowFunctionExpression([types.identifier(identifier)], graphqlOutput)
            );
          } else {
            razor.replaceWith(graphqlOutput);
          }
        }
      });
    }
    aliasReplaceQueue.forEach((currentRazor, aliasPath) => {
      if (currentRazor._alias) {
        aliasPath.parentPath.replaceWith(aliasPath);
        aliasPath.node.property.name = currentRazor._alias;
      }
    });
  }
}
