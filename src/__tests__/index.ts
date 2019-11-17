import path from "path";
import pluginTester from "babel-plugin-tester";
import plugin from "../";

const projectRoot = path.join(__dirname, "../../");

expect.addSnapshotSerializer({
  print(val) {
    return val.split(projectRoot).join("<PROJECT_ROOT>/");
  },
  test(val) {
    return typeof val === "string";
  },
});

const fixture = (filename: string) => ({
  fixture: require.resolve(`./fixtures/${filename}`),
});

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: { filename: __filename },
  tests: {
    "basic test of functionality": fixture("basic"),
    // "exportable query": fixture("exportconstquery"),
    // "basic array map works": fixture("arraymap1"),
    // "array map destructuring arrow function works": fixture("arraymap2"),
    // "array map destructuring normal function works": fixture("arraymap3"),
    // "assignments and aliases work": fixture("assignment"),
    // "overlapping assignments work": fixture("assignment-overlapping"),
    // "destructuring work": fixture("destructuring"),
    // "docs: fields": fixture("fields"),
    // "docs: args": fixture("arguments"),
    // "docs: variables": fixture("queryVariables"),
    // "docs: directives": fixture("directives"),
    // "injection of fragments": fixture("fragment"),
  },
});
