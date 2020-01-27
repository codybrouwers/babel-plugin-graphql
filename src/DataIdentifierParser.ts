import { Node } from "@babel/types";
import { FieldNode } from "graphql";
import { NodePath } from "@babel/core";
import { ReferencePathParser } from "./ReferencePathParser";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

export class DataIdentifierParser {
  path: NodePath<Node>;

  fieldNode: $Writeable<FieldNode>;

  dataIdentifier: string;

  constructor(path: NodePath<Node>, fieldNode: FieldNode, dataIdentifier: string) {
    this.path = path;
    this.fieldNode = fieldNode;
    this.dataIdentifier = dataIdentifier;
  }

  parse() {
    for (const referencePath of this.referencePaths()) {
      if (!referencePath.isIdentifier()) continue;
      if (!ReferencePathParser.canParse(referencePath.parentPath)) continue;

      new ReferencePathParser(referencePath, this.fieldNode, this.dataIdentifier).parse();
    }
  }

  private referencePaths() {
    return this.path.scope.bindings[this.dataIdentifier]?.referencePaths || {};
  }
}
