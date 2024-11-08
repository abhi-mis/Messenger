import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserList } from '../components/UserList';
import { ChatWindow } from '../components/ChatWindow';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Home.css'; // Import custom CSS for animations

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
    <div className="min-h-screen animated-bg">
      {/* Header */}
      <header className="animated-header shadow-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4 flex justify-between items-center text-white">
          <h1 className="text-3xl font-semibold tracking-tight">Chat App</h1>
          <div className="flex items-center gap-6">
            <span className="text-lg font-medium">{`Welcome, ${user?.displayName}`}</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-sm font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User List */}
          <div className="md:col-span-1 bg-white shadow-lg rounded-lg overflow-hidden slide-in-left">
            <UserList
              onSelectUser={(user) =>
                setSelectedUser({ uid: user.uid, username: user.username })
              }
            />
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2">
            {selectedUser ? (
              <div className="bg-white rounded-lg shadow-lg h-[600px] slide-in-right">
                <ChatWindow
                  recipientId={selectedUser.uid}
                  recipientUsername={selectedUser.username}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg h-[600px] flex items-center justify-center text-gray-500">
                Select a user to start chatting
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
