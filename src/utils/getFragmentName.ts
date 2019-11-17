// potentially useful function from devon to extract a colocated fragment's name
export function getFragmentName(path) {
  if (
    path.parentPath.isAssignmentExpression() &&
    path.parent.left.type === "MemberExpression" &&
    path.parent.left.property.name === "fragment"
  ) {
    const { name } = path.parent.left.object;
    return `${name[0].toLowerCase() + name.slice(1)}Fragment`;
  }
  return null;
}
