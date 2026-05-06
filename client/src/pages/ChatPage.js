import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

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

/* ── helper: format a date label for chat separators ── */
function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/* ── helper: get YYYY-MM-DD key from a date string ── */
function dayKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/* ── UserAvatar: shows profile image or initials fallback ── */
function UserAvatar({ user, size = 'md', isOnlineDot = false, onlineClass = '' }) {
  const sizeClasses = size === 'lg' ? 'w-12 h-12 text-lg' : size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base';
  const dotSize     = size === 'lg' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
  const imgSrc = user?.profile_img
    ? (user.profile_img.startsWith('http') ? user.profile_img : `${API_URL}${user.profile_img}`)
    : null;

  return (
    <div className="relative flex-shrink-0">
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={user?.full_name || 'User'}
          className={`${sizeClasses} rounded-full object-cover border-2 border-white shadow-sm`}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <div
        className={`${sizeClasses} rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-800 font-black flex items-center justify-center border-2 border-white shadow-sm ${imgSrc ? 'hidden' : ''}`}
      >
        {user?.full_name?.charAt(0).toUpperCase()}
      </div>
      {isOnlineDot && (
        <div className={`absolute bottom-0 right-0 ${dotSize} rounded-full border-2 border-white ${onlineClass}`} />
      )}
    </div>
  );
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
  const [activeMenu, setActiveMenu] = useState(null); // msg id with open menu
  const [editingMsg, setEditingMsg] = useState(null);  // { id, text }
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null); // { file, preview, name, type }
  const [uploadingFile, setUploadingFile] = useState(false);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);
  const autoOpenedRef = useRef(null);
  const typingTimerRef = useRef(null);
  const selectedUserRef = useRef(null);
  selectedUserRef.current = selectedUser;

  /* ── scroll ── */
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  /* ── Close emoji picker on outside click ── */
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);

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
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      fetchChatUsers(false);
    });

    /* Real-time delete */
    sock.on('message_deleted', ({ id }) => {
      setMessages(prev => prev.filter(m => m.id !== id));
    });

    /* Real-time edit */
    sock.on('message_updated', (updated) => {
      setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
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

  /* ── Handle file selection ── */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const preview = isImage ? URL.createObjectURL(file) : null;
    setAttachedFile({ file, preview, name: file.name, type: file.type });
    // Reset the input so the same file can be re-selected
    e.target.value = '';
  };

  /* ── Remove attached file ── */
  const removeAttachedFile = () => {
    if (attachedFile?.preview) URL.revokeObjectURL(attachedFile.preview);
    setAttachedFile(null);
  };

  /* ── Send message via Socket.IO (with optional file) ── */
  const handleSend = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedFile) || !selectedUser || !socket) return;

    socket.emit('typing_stop', { receiverId: selectedUser.id });
    clearTimeout(typingTimerRef.current);

    if (attachedFile) {
      setUploadingFile(true);
      try {
        const formData = new FormData();
        formData.append('file', attachedFile.file);
        const res = await fetch(`${API_URL}/api/chat/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          alert('Upload failed: ' + (err.message || 'Unknown error'));
          setUploadingFile(false);
          return;
        }
        const { fileUrl, fileType, fileName } = await res.json();
        socket.emit('send_message', {
          receiverId: selectedUser.id,
          message: newMessage.trim() || '',
          fileUrl,
          fileType,
          fileName,
        });
        removeAttachedFile();
      } catch (err) {
        alert('Upload failed. Please try again.');
      } finally {
        setUploadingFile(false);
      }
    } else {
      socket.emit('send_message', { receiverId: selectedUser.id, message: newMessage.trim() });
    }
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

  /* ── Delete message ── */
  const handleDeleteMsg = async (msgId) => {
    setActiveMenu(null);
    await fetch(`${API_URL}/api/chat/message/${msgId}`, { method: 'DELETE', credentials: 'include' });
  };

  /* ── Start editing ── */
  const handleStartEdit = (msg) => {
    setActiveMenu(null);
    setEditingMsg({ id: msg.id, text: msg.message });
  };

  /* ── Submit edit ── */
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingMsg || !editingMsg.text.trim()) return;
    await fetch(`${API_URL}/api/chat/message/${editingMsg.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: editingMsg.text.trim() }),
    });
    setEditingMsg(null);
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
    <div className="h-screen overflow-hidden flex flex-col bg-stone-50 font-inter">
      <Header />

      {/* Connection status badge */}
      <div className={`fixed top-16 right-4 z-50 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-md transition-all ${connected ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-white animate-pulse' : 'bg-white'}`} />
        {connected ? 'Connected' : 'Reconnecting...'}
      </div>

      <div className="flex-1 overflow-hidden max-w-6xl w-full mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-4" style={{ marginTop: '64px', paddingTop: '16px', paddingBottom: '4px', height: 'calc(100vh - 64px - 65px)' }}>

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
                    <UserAvatar
                      user={u}
                      size="sm"
                      isOnlineDot={isOnline(u.id)}
                      onlineClass={isOnline(u.id) ? 'bg-green-500' : ''}
                    />
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
                    <UserAvatar
                      user={u}
                      size="lg"
                      isOnlineDot={true}
                      onlineClass={isOnline(u.id) ? 'bg-green-500' : 'bg-stone-300'}
                    />
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
                <UserAvatar
                  user={selectedUser}
                  size="md"
                  isOnlineDot={true}
                  onlineClass={isOnline(selectedUser.id) ? 'bg-green-500' : 'bg-stone-300'}
                />
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
                    {messages.map((msg, idx) => {
                      const isMine = msg.sender_id === user.id;
                      const menuOpen = activeMenu === msg.id;
                      const currentDay = dayKey(msg.created_at);
                      const prevDay = idx > 0 ? dayKey(messages[idx - 1].created_at) : null;
                      const showDateSep = idx === 0 || currentDay !== prevDay;
                      return (
                        <React.Fragment key={msg.id}>
                          {/* ── Date separator ── */}
                          {showDateSep && (
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-1 h-px bg-stone-200" />
                              <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full whitespace-nowrap tracking-wide">
                                {formatDateLabel(msg.created_at)}
                              </span>
                              <div className="flex-1 h-px bg-stone-200" />
                            </div>
                          )}
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'} relative`}
                            onClick={() => setActiveMenu(null)}>
                            <div
                              className={`relative max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm cursor-pointer select-none
                                ${isMine ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-stone-100 text-stone-800 rounded-bl-none'}`}
                              onClick={(e) => { e.stopPropagation(); if (isMine) setActiveMenu(menuOpen ? null : msg.id); }}
                            >
                              {editingMsg?.id === msg.id ? (
                                <form onSubmit={handleSubmitEdit} className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
                                  <input
                                    autoFocus
                                    value={editingMsg.text}
                                    onChange={e => setEditingMsg(prev => ({ ...prev, text: e.target.value }))}
                                    className="flex-1 bg-indigo-500 text-white placeholder-indigo-300 rounded-lg px-2 py-1 text-sm outline-none border border-indigo-400 min-w-[120px]"
                                  />
                                  <button type="submit" className="text-xs bg-white text-indigo-700 font-bold px-2 py-1 rounded-lg">Save</button>
                                  <button type="button" onClick={() => setEditingMsg(null)} className="text-xs text-indigo-200">✕</button>
                                </form>
                              ) : (
                                <>
                                  {/* ── File / Image Attachment ── */}
                                  {msg.file_url && (
                                    <div className="mb-1.5">
                                      {msg.file_type?.startsWith('image/') ? (
                                        <a href={`${API_URL}${msg.file_url}`} target="_blank" rel="noreferrer">
                                          <img
                                            src={`${API_URL}${msg.file_url}`}
                                            alt={msg.file_name || 'Image'}
                                            className="max-w-[220px] max-h-[200px] rounded-xl object-cover border border-white/20 shadow cursor-pointer hover:opacity-90 transition"
                                          />
                                        </a>
                                      ) : (
                                        <a
                                          href={`${API_URL}${msg.file_url}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          download={msg.file_name}
                                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                                            isMine
                                              ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                          }`}
                                        >
                                          <span className="text-lg">
                                            {msg.file_type === 'application/pdf' ? '📄' :
                                             msg.file_type?.includes('word') ? '📝' :
                                             msg.file_type?.includes('excel') || msg.file_type?.includes('sheet') ? '📊' :
                                             '📎'}
                                          </span>
                                          <span className="truncate max-w-[150px]">{msg.file_name || 'Attachment'}</span>
                                          <span className="text-xs opacity-70 flex-shrink-0">↓</span>
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  {/* Text part (caption or standalone message) */}
                                  {msg.message && !(!msg.file_url) && msg.file_url && !msg.message.match(/^Attachment$|^[a-zA-Z0-9._\-\s]+\.[a-zA-Z]{2,5}$/) && (
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                  )}
                                  {!msg.file_url && (
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                  )}
                                </>
                              )}
                              <p className={`text-[9px] mt-1 text-right ${isMine ? 'text-indigo-200' : 'text-stone-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {msg.is_edited ? ' · edited' : ''}
                              </p>
                              {/* Context menu */}
                              {isMine && menuOpen && (
                                <div
                                  className="absolute bottom-full mb-1 right-0 bg-white rounded-xl shadow-xl border border-stone-100 z-50 overflow-hidden min-w-[130px]"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => handleStartEdit(msg)}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMsg(msg.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition font-medium"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </React.Fragment>
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
                {/* Attached file preview */}
                {attachedFile && (
                  <div className="mb-3 flex items-center gap-3 p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                    {attachedFile.preview ? (
                      <img src={attachedFile.preview} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-indigo-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl">
                        {attachedFile.type === 'application/pdf' ? '📄' :
                         attachedFile.type?.includes('word') ? '📝' :
                         attachedFile.type?.includes('excel') || attachedFile.type?.includes('sheet') ? '📊' : '📎'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-indigo-800 truncate">{attachedFile.name}</p>
                      <p className="text-xs text-indigo-500">{(attachedFile.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeAttachedFile}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-stone-400 hover:text-red-500 hover:bg-red-50 border border-stone-200 transition text-sm flex-shrink-0"
                    >✕</button>
                  </div>
                )}

                {/* Emoji picker popup */}
                <div className="relative" ref={emojiPickerRef}>
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-2 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden"
                      >
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setNewMessage(prev => prev + emojiData.emoji);
                            setShowEmojiPicker(false);
                          }}
                          skinTonesDisabled
                          searchDisabled={false}
                          height={380}
                          width={320}
                          previewConfig={{ showPreview: false }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="chat-file-input"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <form onSubmit={handleSend} className="flex gap-2 items-center">
                    {/* Emoji toggle button */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-xl transition-all ${
                        showEmojiPicker
                          ? 'bg-indigo-100 text-indigo-600 scale-110'
                          : 'hover:bg-stone-100 text-stone-400 hover:text-stone-600'
                      }`}
                      title="Emoji"
                    >
                      😊
                    </button>

                    {/* Attachment button */}
                    <button
                      type="button"
                      onClick={() => { setShowEmojiPicker(false); fileInputRef.current?.click(); }}
                      className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-lg transition-all ${
                        attachedFile
                          ? 'bg-indigo-100 text-indigo-600 scale-110'
                          : 'hover:bg-stone-100 text-stone-400 hover:text-stone-600'
                      }`}
                      title="Attach image or document"
                      disabled={uploadingFile}
                    >
                      📎
                    </button>

                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleTyping}
                      onFocus={() => setShowEmojiPicker(false)}
                      placeholder={attachedFile ? 'Add a caption (optional)...' : 'Type a message...'}
                      className="flex-1 border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-stone-50"
                    />
                    <button
                      type="submit"
                      disabled={(!newMessage.trim() && !attachedFile) || !connected || uploadingFile}
                      className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl px-5 py-3 font-bold flex items-center justify-center transition shadow-md shadow-indigo-200 min-w-[44px]"
                    >
                      {uploadingFile
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : '➤'}
                    </button>
                  </form>
                </div>
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
