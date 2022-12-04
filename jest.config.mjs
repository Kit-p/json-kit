const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["test"],
  transform: {
    "^.+\\.(c|m)?(t|j)sx?$": ["@swc/jest"],
  },
};

export default config;
