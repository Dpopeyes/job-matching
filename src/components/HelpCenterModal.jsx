import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Bot, X, Send, ShieldCheck, Sparkles, MessageSquare, CheckCircle2, Headphones, AlertCircle, ExternalLink, ChevronRight } from 'lucide-react';

export default function HelpCenterModal({ currentUser, onNavigateAdmin, onNavigateProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveAdminMode, setIsLiveAdminMode] = useState(false);
  const [adminReplyCount, setAdminReplyCount] = useState(0);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial HelpBot greeting when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([
          {
            id: 'help-init-1',
            sender: 'bot',
            text: `สวัสดีครับคุณ ${currentUser?.name || 'สมาชิก BlueHouse'}! 🎧 ผมคือ "HelpBot" ผู้ช่วยตอบคำถามพบบ่อย 24 ชั่วโมงจากศูนย์ช่วยเหลือ BlueHouse Jobs\n\nยินดีให้บริการครับ! คุณสามารถเลือกหัวข้อที่ต้องการสอบถามด้านล่างนี้ได้เลยครับ 👇`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 600);
    }
  }, [isOpen, currentUser]);

  const handleFAQClick = (faqKey, questionText, answerText) => {
    // Add user question message
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botMsg = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  const handleTransferToLiveAdmin = () => {
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: '💬 ต้องการติดต่อคุยกับแอดมินผู้ดูแลระบบตัวจริง (Live Admin)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setIsLiveAdminMode(true);

      const transferMsg = {
        id: `b-transfer-${Date.now()}`,
        sender: 'bot',
        text: `รับทราบครับ! 🛡️ ผมได้ส่งเรื่องโอนสายการสนทนาไปยัง **"ผู้ดูแลระบบ (Live Admin Support)"** เรียบร้อยแล้ว\n\n🟢 สถานะ: แอดมินได้รับแจ้งเตือนแล้ว และกำลังเข้าสู่ห้องแชทเพื่อโต้ตอบกับคุณ ${currentUser?.name || 'สมาชิก'} ในขณะนี้ครับ คุณสามารถพิมพ์คำถามหรือแจ้งปัญหาไว้ได้เลยครับ`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, transferMsg]);

      // Simulate live Admin response after 3 seconds for demo
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setAdminReplyCount(prev => prev + 1);
          setMessages(prev => [
            ...prev,
            {
              id: `admin-reply-${Date.now()}`,
              sender: 'admin',
              text: `สวัสดีครับคุณ ${currentUser?.name || 'สมาชิก'}! 🛡️ ผม "แอดมินระบบ BlueHouse" เข้ามาดูแลห้องแชทแล้วครับ มีเรื่องใดให้ผมช่วยเหลือหรือตรวจสอบเพิ่มเติมแจ้งไว้ได้เลยครับ!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 1500);
      }, 2500);

    }, 1000);
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    if (isLiveAdminMode) {
      // Simulate Admin reply back
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `admin-reply-${Date.now()}`,
            sender: 'admin',
            text: `รับทราบข้อความ "${text}" ครับ แอดมินกำลังดำเนินการตรวจสอบข้อมูลในระบบ SQLite ให้เรียบร้อยครับ ขอบคุณที่แจ้งเรื่องเข้ามาครับ!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 1800);
    } else {
      // HelpBot Default Auto Reply
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `bot-reply-${Date.now()}`,
            sender: 'bot',
            text: `ขอบคุณสำหรับคำถามครับ หากคำตอบในปุ่มหัวข้อด้านบนยังไม่ครอบคลุม คุณสามารถกดปุ่ม **"💬 คุยกับแอดมินตัวจริง"** เพื่อให้ HelpBot โอนแชทไปยังแอดมินได้ทันทีครับ`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 900);
    }
  };

  return (
    <>
      {/* Floating Help Center Button Positioned RIGHT ABOVE the Chat Floating Button */}
      <div 
        style={{
          position: 'fixed',
          bottom: '92px', // Right above the 24px chat button
          right: '24px',
          zIndex: 1000
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#ffffff',
            border: '3px solid #ffffff',
            boxShadow: '0 8px 20px rgba(124, 58, 237, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative'
          }}
          title="ศูนย์ช่วยเหลือ Grab-Style HelpBot & คุยกับแอดมิน"
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {isOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Headphones style={{ width: '24px', height: '24px' }} />}
          
          {/* Active Help Notification Badge */}
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: '#22c55e',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: '800',
              borderRadius: '999px',
              padding: '2px 6px',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
            }}
          >
            24h
          </span>
        </button>
      </div>

      {/* Help Center Grab-Style Chatbot Modal Popup */}
      {isOpen && (
        <div 
          className="animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '160px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '540px',
            maxHeight: 'calc(100vh - 180px)',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
            border: '1px solid #e2e8f0',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div 
            style={{
              background: isLiveAdminMode 
                ? 'linear-gradient(135deg, #15803d 0%, #166534 100%)'
                : 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)',
              padding: '16px 20px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#ffffff', color: isLiveAdminMode ? '#166534' : '#6d28d9', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isLiveAdminMode ? <ShieldCheck style={{ width: '20px', height: '20px' }} /> : <Headphones style={{ width: '20px', height: '20px' }} />}
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isLiveAdminMode ? '🛡️ Live Admin Online' : '🎧 ศูนย์ช่วยเหลือ HelpBot'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#e9d5ff', fontWeight: '500' }}>
                  {isLiveAdminMode ? 'สนทนากับผู้ดูแลระบบสด' : 'ตอบคำถามอัตโนมัติ 24 ชม.'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* Chat Body Messages */}
          <div 
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: '8px'
                }}
              >
                {msg.sender !== 'user' && (
                  <div 
                    style={{
                      background: msg.sender === 'admin' ? '#15803d' : '#6d28d9',
                      color: '#ffffff',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shrink: 0,
                      marginTop: '2px',
                      fontSize: '0.75rem',
                      fontWeight: '800'
                    }}
                  >
                    {msg.sender === 'admin' ? '🛡️' : '🎧'}
                  </div>
                )}

                <div style={{ maxWidth: '82%' }}>
                  <div
                    style={{
                      background: msg.sender === 'user' ? '#7c3aed' : (msg.sender === 'admin' ? '#f0fdf4' : '#ffffff'),
                      color: msg.sender === 'user' ? '#ffffff' : (msg.sender === 'admin' ? '#14532d' : '#0f172a'),
                      border: msg.sender === 'user' ? 'none' : (msg.sender === 'admin' ? '1px solid #bbf7d0' : '1px solid #e2e8f0'),
                      padding: '10px 14px',
                      borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: '0.825rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                    }}
                  >
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.75rem', paddingLeft: '36px' }}>
                <Sparkles style={{ width: '12px', height: '12px', color: '#7c3aed' }} /> กำลังพิมพ์ข้อความ...
              </div>
            )}

            {/* Grab-Style FAQ Category Quick Buttons */}
            {!isLiveAdminMode && !isTyping && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>
                  💡 เลือกหัวข้อคำถามพบบ่อย (FAQ):
                </div>

                <button
                  onClick={() => handleFAQClick('match', '🎯 วิธีการคำนวณ Match Rate %', '📌 ระบบจะคำนวณความเข้ากันได้ไดนามิก (15%-99%) จาก 2 ส่วนหลัก:\n1. ทักษะเฉพาะสายงาน (60%)\n2. สาขาวิชาของผู้สมัคร (40%)\n\nหากทักษะและสาขาตรงกับประกาศงาน เปอร์เซ็นต์จะพุ่งสูง 85%-99% ทันทีครับ!')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '8px 12px', borderRadius: '10px', textAlign: 'left', background: '#ffffff', border: '1px solid #e2e8f0', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>🎯 วิธีการคำนวณ Match Rate %</span>
                  <ChevronRight style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                </button>

                <button
                  onClick={() => handleFAQClick('post', '🏢 วิธีการโพสต์ประกาศงาน (นายจ้าง)', '📌 สมาชิกสิทธิ์นายจ้างสามารถกดปุ่ม "➕ โพสต์ประกาศรับสมัครงาน" บนหน้าหลัก ระบุตำแหน่ง เงินเดือน ทักษะ และรายละเอียด จากนั้นกดบันทึก ประกาศงานจะอนุมัติพร้อมเปิดรับสมัครทันทีครับ!')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '8px 12px', borderRadius: '10px', textAlign: 'left', background: '#ffffff', border: '1px solid #e2e8f0', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>🏢 วิธีการโพสต์งาน (สำหรับนายจ้าง)</span>
                  <ChevronRight style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                </button>

                <button
                  onClick={() => handleFAQClick('profile', '🎓 วิธีการแก้ไขรูปและพอร์ตโฟลิโอ', '📌 คุณสามารถไปที่เมนู "โปรไฟล์ & ผลงาน" กดปุ่มแก้ไขรูปโปรไฟล์ เพิ่มรายการทักษะ หรือกดปุ่ม "+ เพิ่มผลงานโครงการใหม่" เพื่อเพิ่มรูปและลิงก์ Demo ผลงานได้เลยครับ!')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '8px 12px', borderRadius: '10px', textAlign: 'left', background: '#ffffff', border: '1px solid #e2e8f0', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>🎓 วิธีแก้ไขโปรไฟล์ & พอร์ตโฟลิโอ</span>
                  <ChevronRight style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                </button>

                {/* Grab-Style Live Admin Handoff Button */}
                <button
                  onClick={handleTransferToLiveAdmin}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '6px',
                    boxShadow: '0 4px 10px rgba(21, 128, 61, 0.25)'
                  }}
                >
                  <MessageSquare style={{ width: '15px', height: '15px' }} /> 💬 ติดต่อคุยกับแอดมินตัวจริง (Live Admin)
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            style={{
              padding: '12px 14px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isLiveAdminMode ? 'พิมพ์ข้อความคุยกับแอดมิน...' : 'พิมพ์คำถามข้อสงสัย...'}
              disabled={isTyping}
              className="input-field"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="btn btn-primary"
              style={{ padding: '8px 14px', fontSize: '0.8rem', background: isLiveAdminMode ? '#15803d' : '#7c3aed' }}
            >
              <Send style={{ width: '14px', height: '14px' }} />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
