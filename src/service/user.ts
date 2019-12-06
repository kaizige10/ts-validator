type User = {
    username: string,
    age: number
}
const users = [{
    username: 'kaizige',
    age: 25
}, {
    username: 'banban',
    age: 18
}]

export function add(user: User) {
    users.push(user)
}
export function getUsers(): User[] {
    return users
}

export function getUserByName(name: string): Promise<User> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(users.find(user => user.username === name))
        }, 500);
    })
}

export async function isUserExist(username: string): Promise<boolean> {
    const u = await getUserByName(username)
    return u != null
}