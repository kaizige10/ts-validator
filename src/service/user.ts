type User = {
    username: string,
    age: number
}
let users = [{
    username: 'kaizige',
    age: 25
}, {
    username: 'banban',
    age: 18
}]

export function add(user: User) {
    user.age = Number(user.age)
    users.push(user)
}

export function deleteUser(username: string) {
    users = users.filter(u => u.username !== username)
}

export function getUsers(): User[] {
    return users
}

export async function updateUser(user: User) {
    user.age = Number(user.age)
    const index = users.findIndex(u => u.username === user.username)
    users.splice(index, 1, user)
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