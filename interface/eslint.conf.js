/**
 * GreeneLab JavaScript ESLint rules, extends from Google coding guide at:
 * https://github.com/google/eslint-config-google/index.js (commit 40e3b15)
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
    'curly': 2,                   // (g081) Always use curly braces.
    'eqeqeq': [2, 'always'],      // (g086) Never allows '==' or '!=' operators.
    'comma-dangle': [2, 'never'], // (g185) Never allows trailing comma.
    'indent': [2, 2],             // (g197) Indentation: always 2 spaces.
    'keyword-spacing': 2,         // (g201) Space before and after keyword.
    'one-var': 0,                 // (g248) Allows "var x, y;".
    'no-var': 0                   // (g300) Allows "var" declaration.
  }
};
