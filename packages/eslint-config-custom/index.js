module.exports = {
  extends: [
    "next",
    "turbo",
    "prettier",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json", "./*/tsconfig.json"]
  },
  plugins: ["jsx-a11y"],
  rules: {
    "no-console": "warn",
    "object-curly-spacing": ["error", "always"],
    "key-spacing": ["error", { "beforeColon": false }],
    "space-infix-ops": ["error", { "int32Hint": false }],
    "@typescript-eslint/no-floating-promises": ["error"],
    "no-warning-comments": [
      "warn",
      { "terms": ["todo"], "location": "anywhere" }
    ],
    "react/no-unescaped-entities": "off",
    "semi": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
  },
  globals: {
    "JSX": "readonly"
  },
  ignorePatterns: [
    "generated.ts",
    "next.config.js",
    "next-i18next.config.js",
    "public/*"
  ]
}


