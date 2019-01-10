# 变更日志

## 0.0.2 / 2018-12-26

1. 自动向组件中注入 `$vec` 响应数据（包含校验过的所有校验信息）  
2. 添加原型方法 `$verify` 检测每一项表单是否有错误  

```vue
<template>
  <input name="name" :class="{ 'error-class': $verify('name') }">
</template>
```

## 0.0.3 / 2018-12-26

1. 支持在安装插件时，扩展正则表达式规则和校验函数
2. 内置长度校验规则，形如 `min:5`、`max:10`、`min:5 max:10`  

## 0.0.40 / 2019-01-02

1. 支持配置校验规则的触发时机（可以缺省，默认是在 `blur` 时触发校验）
2. 更新原型方法 `$verify`，不传参数时， 返回所有校验信息  

## 0.0.50 / 2019-01-09

1. 将 JS 通用校验规则抽离到 [@ignorance/validator](https://www.npmjs.com/package/@ignorance/validator) 中  