/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  transform: { "^.+\\.tsx?$": ["@swc/jest", {}] },
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  setupFiles: ["<rootDir>/__tests__/setup.ts"],
};
module.exports = config;
