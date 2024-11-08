import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderUsername: string;
  timestamp: any;
}

export function ChatWindow({ recipientId, recipientUsername }: { recipientId: string; recipientUsername: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const chatId = [user.uid, recipientId].sort().join('_');
    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [user, recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const chatId = [user.uid, recipientId].sort().join('_');
    await addDoc(collection(db, `chats/${chatId}/messages`), {
      text: newMessage,
      senderId: user.uid,
      senderUsername: user.displayName,
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-4 rounded-t-lg shadow-md">
        <h2 className="text-xl font-semibold">{`Chat with ${recipientUsername}`}</h2>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === user?.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[75%] p-4 rounded-lg shadow-lg ${
                message.senderId === user?.uid
                  ? 'bg-blue-600 text-white rounded-br-xl'
                  : 'bg-gray-300 text-black rounded-bl-xl'
              }`}
            >
              <p className="text-base">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input form */}
      <form onSubmit={sendMessage} className="p-4 bg-white shadow-inner rounded-b-lg flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-300 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="ml-4 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
        >
          <Send className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
}
