export function getObjectPropertyName(path) {
  return path.container.property ? path.container.property.name : undefined;
}
