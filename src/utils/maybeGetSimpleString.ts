export function maybeGetSimpleString(Literal) {
  if (Literal.type === "StringLiteral") return Literal.value;
  if (
    Literal.type === "TemplateLiteral" &&
    !Literal.expressions.length &&
    Literal.quasis.length === 1
  ) {
    return Literal.quasis[0].value.raw;
  }
  return null;
}
