# @philippdormann/elternportal-api
🔌 unofficial APIs for connecting to `*.eltern-portal.org` URLs/ infoportal by art soft and more GmbH

## Installation
```bash
pnpm i @philippdormann/elternportal-api
```
## Usage
```js
import { getFile } from "@philippdormann/elternportal-api";

const kids = await getKids({
    short: "",
    "username": "",
    "password": ""
});
console.log(kids);
```
