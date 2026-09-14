import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, MessageSquare, Users, Search, LogOut, ShieldCheck, UserCheck 
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Facebook Logo & Global Search */}
        <div className="flex items-center space-x-4">
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-indigo-200">
              f
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight hidden sm:inline">facebook</span>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-transparent focus:border-indigo-500 rounded-full text-sm transition focus:outline-none"
            />
          </form>
        </div>

        {/* Center: Facebook Navigation Tabs */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => navigate('/dashboard')}
            className={`p-3 sm:px-4 sm:py-2 rounded-xl flex items-center space-x-2 text-sm font-semibold transition ${
              isActive('/dashboard') 
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Home Dashboard"
          >
            <Home className="w-5 h-5" />
            <span className="hidden lg:inline">Home</span>
          </button>

          <button
            onClick={() => navigate('/messenger')}
            className={`p-3 sm:px-4 sm:py-2 rounded-xl flex items-center space-x-2 text-sm font-semibold transition ${
              isActive('/messenger') 
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Messenger"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden lg:inline">Messenger</span>
          </button>

          <button
            onClick={() => navigate('/friends')}
            className={`p-3 sm:px-4 sm:py-2 rounded-xl flex items-center space-x-2 text-sm font-semibold transition ${
              isActive('/friends') 
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Friends & Requests"
          >
            <Users className="w-5 h-5" />
            <span className="hidden lg:inline">Friends</span>
          </button>
        </div>

        {/* Right: User Profile & Logout */}
        <div className="flex items-center space-x-3">
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-sm text-slate-700 cursor-pointer hover:bg-slate-100 transition"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium hidden sm:inline">{user.name}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-rose-50 hover:bg-rose-100 text-rose-700 p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition border border-rose-200"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </nav>
  );
};
