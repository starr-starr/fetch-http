const isPlainObj = function isPlainObj(obj){
    let proto,Ctor
    if (!obj || toString.call(obj) !== '[object Object]') return false
    proto = Object.getPrototypeOf(obj)
    if (!proto) return true
    Ctor = hasOwn.call(proto,'constructor') && proto.constructor
    return typeof Ctor === 'function' && Ctor === Object
}

export default isPlainObj

