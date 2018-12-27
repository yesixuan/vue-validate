/* 创建偏函数，可提前接收部分参数 */
export const partial = (fn, ...prevArgs) => (...nextArgs) => fn(...prevArgs, ...nextArgs)