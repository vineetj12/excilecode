import axios from "axios";
import { backend_url } from "../app/config";
import { ChatRoomClient } from "./ChatRoomClient";

async function getChats(roomId:string){
    const response=await axios.get(`${backend_url}/chats/${roomId}`);
    return response.data.message;
}

export async function ChatRoom({id}:{id:string}){
    const messages=await getChats(id);
    return <ChatRoomClient id={id} messages={messages}/>
}