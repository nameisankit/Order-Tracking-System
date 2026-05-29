import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_URL } from '../config/env';

export const useWebSocket = (onNotification) => {
  const clientRef = useRef(null);

  const connect = useCallback(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ WebSocket connected');

        // Subscribe to all order notifications
        client.subscribe('/topic/orders', (message) => {
          const notification = JSON.parse(message.body);
          onNotification(notification);
        });
      },
      onDisconnect: () => {
        console.log('❌ WebSocket disconnected');
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [onNotification]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { disconnect };
};

export default useWebSocket;
