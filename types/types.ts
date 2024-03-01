import { Types } from "mongoose";

export type Img = {
    _id:string,
    filename: string,
    path: string,
}

export type Error = {
    message: string,
    status?: number,
    code?: string,
    syscall?:string,
}

export type User = {
    _id: Types.ObjectId,
    first_name: string,
    last_name: string,
    username: string,
    date_of_birth?: string,
    user_profile_img_id?: string | Img,
    is_admin?: boolean,
    phone_number: string,
    email: string,
    password?: string,
}

export type UserPayload = {
    first_name?: string,
    last_name?: string,
    username: string,
    date_of_birth?: string,
    user_profile_img?: File,
    is_admin?: boolean,
    phone_number: string,
    email: string,
    password: string,
}

export type ChatPayload = {
    chat_users:Types.ObjectId[],
    is_group_chat?:boolean
}

export type Chat= {
    _id: Types.ObjectId[],
    chat_users:Types.ObjectId[],
    is_group_chat?:boolean
}


export type MessagePayload = {
    user_id: Types.ObjectId | null,
    chat_id: Types.ObjectId | null,
    body: string,
}
