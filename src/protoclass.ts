const useProtoclass = (() => {
    Object.prototype.factory = function(this: any, ...args: any[]) {
        const obj = Object.create(this);
        obj.constructor(...args);
        return obj;
    }
});

export default useProtoclass;