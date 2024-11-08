import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, User } from 'lucide-react';

interface UserData {
  uid: string;
  username: string;
  email: string;
}

export function UserList({ onSelectUser }: { onSelectUser: (user: UserData) => void }) {
  const [users, setUsers] = useState<UserData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users'),
      where('uid', '!=', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData = snapshot.docs.map(doc => ({
        ...doc.data()
      } as UserData));
      setUsers(userData);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-t-lg shadow-md">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <User className="w-6 h-6" />
          <span>User List</span>
        </h2>
      </div>

      {/* User List */}
      <div className="divide-y bg-gray-50">
        {users.map((userData) => (
          <button
            key={userData.uid}
            onClick={() => onSelectUser(userData)}
            className="w-full px-6 py-4 text-left hover:bg-blue-50 transition-all duration-300 ease-in-out flex items-center justify-between rounded-lg"
          >
            {/* User Info */}
            <div className="flex flex-col">
              <p className="text-lg font-medium text-gray-800">{userData.username}</p>
              <p className="text-sm text-gray-500">{userData.email}</p>
            </div>
            
            {/* Message Icon */}
            <MessageSquare className="w-5 h-5 text-blue-600 hover:text-blue-700 transition-all duration-200 ease-in-out" />
          </button>
        ))}
      </div>
    </div>
  );
}
