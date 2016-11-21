/**
 * GreeneLab JavaScript ESLint rules, extends from Google coding guide at:
 * https://github.com/google/eslint-config-google/index.js (commit 0037169)
 * (renamed to "eslint.google.js").
 */

module.exports = {
  extends: './eslint.google.js',

  globals: {
    angular: true,
    d3: true
  },

  // Customized rules.
  // Possible values of Rule ID are:
  //   0: 'off'; 1: 'warn'; 2: 'error'
  // More details at:
  //   http://eslint.org/docs/user-guide/configuring#configuring-rules
  // gNNN: Line number of the same option in ./eslint.google.js
  rules: {
    'curly': 2,                   // (g080) Always use curly braces.
    'eqeqeq': [2, 'always'],      // (g085) Never allows '==' or '!=' operators.
    'comma-dangle': [2, 'never'], // (g184) Never allows trailing comma.
    'indent': [2, 2],             // (g197) Indentation: always 2 spaces.
    'keyword-spacing': 2,         // (g201) Space before and after keyword.
    'one-var': 0,                 // (g248) Allows "var x, y;".
    'space-in-parens': 2,         // (g271) No spaces after '(' or before ')'.
    'space-infix-ops': 2,         // (g272) Space needed around infix operator.
    'no-var': 0                   // (g300) Allows "var" declaration.
  }
};
