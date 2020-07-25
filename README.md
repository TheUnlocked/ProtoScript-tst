# ProtoScript-tst
A proof-of-concept TypeScript transformer for "proto-classes"

Setup:
```sh
npm install
```

Compile with ttypescript:
```sh
# Install: npm install -g ttypescript
ttsc
```
Then you can run it with
```sh
node out/index.js
``` 

Alternatively, you can also use ts-node:
```sh
# Install: npm install -g ts-node
ts-node --compiler ttypescript --files src/index.ts
```

TODO: better readme