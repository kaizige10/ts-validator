# ts-validator
a validator based on typescript and decorator

## 需求
要求利用切面编程的方式实现一个decorator可以对接口进行校验
考虑一下两个问题
get和post不同的方式如何实现比较合理
自己选择一个合理的第三方校验库，不一定async-validator

## 分析
### 1.第三方校验库选择[validatorjs](https://github.com/skaterdav85/validatorjs)，这个库人气较高，使用Laravel语法，学习起来比较简单，而且支持多语言错误提示和自定义异步校验器
### 2.考虑异步校验，增加自定义校验器
### 3.get请求需要校验queryString，post请求校验body，也可以全部都校验

## 校验器使用方法
### 1.基本用法
```javascript
class User {
    @post('/user')
    @validate({ username: 'required', age: 'numeric' }, 'body')
    public async addUser(ctx) {
        add(ctx.request.body)
        ctx.body = { code: 'success' }
    }
}
```
### 2.自定义校验器-类装饰器
```javascript
@registerValidator([{
    ruleName: 'userNotExist',
    validator: async function customValidator(username, attribute, req, passes) {
        let result = await isUserExist(username)
        result ? passes(false) : passes(true)
    },
    message: ':attribute is already exist!'
}])
class User {
    @post('/user')
    @validate({ username: 'required|userNotExist', age: 'numeric' }, 'body')
    public async addUser(ctx) {
        add(ctx.request.body)
        ctx.body = { code: 'success' }
    }
}
```
### 3.自定义校验器-初始化
```javascript
initValidator([{
    ruleName: 'checkAge',
    validator: async function customValidator(age, attribute, req, passes) {
        if (age > 0 && age < 100) {
            passes(true)
        } else {
            passes(false)
        }
    },
    message: ':attribute should be in (0, 100)!'
}])
class User {
    @post('/user')
    @validate({ username: 'required', age: 'numeric|checkAge' }, 'body')
    public async addUser(ctx) {
        add(ctx.request.body)
        ctx.body = { code: 'success' }
    }
}
```
