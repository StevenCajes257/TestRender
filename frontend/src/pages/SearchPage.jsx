import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, UserPlus, MessageSquare, Clock, Users } from 'lucide-react';

export const SearchPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async (q) => {
    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
      setResults(res.data.users || []);
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(query);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal });
    }
  };

  const handleSendRequest = async (friendId) => {
    try {
      await api.post('/friends/request', { friend_id: friendId });
      fetchResults(query);
    } catch (err) {
      console.error('Failed to send request', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-3">
              <Search className="w-7 h-7 text-blue-600" />
              <span>Search Results for "{query}"</span>
            </h1>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex space-x-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search users by name, username..."
                className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold text-sm shadow-md shadow-blue-200 cursor-pointer"
            >
              Search
            </button>
          </form>

          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-slate-400">Searching database...</div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Users className="w-12 h-12 mx-auto text-slate-300" />
                <p className="font-medium">No users found matching "{query}"</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {results.map((u) => (
                  <div key={u.id} className="py-4 flex items-center justify-between hover:bg-slate-50 px-4 rounded-2xl transition">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{u.name}</h3>
                        <span className="text-xs text-slate-500">@{u.username} • {u.email}</span>
                      </div>
                    </div>

                    <div>
                      {u.friendship_status === 'friends' && (
                        <button
                          onClick={() => navigate('/messenger')}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Chat</span>
                        </button>
                      )}
                      {u.friendship_status === 'none' && (
                        <button
                          onClick={() => handleSendRequest(u.id)}
                          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Add Friend</span>
                        </button>
                      )}
                      {u.friendship_status === 'pending_sent' && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5">
                          <Clock className="w-4 h-4" />
                          <span>Request Sent</span>
                        </span>
                      )}
                      {u.friendship_status === 'pending_received' && (
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3.5 py-2 rounded-xl text-xs font-medium">
                          Pending Your Approval
                        </span>
                      )}
                    </div>
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
