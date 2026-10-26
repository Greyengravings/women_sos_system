import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getSocket } from '../services/socketService';
import { MessageSquare, Send, X, RefreshCw } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const getEntityId = (entity) => {
  if (entity && typeof entity === 'object') {
    return String(entity._id ?? entity.id ?? '');
  }

  return entity == null ? '' : String(entity);
};

const ChatModal = ({ isOpen, onClose }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const chatBottomRef = useRef(null);

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // Fetch users list
  useEffect(() => {
    if (isOpen && token) {
      fetchUsers();
    }
  }, [isOpen, token]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${API_BASE}/messages/users`, getAuthConfig());
      if (res.data?.data?.users) {
        setUsers(res.data.data.users);
      }
    } catch (err) {
      console.error('Failed to load chat users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch conversation when a user is selected
  useEffect(() => {
    if (selectedUser && token) {
      fetchConversation(selectedUser._id);
    }
  }, [selectedUser, token]);

  const fetchConversation = async (otherUserId) => {
    setLoadingMessages(true);
    try {
      const res = await axios.get(`${API_BASE}/messages/conversation/${otherUserId}`, getAuthConfig());
      if (res.data?.data?.messages) {
        setMessages(res.data.data.messages);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for real-time WebSocket incoming private messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handlePrivateMessage = (data) => {
      console.log('⚡ [WebSocket Chat] receive_private_message:', data);
      const msg = data.message;
      if (!msg) return;

      const senderId = getEntityId(msg.sender);
      const receiverId = getEntityId(msg.receiver);

      if (
        selectedUser &&
        (senderId === getEntityId(selectedUser) || receiverId === getEntityId(selectedUser))
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('receive_private_message', handlePrivateMessage);

    return () => {
      socket.off('receive_private_message', handlePrivateMessage);
    };
  }, [selectedUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;

    const msgText = text.trim();
    setText('');

    try {
      const res = await axios.post(
        `${API_BASE}/messages`,
        { receiverId: selectedUser._id, text: msgText },
        getAuthConfig()
      );

      if (res.data?.data?.message) {
        const newMsg = res.data.data.message;
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="flex h-[620px] w-full max-w-3xl overflow-hidden rounded-[2.2rem] bg-white shadow-2xl ring-1 ring-pink-200/80 dark:bg-slate-900 dark:ring-pink-500/20">

        {/* Left Sidebar: Registered Users / Contacts List */}
        <div className={`w-full sm:w-80 flex flex-col border-r border-pink-100 bg-pink-50/50 dark:border-slate-800 dark:bg-slate-900/90 ${selectedUser ? 'hidden sm:flex' : 'flex'}`}>
          <div className="flex items-center justify-between p-5 border-b border-pink-100 bg-pink-50/80 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-pink-500 p-2 text-white shadow-md">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight dark:text-white">Messages</h3>
                <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                  {selectedUser ? `Chatting with ${selectedUser.name}` : 'Choose someone to message'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchUsers}
              className="rounded-xl bg-white border border-pink-200/80 p-2 text-pink-600 shadow-xs transition-all hover:bg-pink-100 active:scale-95 dark:bg-slate-800 dark:border-slate-700 dark:text-pink-400"
              title="Refresh contacts list"
            >
              <RefreshCw size={14} className={loadingUsers ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loadingUsers ? (
              <div className="flex justify-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-200 border-t-pink-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
                No other registered users available to chat yet.
              </div>
            ) : (
              users.map((u) => {
                const isSelected = selectedUser?._id === u._id;
                return (
                  <button
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full flex items-center gap-3.5 rounded-2xl p-3.5 text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md font-bold'
                        : 'bg-white border border-pink-100/90 hover:border-pink-300 text-slate-900 shadow-xs dark:bg-slate-800/80 dark:border-slate-700/60 dark:text-slate-100'
                    }`}
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl font-black text-sm shadow-inner ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600 border border-pink-200/60 dark:bg-slate-700 dark:text-pink-300 dark:border-slate-600'
                    }`}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-extrabold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{u.name}</span>
                        {u.role === 'admin' && (
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-600 dark:bg-slate-700 dark:text-pink-300'}`}>Admin</span>
                        )}
                      </div>
                      <span className={`block text-[10px] truncate font-semibold mt-0.5 ${isSelected ? 'text-pink-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {u.email}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Active Conversation Area */}
        <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 ${!selectedUser ? 'hidden sm:flex' : 'flex'}`}>

          {/* Header showing Recipient's Name (the person being messaged) */}
          <div className="flex items-center justify-between p-4 border-b border-pink-100 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
            {selectedUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="sm:hidden text-pink-600 font-extrabold text-xs hover:underline"
                >
                  ← Back
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 font-black text-pink-600 border border-pink-200/60 dark:bg-slate-800 dark:text-pink-400 dark:border-slate-700">
                  {selectedUser.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900 tracking-tight dark:text-white">{selectedUser.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider dark:text-emerald-400">Direct message</span>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Select a contact from the list to message</span>
            )}

            <button
              onClick={onClose}
              className="rounded-full bg-pink-50 border border-pink-100 p-2 text-pink-600 hover:bg-pink-100 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-pink-400"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Feed Area (WhatsApp Style Chat Bubbles) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#efeae2] dark:bg-slate-900">
            {!selectedUser ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="rounded-full bg-pink-100/80 p-6 text-pink-500 mb-3 border border-pink-200/60 dark:bg-slate-800 dark:text-pink-400 dark:border-slate-700">
                  <MessageSquare size={36} />
                </div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Real-Time Messaging</h4>
                <p className="text-xs text-slate-600 max-w-xs mt-1 font-medium dark:text-slate-400">
                  Choose a contact from the left list to send and receive instant text messages via WebSockets.
                </p>
              </div>
            ) : loadingMessages ? (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No messages yet. Say hi to {selectedUser.name}! 👋</p>
              </div>
            ) : (
              messages.map((m, index) => {
                const senderId = getEntityId(m.sender);
                const isMe = Boolean(getEntityId(user)) && senderId === getEntityId(user);
                const senderName = isMe
                  ? 'You'
                  : (typeof m.sender === 'object' ? m.sender.name : null) || selectedUser.name;

                return (
                  <div key={m._id || `${senderId}-${m.createdAt}-${index}`} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-[#d9fdd3] text-slate-900 border border-[#c5e9bd] rounded-br-xs dark:bg-[#005c4b] dark:text-white dark:border-[#005c4b]'
                        : 'bg-[#f1f3f5] text-slate-900 border border-slate-200/90 rounded-bl-xs dark:bg-[#202c33] dark:text-slate-100 dark:border-slate-700/60'
                    }`}>
                      <div className={`text-[10px] font-black mb-0.5 ${isMe ? 'text-emerald-700 dark:text-emerald-300' : 'text-pink-600 dark:text-pink-400'}`}>
                        {senderName}
                      </div>
                      <div className="font-semibold text-xs whitespace-pre-wrap">{m.text}</div>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 opacity-80">
                        <span>{new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <span className="text-emerald-600 dark:text-emerald-300 font-black">✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Footer Input Bar */}
          {selectedUser && (
            <form onSubmit={handleSend} className="p-3.5 border-t border-pink-100 bg-white/95 backdrop-blur-md flex items-center gap-2 dark:border-slate-800 dark:bg-slate-900">
              <input
                type="text"
                placeholder={`Message ${selectedUser.name}...`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ color: 'var(--ink, #0f172a)' }}
                className="flex-1 rounded-2xl border border-pink-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-900 caret-pink-600 placeholder:text-slate-400 outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-200/60 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 p-3 text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              >
                <Send size={18} />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default ChatModal;
