const Validator = require('validatorjs')

/**
 * 异步校验器对象
 */
type AsyncValidator = {
    ruleName: string, // 校验规则名
    /**
     * 自定义校验函数
     * @param value string 校验对象值
     * @param passes Function 校验成功时调用passed()，失败时调用passed(false)
     */
    validator: (value: any, passes: Function) => {},
    message: string// 自定义提示信息
}

/**
 * validate装饰器，用于接口校验
 * 校验规则参考Laravel校验框架，简单方便
 * 
 * 使用方法：(可参考routes/user.ts)
 * class User {
 *     @post('/users')
 *     @validate({ username: 'required|userNotExist', age: 'numeric|checkAge' })
 *     public async addUser(ctx) {
 *         users.push(ctx.request.body)
 *         ctx.body = {code: 'success'}
 *   }
 * }
 * 
 * 注意：
 * 1.validate装饰器必须用于方法装饰器(get、post等)之后，否则无法生效
 * 2.默认get、delete校验query，put和post校验body
 * 
 * @param rules object 校验规则 使用Laravel校验规则,参考：https://laravel.com/docs/6.x/validation#available-validation-rules
 * @param customMessage object 自定义提示信息 可选
 */
export function validate(rules: object, customMessage: object = {}) {
    return (target: object, property: string, descriptor: PropertyDescriptor) => {
        let func = descriptor.value;// 保存老的函数

        descriptor.value = async function validator(...args) {// 使用校验函数替代
            let ctx = args[0], validation;
            if (ctx.method === 'GET' || ctx.method === 'DELETE') {
                // console.log('ctx.query', ctx.query);
                validation = new Validator(ctx.query, rules, customMessage)
            } else {
                // console.log('ctx.request.body', ctx.request.body);
                validation = new Validator(ctx.request.body, rules, customMessage)
            }
            return new Promise((resolve, reject) => {
                validation ? validation.checkAsync(() => {// 成功的回调
                    resolve(func.apply(null, args))
                }, () => {// 失败回调
                    reject(validation.errors.all())
                }) : resolve(func.apply(null, args))
            })
        }
    }
}

/**
 * 注册自定义异步校验器装饰器，用于修饰类
 * 
 * 使用方法：(可参考routes/user.ts)
 * @registerValidator([{
 *   ruleName: 'userExist',
 *   validator: customValidator,
 *   message: ':attribute is not exist!'
 * }])
 * class User {}
 * }
 * 
 * @param asyncValidators 异步校验器数组
 */
export function registerValidator(asyncValidators: AsyncValidator[]) {
    return (target) => initValidator(asyncValidators)
}

/**
 * 注册自定义异步校验器，可用于程序启动时
 * 
 * @param asyncValidators 异步校验器数组
 */
export function initValidator(asyncValidators: AsyncValidator[]) {
    asyncValidators.forEach(v => Validator.registerAsync(v.ruleName,
        // validatorjs的自定义校验器需要传4个参数，实际上只有value和passes有用，再这里做一次函数转换
        (value: any, ruleValue, attribute, passes: Function) => v.validator(value, passes),
        v.message))
}