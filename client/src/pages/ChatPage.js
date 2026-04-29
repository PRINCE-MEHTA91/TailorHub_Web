import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const TAILOR_TABS = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'orders', icon: '📋', label: 'Orders' },
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'feedback', icon: '⭐', label: 'Feedback' },
  { id: 'offers', icon: '🔥', label: 'Offers' },
  { id: 'manage', icon: '⚙️', label: 'Manage' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];
const CUSTOMER_TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'tailors', label: 'Tailors', icon: '✂️' },
  { id: 'orders', label: 'Orders', icon: '📦' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

/* ── helper: get cookie by name ── */
function getCookie(name) {
  return document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='))?.split('=')[1] || null;
}

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCustomerId = searchParams.get('customerId');

  /* ── state ── */
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  const messagesEndRef = useRef(null);
  const autoOpenedRef = useRef(null);
  const typingTimerRef = useRef(null);
  const selectedUserRef = useRef(null);
  selectedUserRef.current = selectedUser;

  /* ── scroll ── */
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  /* ── Socket.IO connection ── */
  useEffect(() => {
    const token = getCookie('token');
    const sock = io(API_URL, {
      withCredentials: true,
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    sock.on('connect', () => {
      setConnected(true);
      console.log('✅ Socket connected:', sock.id);
    });
    sock.on('disconnect', () => {
      setConnected(false);
      console.log('🔌 Socket disconnected');
    });
    sock.on('connect_error', (err) => {
      console.error('❌ Socket error:', err.message);
      setConnected(false);
    });

    /* Receive message in real-time */
    sock.on('receive_message', (msg) => {
      const currentUser = selectedUserRef.current;
      const isRelevant = currentUser &&
        ((msg.sender_id === currentUser.id) || (msg.receiver_id === currentUser.id));
      if (isRelevant) {
        setMessages(prev => {
          // Avoid duplicates (optimistic + real)
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      // Refresh sidebar to update last message
      fetchChatUsers(false);
    });

    /* Online users list */
    sock.on('online_users', (userIds) => setOnlineUsers(userIds.map(Number)));

    /* Typing indicators */
    sock.on('typing_start', ({ senderId }) => {
      setTypingUsers(prev => ({ ...prev, [senderId]: true }));
    });
    sock.on('typing_stop', ({ senderId }) => {
      setTypingUsers(prev => { const n = { ...prev }; delete n[senderId]; return n; });
    });

    setSocket(sock);
    return () => sock.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Load chat users from DB (order-filtered) ── */
  const fetchChatUsers = useCallback(async (showLoader = true) => {
    if (showLoader) setLoadingUsers(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/users`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error('fetchChatUsers error', e);
    } finally {
      if (showLoader) setLoadingUsers(false);
    }
  }, []);

  useEffect(() => { fetchChatUsers(); }, [fetchChatUsers]);

  /* ── Fetch user by ID (fallback for first-time chat from Orders page) ── */
  const fetchUserById = useCallback(async (userId) => {
    autoOpenedRef.current = userId; // mark immediately to prevent repeat calls
    try {
      const res = await fetch(`${API_URL}/api/chat/user/${userId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          selectUser(data.user);
        }
      }
    } catch (e) { console.error('fetchUserById error', e); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Auto-open chat from URL param ── */
  useEffect(() => {
    if (!urlCustomerId) return;
    if (autoOpenedRef.current === urlCustomerId) return; // already handled
    if (loadingUsers) return;                           // wait for load to finish

    const found = users.find(u => String(u.id) === String(urlCustomerId));
    if (found) {
      autoOpenedRef.current = urlCustomerId;
      selectUser(found);
    } else {
      // User has orders but no prior chats — fetch directly
      fetchUserById(urlCustomerId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, urlCustomerId, loadingUsers, fetchUserById]);


  /* ── Load message history from DB ── */
  const fetchMessages = useCallback(async (userId) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_URL}/api/chat/${userId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) { console.error('fetchMessages error', e); }
    finally { setLoadingMessages(false); }
  }, []);

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.id);
  }, [selectedUser, fetchMessages]);

  /* ── Search users ── */
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const t = setTimeout(() => {
        fetch(`${API_URL}/api/chat/search-users?query=${searchQuery}`, { credentials: 'include' })
          .then(r => r.ok ? r.json() : { users: [] })
          .then(d => setSearchResults(d.users))
          .catch(() => setSearchResults([]));
      }, 400);
      return () => clearTimeout(t);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  /* ── Select a user ── */
  const selectUser = (u) => {
    setSelectedUser(u);
    setMessages([]);
    setSearchQuery('');
    setSearchResults([]);
    if (!users.find(x => x.id === u.id)) {
      setUsers(prev => [{ ...u, last_message: null }, ...prev]);
    }
  };

  /* ── Send message via Socket.IO ── */
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;

    // Stop typing indicator
    socket.emit('typing_stop', { receiverId: selectedUser.id });
    clearTimeout(typingTimerRef.current);

    socket.emit('send_message', {
      receiverId: selectedUser.id,
      message: newMessage.trim(),
    });
    setNewMessage('');
  };

  /* ── Typing indicator ── */
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedUser) return;
    socket.emit('typing_start', { receiverId: selectedUser.id });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('typing_stop', { receiverId: selectedUser.id });
    }, 1500);
  };

  /* ── Nav ── */
  const handleNavClick = (tabId) => {
    if (tabId === 'chat') return;
    navigate(user?.role === 'tailor' ? '/tailor/dashboard' : '/customer/dashboard', { state: { tab: tabId } });
  };
  const navTabs = user?.role === 'customer' ? CUSTOMER_TABS : TAILOR_TABS;

  const isOnline = (uid) => onlineUsers.includes(Number(uid));
  const isTyping = (uid) => !!typingUsers[uid];

  /* ──────────────────────────── RENDER ──────────────────────────── */
  return (
    <div className="bg-stone-50 min-h-screen flex flex-col font-inter pb-20">
      <Header />

      {/* Connection status badge */}
      <div className={`fixed top-16 right-4 z-50 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-md transition-all ${connected ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-white animate-pulse' : 'bg-white'}`} />
        {connected ? 'Connected' : 'Reconnecting...'}
      </div>

      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6 mt-16 lg:mt-20 h-[calc(100vh-80px)]">

        {/* ── Sidebar ── */}
        <div className={`w-full md:w-1/3 bg-white rounded-3xl shadow-sm border border-stone-200 flex flex-col overflow-hidden ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-stone-800 tracking-tight">Messages</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {connected ? '● Live' : '○ Offline'}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${user?.role === 'tailor' ? 'customers' : 'tailors'}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition"
              />
              <span className="absolute left-3 top-2.5 text-stone-400">🔍</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider">Search Results</p>
                {searchResults.map(u => (
                  <button key={u.id} onClick={() => selectUser(u)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition text-left">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0">
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      {isOnline(u.id) && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-800 truncate">{u.full_name}</p>
                      <p className="text-xs text-stone-500 capitalize">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : loadingUsers ? (
              <div className="flex justify-center py-10">
                <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <span className="text-5xl mb-3">💬</span>
                <p className="text-stone-600 font-bold">No conversations yet</p>
                <p className="text-xs text-stone-400 mt-1">
                  {user?.role === 'tailor'
                    ? 'Customers who place orders will appear here.'
                    : 'Tailors you order from will appear here.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-50">
                {users.map(u => (
                  <button key={u.id} onClick={() => selectUser(u)}
                    className={`w-full flex items-center gap-3 p-4 transition text-left ${selectedUser?.id === u.id ? 'bg-indigo-50 border-r-2 border-indigo-500' : 'hover:bg-stone-50'}`}>
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-800 font-black text-lg flex items-center justify-center border-2 border-white shadow-sm">
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline(u.id) ? 'bg-green-500' : 'bg-stone-300'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-sm font-bold text-stone-800 truncate">{u.full_name}</p>
                        {isOnline(u.id) && <span className="text-[9px] text-green-600 font-bold flex-shrink-0">ONLINE</span>}
                      </div>
                      {isTyping(u.id)
                        ? <p className="text-xs text-indigo-500 font-semibold italic">typing...</p>
                        : <p className="text-xs text-stone-400 truncate">{u.last_message || 'Start a conversation...'}</p>
                      }
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className={`w-full md:w-2/3 bg-white rounded-3xl shadow-sm border border-stone-200 flex flex-col overflow-hidden ${!selectedUser ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {!selectedUser ? (
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-stone-100">💬</div>
              <h3 className="text-xl font-black text-stone-800">Real-Time Chat</h3>
              <p className="text-stone-500 mt-2">Select a conversation to start messaging.</p>
              <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${connected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {connected ? 'Socket.IO Connected — Messages are live' : 'Connecting to real-time server...'}
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-4 bg-white shadow-sm">
                <button onClick={() => setSelectedUser(null)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-600">←</button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                    {selectedUser.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline(selectedUser.id) ? 'bg-green-500' : 'bg-stone-300'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-stone-800">{selectedUser.full_name}</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isOnline(selectedUser.id) ? 'text-green-600' : 'text-stone-400'}`}>
                    {isTyping(selectedUser.id) ? '✍️ typing...' : isOnline(selectedUser.id) ? 'Online' : 'Offline'}
                  </p>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${connected ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                  {connected ? 'Live' : 'Reconnecting'}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
                {loadingMessages ? (
                  <div className="flex justify-center py-10">
                    <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-stone-400 py-10">
                    <p className="text-2xl mb-2">👋</p>
                    <p>No messages yet. Say hello!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isMine = msg.sender_id === user.id;
                      return (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${isMine ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-stone-100 text-stone-800 rounded-bl-none'}`}>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                            <p className={`text-[9px] mt-1 text-right ${isMine ? 'text-indigo-200' : 'text-stone-400'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                    <AnimatePresence>
                      {isTyping(selectedUser.id) && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex justify-start">
                          <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm flex gap-1 items-center">
                            <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-stone-100">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-stone-50"
                  />
                  <button type="submit" disabled={!newMessage.trim() || !connected}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl px-6 font-bold flex items-center justify-center transition shadow-md shadow-indigo-200">
                    ➤
                  </button>
                </form>
                {!connected && <p className="text-xs text-amber-600 mt-1.5 text-center">⚠️ Reconnecting to real-time server...</p>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 ${user?.role === 'tailor' ? 'grid grid-cols-7 border-t border-stone-200' : 'flex border-t border-gray-100'}`}>
        {navTabs.map((tab) => {
          const isActive = tab.id === 'chat';
          if (user?.role === 'tailor') {
            return (
              <button key={tab.id} onClick={() => handleNavClick(tab.id)} className="flex flex-col items-center gap-0.5 py-2.5 transition-all">
                {isActive && <div className="w-5 h-0.5 bg-orange-500 rounded-full mb-0.5" />}
                <span className={`text-xl transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>{tab.icon}</span>
                <span className={`text-[10px] font-bold ${isActive ? 'text-orange-500' : 'text-stone-400'}`}>{tab.label}</span>
              </button>
            );
          }
          return (
            <button key={tab.id} onClick={() => handleNavClick(tab.id)} className="flex-1 flex flex-col items-center justify-center py-3 relative transition-colors">
              {isActive && <motion.div layoutId="customer-tab-indicator" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full" />}
              <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>{tab.icon}</span>
              <span className={`text-xs mt-1 font-medium ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ChatPage;
