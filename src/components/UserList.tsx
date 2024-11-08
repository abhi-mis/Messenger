import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, User, Trash } from 'lucide-react';

interface UserData {
  uid: string;
  username: string;
  email: string;
  online: boolean;
}

export function UserList({ onSelectUser }: { onSelectUser: (user: UserData) => void }) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users'),
      where('uid', '!=', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserData[];
      setUsers(userData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter((userData) =>
    userData.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user from your chat list?')) {
      const userRef = doc(db, 'users', userId);
      // Deleting user or removing them from your chat list
      await updateDoc(userRef, { inChatList: false });
      setUsers((prev) => prev.filter((u) => u.uid !== userId));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-t-lg shadow-md">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <User className="w-6 h-6" />
          <span>User List</span>
        </h2>
      </div>

      {/* Search Bar */}
      <div className="px-5 py-3 bg-gray-100">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search users..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* User List */}
      <div className="divide-y bg-gray-50">
        {filteredUsers.map((userData) => (
          <div
            key={userData.uid}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-all duration-300 ease-in-out rounded-lg"
          >
            {/* User Info */}
            <div className="flex items-center space-x-4 flex-grow cursor-pointer" onClick={() => onSelectUser(userData)}>
              <div className="flex flex-col">
                <p className="text-lg font-medium text-gray-800">{userData.username}</p>
                <p className="text-sm text-gray-500">{userData.email}</p>
                <p className={`text-sm ${userData.online ? 'text-green-500' : 'text-gray-400'}`}>
                  {userData.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-600 hover:text-blue-700 transition-all duration-200 ease-in-out cursor-pointer" />
              <Trash
                className="w-5 h-5 text-red-600 hover:text-red-700 transition-all duration-200 ease-in-out cursor-pointer"
                onClick={() => handleDeleteUser(userData.uid)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
