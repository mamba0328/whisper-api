export type NodeMiddleware = (req:Request, res:Response, next:CallableFunction) => void | Response

export type Error = {
    status: number,
    message: string,
    code?: string,
    syscall?:string,
}
