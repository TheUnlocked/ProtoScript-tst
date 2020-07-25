declare interface Object {
    factory<T>(this: T, ...args: any[]): T;
}