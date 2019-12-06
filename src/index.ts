import * as Koa from 'koa'
import * as bodify from 'koa-body'
import { resolve } from 'path'
import { load } from './utils/route-decorator'
import { initValidator } from './utils/validate'
const app = new Koa()

app.use(async (ctx, next) => {
    try {
        await next()
    } catch (error) {
        console.log('error', error);
        ctx.status = 500
        ctx.body = { code: 'failed', message: JSON.stringify(error) }
    }
})
app.use(bodify({
    multipart: true,
    // strict: true
}))

// 初始化自定义校验方法
initValidator([{
    ruleName: 'checkAge',
    validator: async function customValidator(age, attribute, req, passes) {
        console.log('age', age);

        if (age > 0 && age < 100) {
            passes(true)
        } else {
            passes(false)
        }
    },
    message: ':attribute should be in (0, 100)!'
}])

const router = load(resolve(__dirname, './routes'))
app.use(router.routes())

app.listen(3000, () => {
    console.log('server start on 3000');
})

