import { useEffect, useState } from "react";
import { ws_url } from "../app/config";

export function useSocket(){
    const [loading,setloading]=useState(true);
    const [socket,setSocket]=useState<WebSocket>();
    useEffect(()=>{
        const ws=new WebSocket(ws_url);
        ws.onopen=()=>{
            setloading(false);
            setSocket(ws);
        }
    },[]);
    return {
        loading,socket
    }
}