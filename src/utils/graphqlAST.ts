import {
  ValueNode,
  FieldNode,
  ArgumentNode,
  DirectiveNode,
  Kind,
  SelectionNode,
  DocumentNode,
  SelectionSetNode,
} from "graphql";

// == Types ================================================================

// == Constants ============================================================

// == Functions ============================================================

function newFieldNode(
  name: string,
  {
    selectionNodes = [],
    argumentNodes = [],
    directiveNodes = [],
  }: {
    selectionNodes?: SelectionNode[];
    argumentNodes?: ArgumentNode[];
    directiveNodes?: DirectiveNode[];
  } = {}
): FieldNode {
  return {
    kind: Kind.FIELD,
    name: { kind: Kind.NAME, value: name },
    selectionSet: {
      kind: Kind.SELECTION_SET,
      selections: selectionNodes,
    },
    arguments: argumentNodes,
    directives: directiveNodes,
  };
}

function newArgumentNode(name: string, value: ValueNode): ArgumentNode {
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
function newDirectiveNode(name: string): DirectiveNode {
  return {
    kind: Kind.DIRECTIVE,
    name: { kind: Kind.NAME, value: name },
    // arguments: [],
  };
}

function newSelectionSet(selections: FieldNode[] = []) {
  return { kind: Kind.SELECTION_SET, selections };
}

/**
 *
 * @todo VariableDefinitions & directives
 */
function newDocumentNode(queryName: string, querySelections: SelectionNode[]): DocumentNode {
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

// == Exports ==============================================================

export default {
  newFieldNode,
  newArgumentNode,
  newDirectiveNode,
  newSelectionSet,
  newDocumentNode,
};
