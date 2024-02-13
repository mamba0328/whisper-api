export type NodeMiddleware = (req:Request, res:Response, next:CallableFunction) => void | Response

export type Error = {
    message: string,
    status?: number,
    code?: string,
    syscall?:string,
}
