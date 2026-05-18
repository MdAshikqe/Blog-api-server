import { CommentStatus } from "../../../../prisma/generated/prisma/enums";

export type ICommentPayload = {
    content:string,
    clientId:string,
    postId:string,
    parentId?:string
}

export type ICommentUpdatePayload = {
    content?:string,
    status?:CommentStatus
}