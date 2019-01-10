<template>
  <div class="hello">


    <form ref="myForm">
      <input placeholder="姓名" v-model="formData.name" name="name" :class="{ error: $isError('name') }" />
      <br>
      <input placeholder="电话" v-model="formData.tel" name="tel" :class="{ error: $isError('tel') }" />
      <br>
      <select name="habit" v-model="formData.habit" :class="{ error: $isError('habit') }">
        <option value="">空</option>
        <option value="1">睡觉</option>
        <option value="2">打豆豆</option>
        <option value="3">错误选项</option>
      </select>
      <br>
      <!--<OwnerBtn text="保存" v-validate:submit.autoCatch="validateData" />-->
      <OwnerBtn text="保存" v-validate:submit="validateData" />
    </form>



    <!--<button v-check-submit="submit">保存</button>-->
    <br><br><br><br><br><br><br><br><br><br><br><br><br>
    姓名：{{ $verify('name').msg }}<br><br>
    手机：{{ JSON.parse(JSON.stringify($verify('tel'))) }}<br><br>
    爱好：{{ JSON.parse(JSON.stringify($verify('habit'))) }}<br><br>
    所有： {{ $verify() }}
  </div>
</template>

<script>
// import Vily, { rules } from '@ignorance/validator'
// import Vily, { rules } from '../pure-validate'
// rules.extendRegexp({
//   onlyNumber: /^\d+$/
// })

import OwnerInput from './OwnerInput'
import OwnerBtn from './OwnerBtn'
export default {
  name: 'HelloWorld',
  components: {
    OwnerInput,
    OwnerBtn
  },
  data() {
    return {
      show: true,
      formData: {
        name: '',
        tel: '',
        habit: ''
      }
    }
  },
  methods: {
    submit() {
      const res = this.$refs.myForm.validator()
      console.log(res)
      console.log('执行 submit 方法')
    }
  },
  created() {
    this.validateData = {
      ref: 'myForm',
      formData: 'formData',
      fields: [ 'name', 'tel', 'habit' ],
      rules: {
        name: [
          {
            validator: 'required',
            msg: '必填'
          },
          {
            validator: 'onlyNumber',
            msg: '只接受数字'
          },
          {
            validator: 'max:8 min:5',
            msg: '长度在 5 ~ 8 之间'
          }
        ],
        tel: [
          {
            validator: 'mobile',
            msg: '请输入正确的手机号码'
          }
        ],
        habit: [
          {
            validator: 'required',
            msg: '必填'
          },
          {
            validator: val => val === '1' || val === '2'
          }
        ]
      }
    }
  },
  mounted() {
    // const vily = new Vily(this.formData, this.validateData.rules)
    // console.log(this.$refs.myForm.name)
    // setInterval(() => {
    //   console.log(vily.isError('name'))
    //   console.log(vily.verify('tel'))
    // }, 6000)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input, select {
  border: 1px solid #555;
  outline: none;
  height: 30px;
  line-height: 30px;
  border-radius: 4px;
  margin-bottom: 15px;
  width: 300px;
}
.error {
  color: red;
  border-color: red;
}
.error::-webkit-input-placeholder {
  color: red;
}
</style>
