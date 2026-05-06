import { User } from "../user";

export interface Notification {
    id: string;
    _id: string;
    recipient: string;
    sender: User;
    type: "like" | "comment" | "follow" | "message";
    title: string;
    body: string;
    data: any;
    read: boolean;
    createdAt: string;
}
