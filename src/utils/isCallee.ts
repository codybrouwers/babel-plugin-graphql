export function isCallee(path) {
  const parent = path.parentPath;
  return parent.isCallExpression() && path.node === parent.node.callee;
}
