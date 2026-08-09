import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, ChevronLeft, User, Clock, Building } from 'lucide-react';
import { fetchMessages, sendMessage } from '../data/api';

export default function HotChat({ 
  currentUser, 
  applications = [], 
  activeChatApp, 
  setActiveChatApp, 
  isOpen, 
  setIsOpen 
}) {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  
  const isEmployer = currentUser?.role === 'employer';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages]);

  // Poll messages for active chat application
  useEffect(() => {
    if (!activeChatApp || !isOpen) {
      setChatMessages([]);
      return;
    }

    const loadMessages = async () => {
      const msgs = await fetchMessages(activeChatApp.id);
      if (msgs) {
        setChatMessages(msgs);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);

    return () => clearInterval(interval);
  }, [activeChatApp, isOpen]);

  // Poll for unread/new messages on all applications (for notification count)
  useEffect(() => {
    if (!currentUser || isOpen) return;

    const checkAllMessages = async () => {
      const counts = {};
      for (const app of applications) {
        const msgs = await fetchMessages(app.id);
        if (msgs && msgs.length > 0) {
          // Count messages that are not sent by me as unread if they are recent
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.senderId !== currentUser.id) {
            counts[app.id] = true; // Mark that this application has active unread messages
          }
        }
      }
      setUnreadCounts(counts);
    };

    checkAllMessages();
    const interval = setInterval(checkAllMessages, 5000); // Check notifications every 5s

    return () => clearInterval(interval);
  }, [applications, currentUser, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChatApp || !currentUser) return;

    setIsSending(true);
    const content = newMessageText.trim();
    setNewMessageText('');

    const msg = await sendMessage(
      activeChatApp.id,
      currentUser.id,
      currentUser.name,
      content
    );

    if (msg) {
      setChatMessages(prev => [...prev, msg]);
    }
    setIsSending(false);
  };

  // If user is not logged in, don't show the chat widget at all
  if (!currentUser) return null;

  const totalUnread = Object.keys(unreadCounts).length;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 🔮 Chat Floating Panel */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            bottom: '76px',
            right: 0,
            width: '380px',
            height: '520px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.22)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div 
            style={{ 
              padding: '16px 20px', 
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', 
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeChatApp && (
                <button 
                  onClick={() => setActiveChatApp(null)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#ffffff', 
                    cursor: 'pointer', 
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ChevronLeft style={{ width: '22px', height: '22px' }} />
                </button>
              )}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare style={{ width: '16px', height: '16px' }} /> HotChat Online
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#bfdbfe', margin: '2px 0 0', fontWeight: '500' }}>
                  {activeChatApp 
                    ? (isEmployer ? `คุยกับ: ${activeChatApp.applicantName}` : `บริษัท: ${activeChatApp.company}`)
                    : 'ห้องแชทตำแหน่งงาน'
                  }
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              style={{ 
                background: 'rgba(255, 255, 255, 0.15)', 
                border: 'none', 
                color: '#ffffff', 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer' 
              }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          {/* Body Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc', overflow: 'hidden' }}>
            
            {activeChatApp ? (
              /* ================== VIEW 1: ACTIVE CONVERSATION ================== */
              <>
                {/* Job context bar */}
                <div style={{ padding: '8px 16px', background: '#eff6ff', borderBottom: '1px solid #dbeafe', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e40af', fontWeight: '700' }}>
                  <Building style={{ width: '12px', height: '12px' }} /> งาน: {activeChatApp.jobTitle}
                </div>

                {/* Messages list */}
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', margin: 'auto', color: '#94a3b8' }}>
                      <MessageSquare style={{ width: '36px', height: '36px', color: '#cbd5e1', margin: '0 auto 6px' }} />
                      <p style={{ fontSize: '0.8rem', margin: 0 }}>ทักทายโต้ตอบกันที่นี่ได้เลยครับ</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div 
                          key={msg.id} 
                          style={{ 
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <span style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px', fontWeight: '600' }}>
                            {isMe ? 'คุณ' : msg.senderName}
                          </span>
                          <div 
                            style={{ 
                              padding: '8px 14px', 
                              borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px', 
                              background: isMe ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#ffffff', 
                              color: isMe ? '#ffffff' : '#1e293b',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              lineHeight: 1.35,
                              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                              border: isMe ? 'none' : '1px solid #e2e8f0',
                              wordBreak: 'break-word'
                            }}
                          >
                            {msg.content}
                          </div>
                          <span style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '2px' }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', background: '#ffffff' }}>
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="พิมพ์ข้อความของคุณ..."
                    style={{ 
                      flex: 1, 
                      padding: '10px 16px', 
                      borderRadius: '999px', 
                      border: '1px solid #cbd5e1', 
                      outline: 'none', 
                      fontSize: '0.8rem',
                      background: '#f8fafc'
                    }}
                    disabled={isSending}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessageText.trim()}
                    style={{ 
                      width: '38px', 
                      height: '38px', 
                      borderRadius: '50%', 
                      background: newMessageText.trim() ? '#2563eb' : '#cbd5e1', 
                      color: '#ffffff', 
                      border: 'none', 
                      cursor: newMessageText.trim() ? 'pointer' : 'default',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: newMessageText.trim() ? '0 4px 8px rgba(37, 99, 235, 0.25)' : 'none'
                    }}
                  >
                    <Send style={{ width: '14px', height: '14px' }} />
                  </button>
                </form>
              </>
            ) : (
              /* ================== VIEW 2: CONVERSATIONS LIST ================== */
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', margin: '0 0 10px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  บทสนทนาที่กำลังใช้งาน ({applications.length})
                </h5>
                {applications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
                    <MessageSquare style={{ width: '32px', height: '32px', color: '#cbd5e1', margin: '0 auto 10px' }} />
                    <p style={{ fontSize: '0.8rem', margin: 0 }}>ไม่มีประวัติการสมัครงานเพื่อเริ่มพูดคุยในขณะนี้</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {applications.map((app) => {
                      const hasUnread = unreadCounts[app.id];
                      return (
                        <div
                          key={app.id}
                          onClick={() => setActiveChatApp(app)}
                          style={{
                            background: hasUnread ? '#eff6ff' : '#ffffff',
                            border: hasUnread ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {isEmployer ? app.applicantName : app.company}
                              </span>
                              {hasUnread && (
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }}></span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              งาน: {app.jobTitle}
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <span style={{ 
                              fontSize: '0.65rem', 
                              fontWeight: '700', 
                              color: app.status?.includes('ผ่าน') ? '#047857' : app.status?.includes('นัด') ? '#1d4ed8' : '#475569',
                              background: app.status?.includes('ผ่าน') ? '#ecfdf5' : app.status?.includes('นัด') ? '#eff6ff' : '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              whiteSpace: 'nowrap'
                            }}>
                              {app.status || 'รอพิจารณา'}
                            </span>
                            <span style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Clock style={{ width: '10px', height: '10px' }} /> {app.applyDate}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* 🚀 Chat Bubble Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          position: 'relative'
        }}
        title="HotChat Online"
      >
        <MessageSquare style={{ width: '26px', height: '26px' }} />
        {totalUnread > 0 && (
          <span 
            style={{ 
              position: 'absolute', 
              top: '-4px', 
              right: '-4px', 
              background: '#ef4444', 
              color: '#ffffff', 
              fontSize: '0.7rem', 
              fontWeight: '800', 
              borderRadius: '999px', 
              padding: '2px 6px',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {totalUnread}
          </span>
        )}
      </button>

      {/* Keyframe animation injected inline */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

    </div>
  );
}
