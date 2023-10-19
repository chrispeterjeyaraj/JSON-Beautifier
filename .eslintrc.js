module.exports = {
  root: true,
  env: {
    browser: true, // For web applications
    node: true, // For Node.js applications
    es6: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    // General Best Practices
    'no-console': 'off', // Allowing console.log for debugging
    'no-eval': 'error', // Avoid using eval
    'no-undef': 'error', // Disallow undeclared variables

    // Naming Conventions
    'consistent-this': ['error', 'self'], // Enforce a consistent variable name for 'this'

    // Formatting
    'brace-style': ['error', '1tbs', { allowSingleLine: true }], // Consistent brace style
    semi: ['error', 'always'], // Enforce the use of semicolons

    // Error Handling
    'no-throw-literal': 'error', // Avoid throwing literals or non-Errors

    // ES6 Features
    'arrow-parens': ['error', 'always'], // Require parentheses around arrow function parameters

    // Other
    'no-global-assign': 'error', // Disallow assignment to native objects or read-only global variables
    'no-redeclare': 'error', // Disallow variable redeclaration,
    // Add any other project-specific rules here

    // Prettier Integration
    'prettier/prettier': 'error',
  },
};
