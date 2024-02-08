type NodeMiddleware = (req:Request, res:Response, next:CallableFunction) => void | Response
