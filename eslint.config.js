export default [
  {
    files: ["backend/**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "script",
    },
    env: {
      node: true,
      commonjs: true,
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-undef": "error",
      "no-console": "warn",
      "eqeqeq": ["error", "always"],
      "curly": "error",
    },
  },
];
