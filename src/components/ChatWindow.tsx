import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Send } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';  // Import from emoji-picker-react
import moment from 'moment';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatId = [user?.uid, recipientId].sort().join('_');

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(newMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [user, recipientId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await addDoc(collection(db, `chats/${chatId}/messages`), {
      text: newMessage,
      senderId: user.uid,
      senderUsername: user.displayName,
      timestamp: serverTimestamp(),
    });

    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEmojiSelect = (emoji: { emoji: string }) => {
    setNewMessage((prevMessage) => prevMessage + emoji.emoji);
  };

  const formatDate = (timestamp: any) => moment(timestamp?.toDate()).format('MMM DD, YYYY');
  const formatTime = (timestamp: any) => moment(timestamp?.toDate()).format('h:mm A');

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-700 to-teal-500 text-white p-4 rounded-t-lg shadow-md flex justify-between items-center">
        <h2 className="text-xl font-semibold">{`Chat with ${recipientUsername}`}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.reduce((acc: JSX.Element[], message, idx) => {
          const prevMessage = messages[idx - 1];
          const showDate = !prevMessage || formatDate(prevMessage.timestamp) !== formatDate(message.timestamp);
          if (showDate) {
            acc.push(
              <div key={`date-${message.id}`} className="text-center text-gray-400 text-sm my-4">
                {formatDate(message.timestamp)}
              </div>
            );
          }
          acc.push(
            <div key={message.id} className={`flex items-end ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-lg shadow-lg ${message.senderId === user?.uid ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'}`}>
                <p className="text-base">{message.text}</p>
                <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          );
          return acc;
        }, [])}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white shadow-inner rounded-b-lg flex items-center relative">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-300 px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="ml-2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-all"
        >
          😊
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-14 right-16">
            <EmojiPicker onEmojiClick={handleEmojiSelect} />
          </div>
        )}
        <button
          type="submit"
          className="ml-4 p-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-all"
        >
          <Send className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
}
