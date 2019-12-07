import { validate, registerValidator } from '../utils/validate'
import { get, post, del } from '../utils/route-decorator'
import { getUserByName, isUserExist, getUsers, add, deleteUser, updateUser } from "../service/user";

@registerValidator([{
    ruleName: 'userNotExist',
    validator: async function customValidator(username, passes) {
        let result = await isUserExist(username)
        result ? passes(false) : passes(true)
    },
    message: ':attribute is already exist!'
}, {
    ruleName: 'userExist',
    validator: async function customValidator(username, passes) {
        let result = await isUserExist(username)
        result ? passes(true) : passes(false)
    },
    message: ':attribute do not exist!'
}])
class User {
    @get('/users')
    public async getUserList(ctx) {
        const users = await getUsers()
        ctx.body = { code: 'success', users }
    }

    @get('/user')
    @validate({ username: 'required' }, 'url')
    public async getUser(ctx) {
        const user = await getUserByName(ctx.query.username)
        ctx.body = { code: 'success', user }
    }

    @post('/user')
    // @validate({username: 'required', age: 'numeric|min:0'})
    // @validate({ username: 'required', age: 'numeric|min:0' }, { required: 'you must input :attribute!!!' })
    // @validate({ username: 'required|userNotExist', age: 'numeric|checkAge' }, 'body')
    @validate({ username: ['required', 'userNotExist', 'regex:/^[\\w]*$/'], age: 'numeric|checkAge' }, 'body')
    public async addUser(ctx) {
        add(ctx.request.body)
        ctx.body = { code: 'success' }
    }

    @post('/updateuser')
    @validate({ username: 'required|userExist', age: 'numeric|checkAge' }, 'all')
    public async updateUser(ctx) {
        updateUser({ ...ctx.request.body, ...ctx.query })
        ctx.body = { code: 'success' }
    }

    @del('/user')
    @validate({ username: 'required|userExist' })
    public async delUser(ctx) {
        deleteUser(ctx.query.username)
        ctx.body = { code: 'success' }
    }
}
export default User