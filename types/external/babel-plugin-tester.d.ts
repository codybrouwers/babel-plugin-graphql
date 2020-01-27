declare module "babel-plugin-tester" {
  import { PluginObj } from "@babel/core";
  import * as t from "@babel/types";

  interface IOptions {
    plugin: (options: { types: typeof t }) => PluginObj;
    fixtures?: string;
    tests?: {
      code: string;
      output: string;
    }[];
  }

  export default function pluginTester(options: IOptions): void;
}
