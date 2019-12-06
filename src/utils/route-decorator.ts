import * as glob from 'glob'
import * as Koa from 'koa'
import * as KoaRouter from 'koa-router'
import * as path from 'path'

type HTTPMethod = 'get' | 'post' | 'del' | 'put' | 'patch'
type LoadOptions = {
    // 路由文件扩展名：默认值是 .{js, ts}
    extname?: string
}
type RouteOptions = {
    // 适用于某个请求比较特殊，需要单独制定特殊的前缀
    prefix?: string;
    // 给当前路由添加一个或多个中间件
    middlewares?: Array<Koa.middleware>
}
const router = new KoaRouter()
const decorator = (path: string, options: RouteOptions, method: HTTPMethod, router: KoaRouter) =>
    (target, name: string, descriptor) => {
        // 中间件数组
        const middlewares = []
        if (options.middlewares) {
            middlewares.push(...options.middlewares)
        }
        middlewares.push(descriptor.value)
        const url = options.prefix ? options.prefix + path : path
        router[method](url, ...middlewares)
    }
const method = (method: HTTPMethod) => {
    return (path: string, options: RouteOptions = {}) => decorator(path, options, method, router)
}
export const get = method('get');
export const post = method('post');
export const put = method('put')
export const del = method('del')
export const patch = method('patch')

export const load = (folder: string, options: LoadOptions = {}): KoaRouter => {
    const extname = options.extname || '.{ts,js}'
    glob.sync(path.join(folder, `./**/*${extname}`)).forEach(item => require(item))
    return router
}