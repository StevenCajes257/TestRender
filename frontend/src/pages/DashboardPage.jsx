import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  MessageSquare, Users, Search, ShieldCheck, Activity, Zap, ArrowRight, 
  UserPlus, CheckCircle2, Globe, Sparkles, Heart, Share2, Terminal 
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [realtimeStats, setRealtimeStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/realtime-stats');
        setRealtimeStats(res.data);
      } catch (err) {
        console.error('Stats error', err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Facebook Style Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-xl p-8 sm:p-10 text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 transform translate-x-12 translate-y-12 opacity-10 pointer-events-none">
            <Globe className="w-96 h-96" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-100 border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Facebook Social Network & Messenger</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Connect with friends, search for users across the database, and chat in real-time with zero lag.
            </p>

            {/* Hero Search Bar */}
            <form onSubmit={handleSearch} className="pt-2 flex items-center max-w-lg bg-white p-2 rounded-2xl shadow-lg">
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for friends by name, username..."
                className="w-full px-3 py-2 text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition shadow-md shadow-blue-200 cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Realtime Live Telemetry Widget */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 px-6 flex flex-wrap items-center justify-between shadow-lg border border-slate-800">
          <div className="flex items-center space-x-3 my-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold tracking-wide text-emerald-400">NETWORK PULSE ACTIVE</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-300 my-1">
            <div className="flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Total Database Users: <strong className="text-white">{realtimeStats?.total_users ?? '...'}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Active Sessions: <strong className="text-white">{realtimeStats?.active_sessions ?? '...'}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Latency: <strong className="text-white">{realtimeStats?.latency_ms ?? 4}ms</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Messenger Quick Card */}
          <div 
            onClick={() => navigate('/messenger')}
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center text-blue-600 group-hover:text-white transition shadow-sm">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Facebook Messenger</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Open your messenger inbox to chat with your friends in real-time with instant message delivery and read receipts.
              </p>
            </div>
            <div className="mt-6 flex items-center space-x-2 text-blue-600 font-semibold text-sm">
              <span>Open Messenger</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Friends Quick Card */}
          <div 
            onClick={() => navigate('/friends')}
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 bg-indigo-50 group-hover:bg-indigo-600 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:text-white transition shadow-sm">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Friends & Requests</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Manage your friendships, accept incoming friend requests, and discover new connections in the network.
              </p>
            </div>
            <div className="mt-6 flex items-center space-x-2 text-indigo-600 font-semibold text-sm">
              <span>Manage Friends</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
