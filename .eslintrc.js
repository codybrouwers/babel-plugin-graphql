module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["babel", "promise", "jest", "import", "@typescript-eslint"],
  extends: [
    "airbnb-base",
    "eslint:recommended",
    "plugin:promise/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "prettier",
    "prettier/@typescript-eslint",
  ],
  env: {
    node: true,
    es6: true,
    "jest/globals": true,
  },
  settings: {
    "import/extensions": [".ts"],
  },
  rules: {
    "no-unused-vars": "off",
    "no-undef": "off", // TypeScript already warns on undefined variables
    "no-underscore-dangle": "off",
    "no-continue": "off",
    "no-param-reassign": "off",
    "prefer-const": "error",
    "no-return-await": "error",
    eqeqeq: "error",
    "eol-last": "error",
    "no-console": "error",
    "no-unexpected-multiline": "error",
    "object-shorthand": ["error", "always"],
    "eol-last": ["error", "always"],
    "comma-dangle": ["error", "only-multiline"],
    "max-len": [
      "error",
      {
        code: 100,
        ignoreUrls: true,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    // == eslint-config-airbnb-base===========================================================
    "no-restricted-syntax": [
      "error",
      {
        selector: "ForInStatement",
        message:
          "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
      },
      {
        selector: "LabeledStatement",
        message:
          "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
      },
      {
        selector: "WithStatement",
        message:
          "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
      },
    ],
    // == eslint-plugin-babel ================================================================
    "babel/quotes": [
      "error",
      "double",
      {
        allowTemplateLiterals: true,
      },
    ],
    "babel/no-invalid-this": "error",
    // == eslint-plugin-promise ==============================================================
    "promise/always-return": "off",
    // == @typescript-eslint/eslint-plugin ===================================================
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/camelcase": "off",
    // "@typescript-eslint/prefer-includes": "error", // Requires type information
    // "@typescript-eslint/await-thenable": "error", // Requires type information
    // "@typescript-eslint/no-unnecessary-type-assertion": "error", // Requires type information
    // "@typescript-eslint/restrict-plus-operands": "error", // Requires type information
    // "@typescript-eslint/prefer-regexp-exec": "error", // Requires type information
    "@typescript-eslint/generic-type-naming": "error",
    "@typescript-eslint/no-for-in-array": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/interface-name-prefix": ["error", "always"],
    // == eslint-plugin-import ===============================================================
    "import/no-extraneous-dependencies": "off",
    "import/prefer-default-export": "off",
    "import/no-cycle": "warn",
    "import/no-deprecated": "error",
    "import/no-duplicates": "error",
    "import/extensions": ["error", "ignorePackages", { ts: "never" }],
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "never",
      },
    ],
  },
};
