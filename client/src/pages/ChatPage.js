import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const ChatPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchChatUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id);
            // Polling for new messages every 5 seconds
            const interval = setInterval(() => {
                fetchMessages(selectedUser.id, false);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (searchQuery.trim().length > 2) {
            const delayDebounceFn = setTimeout(() => {
                fetch(`${API_URL}/api/chat/search-users?query=${searchQuery}`, { credentials: 'include' })
                    .then(res => res.ok ? res.json() : { users: [] })
                    .then(data => setSearchResults(data.users))
                    .catch(() => setSearchResults([]));
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const fetchChatUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/chat/users`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch chat users', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchMessages = async (userId, showLoading = true) => {
        if (showLoading) setLoadingMessages(true);
        try {
            const res = await fetch(`${API_URL}/api/chat/${userId}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            if (showLoading) setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const messageText = newMessage.trim();
        setNewMessage('');
        
        // Optimistic UI update
        const optimisticMsg = {
            id: Date.now(),
            sender_id: user.id,
            receiver_id: selectedUser.id,
            message: messageText,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const res = await fetch(`${API_URL}/api/chat/${selectedUser.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ message: messageText })
            });
            if (res.ok) {
                // Refresh chat users to update the last message
                fetchChatUsers();
            } else {
                // Handle failure
                console.error('Failed to send message');
                fetchMessages(selectedUser.id); // Revert optimistic update
            }
        } catch (error) {
            console.error('Failed to send message', error);
            fetchMessages(selectedUser.id);
        }
    };

    const selectUser = (u) => {
        setSelectedUser(u);
        setSearchQuery('');
        setSearchResults([]);
        
        // Add to users list if not already there
        if (!users.find(user => user.id === u.id)) {
            setUsers(prev => [{ ...u, last_message: null }, ...prev]);
        }
    };

    return (
        <div className="bg-stone-50 min-h-screen flex flex-col font-inter">
            <Header />
            
            <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6 mt-16 lg:mt-20 h-[calc(100vh-80px)]">
                
                {/* Users Sidebar */}
                <div className={`w-full md:w-1/3 bg-white rounded-3xl shadow-sm border border-stone-200 flex flex-col overflow-hidden ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-5 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
                        <h2 className="text-xl font-black text-stone-800 mb-4 tracking-tight">Messages</h2>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={`Search ${user?.role === 'tailor' ? 'customers' : 'tailors'}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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
                                    <button 
                                        key={u.id}
                                        onClick={() => selectUser(u)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0">
                                            {u.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-stone-800 truncate">{u.full_name}</p>
                                            <p className="text-xs text-stone-500 truncate capitalize">{u.role}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : loadingUsers ? (
                            <div className="flex justify-center py-10">
                                <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <span className="text-4xl mb-3">💬</span>
                                <p className="text-stone-500 font-medium">No messages yet.</p>
                                <p className="text-xs text-stone-400 mt-1">Search for a {user?.role === 'tailor' ? 'customer' : 'tailor'} to start a conversation.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-stone-50">
                                {users.map(u => (
                                    <button 
                                        key={u.id}
                                        onClick={() => selectUser(u)}
                                        className={`w-full flex items-center gap-3 p-4 transition text-left ${selectedUser?.id === u.id ? 'bg-indigo-50' : 'hover:bg-stone-50'}`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-800 font-black text-lg flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
                                                {u.full_name?.charAt(0).toUpperCase()}
                                            </div>
                                            {/* Online status dot - placeholder */}
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <p className="text-sm font-bold text-stone-800 truncate">{u.full_name}</p>
                                            </div>
                                            <p className="text-xs text-stone-500 truncate">{u.last_message || 'Start a conversation...'}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`w-full md:w-2/3 bg-white rounded-3xl shadow-sm border border-stone-200 flex flex-col overflow-hidden ${!selectedUser ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                    {!selectedUser ? (
                        <div className="text-center p-8">
                            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-stone-100 shadow-inner">
                                💬
                            </div>
                            <h3 className="text-xl font-black text-stone-800">Your Messages</h3>
                            <p className="text-stone-500 mt-2">Select a conversation or start a new one.</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-4 bg-white z-10 shadow-sm">
                                <button 
                                    onClick={() => setSelectedUser(null)}
                                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-600"
                                >
                                    ←
                                </button>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0">
                                    {selectedUser.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-black text-stone-800">{selectedUser.full_name}</h3>
                                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Online</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
                                {loadingMessages ? (
                                    <div className="flex justify-center py-10">
                                        <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-stone-400 py-10">
                                        <p>No messages yet. Say hello! 👋</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((msg, i) => {
                                            const isMine = msg.sender_id === user.id;
                                            return (
                                                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    <div 
                                                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                                                            isMine 
                                                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                                                : 'bg-white border border-stone-100 text-stone-800 rounded-bl-none'
                                                        }`}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                                        <p className={`text-[9px] mt-1 text-right ${isMine ? 'text-indigo-200' : 'text-stone-400'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-white border-t border-stone-100">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-stone-50"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl px-6 font-bold flex items-center justify-center transition shadow-md shadow-indigo-200"
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
