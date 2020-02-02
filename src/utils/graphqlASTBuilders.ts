import {
  ValueNode,
  FieldNode,
  ArgumentNode,
  DirectiveNode,
  Kind,
  SelectionNode,
  DocumentNode,
} from "graphql";

// == Types ================================================================

export interface INewFieldNodeOptions {
  aliasName?: string;
  selectionNodes?: SelectionNode[];
  argumentNodes?: ArgumentNode[];
  directiveNodes?: DirectiveNode[];
}

// == Constants ============================================================

// == Functions ============================================================

// == Exports ==============================================================

export function newGraphQLFieldNode(
  name: string,
  {
    aliasName = undefined,
    selectionNodes = [],
    argumentNodes = [],
    directiveNodes = [],
  }: INewFieldNodeOptions = {}
): FieldNode {
  return {
    kind: Kind.FIELD,
    name: { kind: Kind.NAME, value: name },
    alias: aliasName ? { kind: Kind.NAME, value: aliasName } : undefined,
    selectionSet: {
      kind: Kind.SELECTION_SET,
      selections: selectionNodes,
    },
    arguments: argumentNodes,
    directives: directiveNodes,
  };
}

export function newGraphQLArgumentNode(name: string, value: ValueNode): ArgumentNode {
  return {
    kind: Kind.ARGUMENT,
    name: {
      kind: Kind.NAME,
      value: name,
    },
    value,
  };
}

/**
 * @todo Directive arguments
 */
export function newGraphQLDirectiveNode(name: string): DirectiveNode {
  return {
    kind: Kind.DIRECTIVE,
    name: { kind: Kind.NAME, value: name },
    // arguments: [],
  };
}

export function newGraphQLSelectionSet(selections: FieldNode[] = []) {
  return { kind: Kind.SELECTION_SET, selections };
}

/**
 *
 * @todo VariableDefinitions & directives
 */
export function newGraphQLDocumentNode(
  queryName: string,
  querySelections: SelectionNode[]
): DocumentNode {
  return {
    kind: Kind.DOCUMENT,
    definitions: [
      {
        kind: Kind.OPERATION_DEFINITION,
        operation: "query" as const,
        name: {
          kind: Kind.NAME,
          value: queryName,
        },
        selectionSet: {
          kind: Kind.SELECTION_SET,
          selections: querySelections,
        },
        variableDefinitions: [],
        directives: [],
      },
    ],
  };
}
