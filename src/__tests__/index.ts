import { transformSync } from "@babel/core";
import path from "path";
import pluginTester from "babel-plugin-tester";
import plugin from "../";

// const projectRoot = path.join(__dirname, "../../");

// expect.addSnapshotSerializer({
//   print(val) {
//     return val.split(projectRoot).join("<PROJECT_ROOT>/");
//   },
//   test(val) {
//     return typeof val === "string";
//   },
// });

// const fixture = (filename: string) => ({
//   fixture: require.resolve(`./fixtures/${filename}`),
// });

// pluginTester({
//   plugin,
//   snapshot: false,
//   babelOptions: { filename: __filename },
//   tests: {
//     "basic test of functionality": fixture("basic"),
//     // "exportable query": fixture("exportconstquery"),
//     // "basic array map works": fixture("arraymap1"),
//     // "array map destructuring arrow function works": fixture("arraymap2"),
//     // "array map destructuring normal function works": fixture("arraymap3"),
//     // "assignments and aliases work": fixture("assignment"),
//     // "overlapping assignments work": fixture("assignment-overlapping"),
//     // "destructuring work": fixture("destructuring"),
//     // "docs: fields": fixture("fields"),
//     // "docs: args": fixture("arguments"),
//     // "docs: variables": fixture("queryVariables"),
//     // "docs: directives": fixture("directives"),
//     // "injection of fragments": fixture("fragment"),
//   },
// });

it("handles nested properties", () => {
  var input = `
    function Movie() {
      const { data } = useQuery("GetMovie");

      return (
        <div>
          <p>{data.Movie.releaseDate}</p>
          <p>{data.Movie.director.id}</p>
          <p>{data.Movie.director.name}</p>
        </div>
      );
    }
    `;
  const { code } = transformSync(input, { filename: "./fixtures/basic.js", plugins: [plugin] });
  console.log(code);
});

// it("handles arguments", () => {
//   var input = `
//     function Movie() {
//       const { data } = useQuery("GetMovie");

//       return (
//         <div>
//           <p>{data.Movie.releaseDate({numberArg: 123, stringArg: "abc"}, "@preload")}</p>
//         </div>
//       );
//     }
//     `;
//   const { code } = transformSync(input, { filename: "./fixtures/basic.js", plugins: [plugin] });
//   console.log(code);
// });
