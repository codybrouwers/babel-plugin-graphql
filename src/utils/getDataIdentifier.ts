import babelTypes, { VariableDeclarator } from "@babel/types";

// == Types ================================================================

// == Constants ============================================================

const DATA_PROPERTY = "data";

// == Functions ============================================================

// == Exports ==============================================================

/**
 * Returns data or aliased data identifier used with useQuery.
 * Currently only allows destructuring the useQuery value:
 * @example
 * const { data } = useQuery("Movie");
 *
 * @todo Handle destructuring of data property in useQuery object pattern.
 * This would create multiple dataIdentifiers
 * @example const { data: { id, name } } = useQuery("Movie");
 *
 * @todo Track identifier's data property
 * @example
 * const result = useQuery("Movie");
 * ...
 * result.data.id
 * // or
 * const movie = result.data
 * movie.id
 */
export function getDataIdentifier(t: typeof babelTypes, { id }: VariableDeclarator) {
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
