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
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5" />
          Users
        </h2>
      </div>
      <div className="divide-y">
        {users.map((userData) => (
          <button
            key={userData.uid}
            onClick={() => onSelectUser(userData)}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
          >
            <div>
              <p className="font-medium">{userData.username}</p>
              <p className="text-sm text-gray-500">{userData.email}</p>
            </div>
            <MessageSquare className="w-5 h-5 text-blue-500" />
          </button>
        ))}
      </div>
    </div>
  );
}