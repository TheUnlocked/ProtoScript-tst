// @ts-nocheck

import useProtoclass from "./protoclass";

useProtoclass();

// Some sample behavior
class Foo {
    a: string;
    foo() {

    }
    constructor(a: string) {
        this.a = a;
    }
}

class Bar extends Foo {
    b: string;
    constructor(a: string, b: string) {
        super(a);
        this.b = b;
    }
}

const b = new Bar("a", "b");
Foo.bar = function() {
    console.log(this.a);
};
b.bar();

class Bang extends {a: 1} {    
}

console.log(new Bang().a);