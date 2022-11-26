import typescript from "@rollup/plugin-typescript";

const config = {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.esm.js",
      format: "es",
    },
    {
      file: "dist/index.umd.js",
      format: "umd",
      name: "JsonKit",
    },
  ],
  plugins: [typescript()],
};

export default config;
