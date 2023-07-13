# @philippdormann/elternportal-api
🔌 unofficial APIs for connecting to `*.eltern-portal.org` URLs/ infoportal by art soft and more GmbH

## Installation
```bash
pnpm i @philippdormann/elternportal-api
```
## Usage
```js
import { getElternportalClient } from "@philippdormann/elternportal-api";

const client = await getElternportalClient({
  short: "heraugy",
  username: "",
  password: "",
});
const letters = await client.getElternbriefe();
console.log(letters);
```
