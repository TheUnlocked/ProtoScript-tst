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

Because TypeScript's type system is built to support ES6 classes and not proto-classes, you'll often need to disable type-checking with `@ts-nocheck` and/or generate your own type declarations.

TODO: better readme