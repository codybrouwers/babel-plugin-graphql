import * as t from "@babel/types";
import { FieldNode } from "graphql";
import { NodePath } from "@babel/core";
import { ReferencePathParser } from "./ReferencePathParser";
import { DataIdentifiersParser } from "./DataIdentifiersParser";

// == Types ================================================================

interface IDataIdentifiers {
  [identifier: string]: FieldNode;
}

type TTypes = "USE_QUERY" | "USE_FRAGMENT" | null;

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

export class Parser {
  path: NodePath<t.Node>;

  fieldNode: $Writeable<FieldNode>;

  type: TTypes;

  dataIdentifiers: IDataIdentifiers = {};

  constructor(path: NodePath<t.Node>, fieldNode: FieldNode, type: TTypes = null) {
    this.path = path;
    this.fieldNode = fieldNode;
    this.type = type;
  }

  parse() {
    const dataIdentifiers = new DataIdentifiersParser(this.path, this.fieldNode, this.type).parse();
    for (const [dataIdentifier, { fieldNode, isTopLevel }] of Object.entries(dataIdentifiers)) {
      for (const referencePath of this.referencePaths(dataIdentifier)) {
        if (!referencePath.isIdentifier()) continue;

        new ReferencePathParser(referencePath, fieldNode, dataIdentifier, isTopLevel).parse();
      }
    }
  }

  private referencePaths(dataIdentifier: string) {
    return this.path.scope.bindings[dataIdentifier]?.referencePaths || [];
  }
}
