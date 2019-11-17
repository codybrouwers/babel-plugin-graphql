import { createMacro } from "babel-plugin-macros";
import { handleCreateRazor } from "./index";

module.exports = createMacro(bladeMacros);

function bladeMacros({ references, babel: { types: t } }) {
  const { useQuery } = references;

  [...createFragment, ...createQuery].forEach((referencePath) =>
    handleCreateRazor(referencePath, t)
  );
}
