import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import api from '../services/api';
import { Users, UserCheck, UserX, MessageSquare, UserPlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FriendsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [friendsList, setFriendsList] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends');
      setFriendsList(res.data.friends || []);
      setPendingReceived(res.data.pending_received || []);
      setPendingSent(res.data.pending_sent || []);
    } catch (err) {
      console.error('Failed to load friends', err);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleAccept = async (friendshipId) => {
    await api.post('/friends/accept', { friendship_id: friendshipId });
    fetchFriends();
  };

  const handleRemove = async (friendshipId) => {
    await api.post('/friends/remove', { friendship_id: friendshipId });
    fetchFriends();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-3">
              <Users className="w-7 h-7 text-blue-600" />
              <span>Friends & Requests</span>
            </h1>
          </div>

          {/* Incoming Requests */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Friend Requests ({pendingReceived.length})
            </h2>
            {pendingReceived.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No incoming friend requests.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {pendingReceived.map((req) => (
                  <div key={req.friendship_id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {req.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{req.name}</h3>
                        <span className="text-xs text-slate-500">@{req.username}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAccept(req.friendship_id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRemove(req.friendship_id)}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Friends List */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              My Friends ({friendsList.length})
            </h2>
            {friendsList.length === 0 ? (
              <p className="text-sm text-slate-400 italic">You haven't added any friends yet. Use the search bar to find people!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {friendsList.map((f) => (
                  <div key={f.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {f.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{f.name}</h3>
                        <span className="text-xs text-slate-500">@{f.username}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/messenger')}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-xl transition"
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
