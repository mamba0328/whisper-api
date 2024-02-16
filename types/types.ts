export type NodeMiddleware = (req:Request, res:Response, next:CallableFunction) => void | Response

export type Error = {
    message: string,
    status?: number,
    code?: string,
    syscall?:string,
}

export type User = {
    _id?: string,
    first_name: string,
    last_name: string,
    username: string,
    date_of_birth?: string,
    user_img?: string,
    phone_number: string,
    email: string,
    password?: string,
}
