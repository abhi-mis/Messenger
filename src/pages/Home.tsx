import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserList } from '../components/UserList';
import { ChatWindow } from '../components/ChatWindow';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SelectedUser {
  uid: string;
  username: string;
}

export function Home() {
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Chat App</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.displayName}</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <UserList
              onSelectUser={(user) =>
                setSelectedUser({ uid: user.uid, username: user.username })
              }
            />
          </div>
          <div className="md:col-span-2">
            {selectedUser ? (
              <div className="bg-white rounded-lg shadow h-[600px]">
                <ChatWindow
                  recipientId={selectedUser.uid}
                  recipientUsername={selectedUser.username}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow h-[600px] flex items-center justify-center text-gray-500">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}