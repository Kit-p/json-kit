<h1 align="center">json-kit</h1>

<div align="center">
  <a href="https://github.com/semantic-release/semantic-release">
    <img
      src="https://img.shields.io/badge/semantic--release-conventionalcommits-e10079?logo=semantic-release"
      alt="semantic-release: conventionalcommits"
    />
  </a>
  <a href="https://gitpod.io/#https://github.com/Kit-p/json-kit">
    <img
      src="https://img.shields.io/badge/Contribute%20with-Gitpod-908a85?logo=gitpod"
      alt="Contribute with Gitpod"
    />
  </a>
</div>

<h3 align="center">JSON Toolkit for (de)serialization | (un)minification | (de)compression</h3>

---

## Project State

> This project is in **early development** phase. The APIs are subject to change. Please do **NOT** use in production environments.

## Installation

### For Node.js:

- `npm install @kit-p/json-kit`
- `yarn add @kit-p/json-kit`
- `pnpm add @kit-p/json-kit`

#### _CommonJS_

```js
const { JsonKit } = require("@kit-p/json-kit");
```

#### _ESM_

```js
import { JsonKit } from "@kit-p/json-kit";
```

### For browsers:

#### _CommonJS_

- ```html
  <script src="https://cdn.jsdelivr.net/npm/@kit-p/json-kit"></script>
  <script>
    console.log(JsonKit);
  </script>
  ```
- ```html
  <script src="https://unpkg.com/@kit-p/json-kit"></script>
  <script>
    console.log(JsonKit);
  </script>
  ```

#### _ESM_

- ```html
  <script type="module">
    import { JsonKit } from "https://cdn.jsdelivr.net/npm/@kit-p/json-kit/+esm";
  </script>
  ```
- ```html
  <script type="module">
    import { JsonKit } from "https://unpkg.com/@kit-p/json-kit?module";
  </script>
  ```

## License

MIT

```

```
