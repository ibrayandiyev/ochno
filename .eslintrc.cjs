// https://eslint.org/docs/user-guide/configuring

module.exports = {
  extends: [
    'airbnb-base',
    'plugin:vue/vue3-recommended',
  ],
  plugins: [
    'vue',
  ],
  rules: {
    'default-param-last': 'off',
    'import/prefer-default-export': 'off',
    'max-len': 'off',
    'no-multiple-empty-lines': [
      'error',
      { max: 2, maxEOF: 0 },
    ],
    'no-plusplus': [
      'error',
      { allowForLoopAfterthoughts: true },
    ],
    'no-underscore-dangle': [
      'error',
      { allow: ['_id', '$_'] },
    ],
    'object-curly-newline': 'off',
    'prefer-destructuring': 'off',

    'vue/max-attributes-per-line': ['error', {
      'singleline': {
        'max': 5,
      },
      'multiline': {
        'max': 1,
      },
    }],
    'vue/multi-word-component-names': 'off',
    'vue/multiline-html-element-content': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/require-default-prop': 'off',
    'vue/singleline-html-element-content-newline': 'off',
  },
};
