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
};

export default config;
