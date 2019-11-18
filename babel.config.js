module.exports = (api) => {
  api.cache(true);
  return {
    presets: [["@babel/preset-env", { targets: { node: "current" } }], "@babel/preset-typescript"],
    plugins: [
      "@babel/plugin-proposal-optional-chaining",
      [
        "module-resolver",
        {
          alias: {},
          extensions: [".ts", ".tsx", ".js", ".jsx"],
        },
      ],
    ],
  };
};
