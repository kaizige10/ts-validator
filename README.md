# ts-validator
a validator based on typescript and decorator

## 需求
要求利用切面编程的方式实现一个decorator可以对接口进行校验
考虑一下两个问题
get和post不同的方式如何实现比较合理
自己选择一个合理的第三方校验库，不一定async-validator

## 分析
1. 第三方校验库选择[validatorjs](https://github.com/skaterdav85/validatorjs)，这个库人气较高，使用Laravel语法，学习起来比较简单，而且支持嵌套校验规则、多语言错误提示和自定义异步校验器
2. 考虑异步校验，增加自定义校验器
3. get、delete请求需要校验query，post、put请求需要校验body。默认从ctx.method获取，无需传参

## 校验器使用方法
### 1.基本用法
```javascript
class User {
    @post('/user')
    // 基本校验，required必传，numeric必须数字，email必须邮件格式，min、max最值校验，regex:pattern正则
    @validate({ username: ['required', 'regex:/^[\\w]*$/'], age: 'numeric' }, { required: 'you must input :attribute!!!' })
    public async addUser(ctx) {
        add(ctx.request.body)
        ctx.body = { code: 'success' }
    }
}
```
### 2.自定义异步校验器-类装饰器
```javascript
@registerValidator([{
    ruleName: 'userNotExist',
    // 异步校验器使用async定义，校验成功后调用passes(true)，失败后调用passes(false)
    validator: async function customValidator(username, passes) {
        let result = await isUserExist(username)
        result ? passes(false) : passes(true)
    },
    message: ':attribute is already exist!'
}])
class User {
    @post('/user')
    @validate({ username: 'required|userNotExist', age: 'numeric' })
    public async addUser(ctx) {
        add(ctx.request.body)
        ctx.body = { code: 'success' }
    }
}
```
### 3.自定义异步校验器-初始化
```javascript
index.ts:
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

routes/user.ts:
class User {
    @post('/user')
    @validate({ username: 'required', age: 'numeric|checkAge' })
    public async addUser(ctx) {
        add(ctx.request.body)
        ctx.body = { code: 'success' }
    }
}
```
## 可用规则一览

若校验规则为空或undefined，则认为可以通过校验

#### accepted

The field under validation must be yes, on, 1 or true. This is useful for validating "Terms of Service" acceptance.

#### after:date

The field under validation must be after the given date.

#### after_or_equal:date

The field unter validation must be after or equal to the given field

#### alpha

The field under validation must be entirely alphabetic characters.

#### alpha_dash

The field under validation may have alpha-numeric characters, as well as dashes and underscores.

#### alpha_num

The field under validation must be entirely alpha-numeric characters.

#### array

The field under validation must be an array.

#### before:date

The field under validation must be before the given date.


#### before_or_equal:date

The field under validation must be before or equal to the given date.

#### between:min,max

The field under validation must have a size between the given min and max. Strings, numerics, and files are evaluated in the same fashion as the size rule.

#### boolean

The field under validation must be a boolean value of the form `true`, `false`, `0`, `1`, `'true'`, `'false'`, `'0'`, `'1'`,

#### confirmed

The field under validation must have a matching field of foo_confirmation. For example, if the field under validation is password, a matching password_confirmation field must be present in the input.

#### date

The field under validation must be a valid date format which is acceptable by Javascript's `Date` object.

#### digits:value

The field under validation must be numeric and must have an exact length of value.

#### digits_between:min,max

The field under validation must be numeric and must have length between given min and max.

#### different:attribute

The given field must be different than the field under validation.

#### email

The field under validation must be formatted as an e-mail address.

#### hex
The field under validation should be a hexadecimal format. Useful in combination with other rules, like `hex|size:6` for hex color code validation.

#### in:foo,bar,...

The field under validation must be included in the given list of values. The field can be an array or string.

#### integer

The field under validation must have an integer value.

#### max:value

Validate that an attribute is no greater than a given size

_Note: Maximum checks are inclusive._

#### min:value

Validate that an attribute is at least a given size.

_Note: Minimum checks are inclusive._

#### not_in:foo,bar,...

The field under validation must not be included in the given list of values.

#### numeric

Validate that an attribute is numeric. The string representation of a number will pass.

#### present
The field under validation must be present in the input data but can be empty.

#### required

Checks if the length of the String representation of the value is >

#### required_if:anotherfield,value

The field under validation must be present and not empty if the anotherfield field is equal to any value.

#### required_unless:anotherfield,value

The field under validation must be present and not empty unless the anotherfield field is equal to any value.

#### required_with:foo,bar,...

The field under validation must be present and not empty only if any of the other specified fields are present.

#### required_with_all:foo,bar,...

The field under validation must be present and not empty only if all of the other specified fields are present.

#### required_without:foo,bar,...

The field under validation must be present and not empty only when any of the other specified fields are not present.

#### required_without_all:foo,bar,...

The field under validation must be present and not empty only when all of the other specified fields are not present.

#### same:attribute

The given field must match the field under validation.

#### size:value

The field under validation must have a size matching the given value. For string data, value corresponds to the number of characters. For numeric data, value corresponds to a given integer value.

#### string

The field under validation must be a string.

#### url

Validate that an attribute has a valid URL format

#### regex:pattern

The field under validation must match the given regular expression.

**Note**: When using the ``regex`` pattern, it may be necessary to specify rules in an array instead of using pipe delimiters, especially if the regular expression contains a pipe character.
For each backward slash that you used in your regex pattern, you must escape each one with another backward slash.