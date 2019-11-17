export function getSimpleFragmentName(frag) {
  if (frag.type === "MemberExpression") return `${frag.object.name}${frag.property.name}`;
  if (frag.type === "Identifier") return frag.name;
  throw new Error(
    "unrecognized fragment type being passed to getSimpleFragmentName, please file an issue"
  );
}
