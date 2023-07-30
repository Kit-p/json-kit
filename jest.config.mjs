const config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["test"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.(c|m)?(t|j)sx?$": ["@swc/jest"],
  },
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

export default config;
