export function getAssignTarget(path) {
  return path.parentPath.container.id ? path.parentPath.container.id.name : undefined;
}
