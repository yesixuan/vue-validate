# 变更日志

## 0.0.2 / 2018-12-26

1. 自动向组件中注入 `$vec` 响应数据（包含校验过的所有校验信息）  
2. 添加原型方法 `$verify` 检测每一项表单是否有错误  

```vue
<template>
  <input name="name" :class="{ 'error-class': $verify('name') }">
</template>
```

