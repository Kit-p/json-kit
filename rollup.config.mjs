import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const config = {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.esm.mjs",
      format: "es",
    },
    {
      file: "dist/index.umd.cjs",
      format: "umd",
      name: "window",
      extend: true,
    },
  ],
  plugins: [
    typescript(),
    commonjs({ include: /node_modules/ }),
    nodeResolve({ browser: true, preferBuiltins: false }),
  ],
};

export default config;
