import { Server, Socket } from "socket.io";

type HandshakeQueryField = string | string[] | undefined;
type CustomSocket = Socket & { roomId?: HandshakeQueryField, userName?: HandshakeQueryField };
export default async function onConnection (io:Server, socket:Socket) {
    const { roomId, userName } = socket.handshake.query;
    if (!roomId || !userName) {
        return;
    }

    const customSocket:CustomSocket = socket;

    customSocket.roomId = roomId;
    customSocket.userName = userName;

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`${userName} joined the room ${roomId}`);

    await customSocket.join(roomId);

    // // регистрируем обработчики для пользователей
    // userHandlers(io, socket)
    //
    // // регистрируем обработчики для сообщений
    // messageHandlers(io, socket)
}
