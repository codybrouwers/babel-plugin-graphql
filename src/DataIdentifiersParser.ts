import * as t from "@babel/types";
import { FieldNode } from "graphql";
import { NodePath } from "@babel/core";
import { addFieldNodeWithPropertyName, getPropertyName } from "./utils";

// == Types ================================================================

interface IDataIdentifiers {
  [identifier: string]: {
    fieldNode: FieldNode;
    isTopLevel?: boolean;
  };
}

type TTypes = "USE_QUERY" | "USE_FRAGMENT" | null;

// == Constants ============================================================

const USE_QUERY_DATA_PROPERTY = "data";

// == Functions ============================================================

// == Exports ==============================================================

export class DataIdentifiersParser {
  path: NodePath<t.Node>;

  fieldNode: $Writeable<FieldNode>;

  type: TTypes;

  dataIdentifiers: IDataIdentifiers = {};

  constructor(path: NodePath<t.Node>, fieldNode: FieldNode, type: TTypes = null) {
    this.path = path;
    this.fieldNode = fieldNode;
    this.type = type;
  }

  parse(): IDataIdentifiers {
    if (!this.path.isVariableDeclarator()) return {};

    const { id } = this.path.node;
    // TODO: Handle when ID is an identifier
    if (!t.isObjectPattern(id)) return {};

    // Find data property in destructured object and get alias name
    // EXAMPLE: const { data: dataAlias } = useQuery("Movie");
    const dataIdentifiers: IDataIdentifiers = {};
    for (const property of id.properties) {
      // TODO: When property is a rest element
      if (!t.isObjectProperty(property)) continue;
      if (!t.isIdentifier(property.key, this.nameFilter())) continue;

      switch (property.value.type) {
        case "Identifier":
          dataIdentifiers[property.value.name] = {
            fieldNode: this.fieldNode,
            isTopLevel: this.isTopLevel(),
          };
          break;
        case "ObjectPattern":
          if (!this.isTopLevel()) {
            const propertyName = getPropertyName(property.key);
            if (!propertyName) continue;

            const newFieldNode = addFieldNodeWithPropertyName(propertyName, this.fieldNode);
            dataIdentifiers[propertyName] = { fieldNode: newFieldNode };
            this.parseNestedObjects(property.value, dataIdentifiers, newFieldNode);
          } else {
            this.parseNestedObjects(property.value, dataIdentifiers);
          }
          break;
        default:
          break;
      }
    }
    return dataIdentifiers;
  }

  private nameFilter() {
    return this.type === "USE_QUERY" ? { name: USE_QUERY_DATA_PROPERTY } : undefined;
  }

  private isTopLevel() {
    return this.type === "USE_QUERY";
  }

  private parseNestedObjects(
    node: t.ObjectPattern,
    dataIdentifiers: IDataIdentifiers,
    fieldNode = this.fieldNode
  ) {
    const { properties } = node;
    for (const property of properties) {
      if (!t.isObjectProperty(property)) continue;

      if (property.shorthand && t.isIdentifier(property.value)) {
        const propertyName = getPropertyName(property.value);
        if (!propertyName) continue;

        const newFieldNode = addFieldNodeWithPropertyName(propertyName, fieldNode);
        dataIdentifiers[propertyName] = { fieldNode: newFieldNode };
      } else if (t.isObjectPattern(property.value) && t.isIdentifier(property.key)) {
        const propertyName = getPropertyName(property.key);
        if (!propertyName) continue;

        const newFieldNode = addFieldNodeWithPropertyName(propertyName, fieldNode);
        this.parseNestedObjects(property.value, dataIdentifiers, newFieldNode);
      }
    }
  }
}
