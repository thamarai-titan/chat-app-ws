import { useEffect, useState } from 'react';

interface ChatMessage {
  text: string;
  sender: string;
  timestamp: number;
}

const App = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      console.log('Received message:', event.data); // Debug received messages
      const data = JSON.parse(event.data);
      console.log('Parsed data:', data); // Debug parsed data
      
      if (data.type === 'chat') {
        console.log('Adding chat message:', data.payload); // Debug chat message
        setMessages(prev => [...prev, data.payload]);
      } else if (data.type === 'error') {
        console.log('Received error:', data.payload.message); // Debug errors
        alert(data.payload.message);
      } else {
        console.log('Unhandled message type:', data.type); // Debug unhandled types
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleCreateRoom = () => {
    if (roomId.trim() && username.trim() && socket) {
      const createMessage = {
        type: 'create',
        payload: {
          roomId: roomId.trim(),
          username: username.trim()
        }
      };
      console.log('Sending create room message:', createMessage); // Debug create room
      socket.send(JSON.stringify(createMessage));
      setJoinedRoom(true);
    } else {
      console.log('Create room validation failed:', { // Debug validation
        roomId: roomId.trim(),
        username: username.trim(),
        socketExists: !!socket
      });
    }
  };

  const handleJoinRoom = () => {
    if (roomId.trim() && username.trim() && socket) {
      const joinMessage = {
        type: 'join',
        payload: {
          roomId: roomId.trim(),
          username: username.trim()
        }
      };
      console.log('Sending join room message:', joinMessage); // Debug join room
      socket.send(JSON.stringify(joinMessage));
      setJoinedRoom(true);
    } else {
      console.log('Join room validation failed:', { // Debug validation
        roomId: roomId.trim(),
        username: username.trim(),
        socketExists: !!socket
      });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && socket && joinedRoom) {
      const chatMessage = {
        type: 'chat',
        payload: {
          message: newMessage.trim()
        }
      };
      console.log('Sending chat message:', chatMessage); // Debug send message
      socket.send(JSON.stringify(chatMessage));
      setNewMessage('');
    } else {
      console.log('Send message validation failed:', { // Debug validation
        messageExists: !!newMessage.trim(),
        socketExists: !!socket,
        isJoined: joinedRoom
      });
    }
  };

  if (!joinedRoom) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Chat Application</h1>
          
          <div className="mb-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username..."
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID..."
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateRoom}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Create Room
            </button>
            <button
              onClick={handleJoinRoom}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="mb-4">
        <span className="font-semibold">Room: {roomId}</span>
        <span className="ml-4 text-gray-600">User: {username}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 border rounded p-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-2 p-2 rounded ${
              message.sender === username 
                ? 'bg-blue-100 ml-auto' 
                : 'bg-gray-100'
            } max-w-[80%]`}
          >
            <div className="font-semibold text-sm">{message.sender}</div>
            <div>{message.text}</div>
            <div className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default App;