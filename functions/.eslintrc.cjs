module.exports = {
  env: {
    es6: true,
    node: true, // Ensure this is present
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module", // If using ES Modules
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", { "allowTemplateLiterals": true }],
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {
    process: "readonly", // Add this line
  },
};
