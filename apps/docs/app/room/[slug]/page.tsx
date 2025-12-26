import axios from "axios";
import { backend_url } from "../../config";
import { ChatRoom } from "../../../components/ChatRoom";
async function getroomId(slug:string) {
    const response=await axios.get(`${backend_url}/room/${slug}`)
    return response.data.room.id;
}
export default async function ChatRoom1({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const slug=(await params).slug;
  const roomId=await getroomId(slug);
  return <ChatRoom id={roomId}></ChatRoom>
}

