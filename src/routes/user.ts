import { validate, registerValidator } from '../utils/validate'
import { get, post } from '../utils/route-decorator'
import { getUserByName, isUserExist, getUsers, add } from "../service/user";

@registerValidator([{
    ruleName: 'userNotExist',
    validator: async function customValidator(username, attribute, req, passes) {
        let result = await isUserExist(username)
        result ? passes(false) : passes(true)
    },
    message: ':attribute is already exist!'
}])
class User {
    @get('/users')
    public async getUserList(ctx) {
        const users = await getUsers()
        ctx.body = { code: 'success', users }
    }

    @get('/user')
    public async getUser(ctx) {
        const user = await getUserByName(ctx.query.username)
        ctx.body = { code: 'success', user }
    }

    @post('/user')
    // @validate({username: 'required', age: 'numeric|min:0'})
    // @validate({ username: 'required', age: 'numeric|min:0' }, { required: 'you must input :attribute!!!' })
    @validate({ username: 'required|userNotExist', age: 'numeric|checkAge' })
    public async addUser(ctx) {
        add(ctx.request.body)
        ctx.body = { code: 'success' }
    }
}
export default User