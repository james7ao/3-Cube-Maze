const base = require('./index.js');

module.exports = {
  ...base,
  extends: [...base.extends, 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  parserOptions: {
    ...base.parserOptions,
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    ...base.rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
