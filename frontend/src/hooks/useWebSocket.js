import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ENV } from "../config/env";

export default function useWebSocket(quotationId, onMessage){
  const clientRef = useRef(null)

  useEffect(() => {
    if(!quotationId) return

    const client = new Client({
      webSocketFactory: () => new SockJS(ENV.SOCKET_URL),
      reconnectDelay: 0,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    })

    client.onConnect = () => {
      client.subscribe(`/topic/quotation/${quotationId}`, (message) => {
        const data = JSON.parse(message.body)
        onMessage(data)
      })
    }

    client.activate()
    clientRef.current = client

    return () => {
      if(clientRef.current) clientRef.current.deactivate()
    }

  }, [quotationId, onMessage])
}