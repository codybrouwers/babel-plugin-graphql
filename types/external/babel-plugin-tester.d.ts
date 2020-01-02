declare module "babel-plugin-tester" {
  import { PluginObj } from "@babel/core";
  import babelTypes from "@babel/types";

  interface IOptions {
    plugin: (options: { types: typeof babelTypes }) => PluginObj;
    fixtures?: string;
    tests?: {
      code: string;
      output: string;
    }[];
  }

  export default function pluginTester(options: IOptions): void;
}
