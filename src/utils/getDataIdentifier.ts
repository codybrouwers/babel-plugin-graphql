import babelTypes, { VariableDeclarator } from "@babel/types";

// == Types ================================================================

// == Constants ============================================================

const DATA_PROPERTY = "data";

// == Functions ============================================================

// == Exports ==============================================================

// TODO: Handle destructuring of data property in useQuery object pattern
// example: const { data: { id, name } } = useQuery("Movie");
// This would create multiple dataIdentifiers
export function getDataIdentifier(t: typeof babelTypes, { id }: VariableDeclarator) {
  // EXAMPLE: const result = useQuery("Movie");
  if (t.isIdentifier(id)) return id.name;
  if (!t.isObjectPattern(id)) return null;

  // Find data property in destructured object and get alias name
  // EXAMPLE: const { data: dataAlias } = useQuery("Movie");
  for (const property of id.properties) {
    if (t.isObjectProperty(property) && t.isIdentifier(property.key, { name: DATA_PROPERTY })) {
      if (t.isIdentifier(property.value)) {
        return property.value.name;
      }
    }
  }
  return null;
}
