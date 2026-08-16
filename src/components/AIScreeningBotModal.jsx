import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, CheckCircle2, Sparkles, User, RefreshCw, Briefcase, ChevronRight, Award } from 'lucide-react';

export default function AIScreeningBotModal({ isOpen, onClose, job, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [answers, setAnswers] = useState({
    startDate: '',
    workMode: '',
    expectedSalary: '',
    keyStrength: ''
  });
  const [isCompleted, setIsCompleted] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial bot greeting when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessages([]);
      setStep(0);
      setIsCompleted(false);
      setAnswers({ startDate: '', workMode: '', expectedSalary: '', keyStrength: '' });

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([
          {
            id: 'msg-1',
            sender: 'bot',
            text: `สวัสดีครับคุณ ${currentUser?.name || 'ผู้สมัคร'}! 🤖 ผมคือ "น้อง BlueBot" ผู้ช่วย AI คัดกรองใบสมัครอัตโนมัติจาก ${job?.company || 'บริษัทผู้ว่าจ้าง'}\n\nผมขออนุญาตสอบถามข้อมูลเพิ่มเติม 4 ข้อสั้นๆ เพื่อประเมินความพร้อมเบื้องต้นสำหรับตำแหน่ง "${job?.title || 'ตำแหน่งงานที่สนใจ'}" นะครับ 😊`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        // Trigger first question after a brief delay
        setTimeout(() => {
          askQuestion(1);
        }, 1000);

      }, 800);
    }
  }, [isOpen, job, currentUser]);

  const askQuestion = (qNum) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setStep(qNum);

      let qText = '';
      if (qNum === 1) {
        qText = `📌 ข้อ 1/4: คุณ ${currentUser?.name || ''} สะดวกพร้อมเริ่มงานในตำแหน่งนี้เมื่อไหร่ครับ?`;
      } else if (qNum === 2) {
        qText = `📌 ข้อ 2/4: รูปแบบการทำงานที่คุณพิจารณาแล้วเห็นว่าเหมาะกับสไตล์ของคุณที่สุดคือรูปแบบใดครับ?`;
      } else if (qNum === 3) {
        qText = `📌 ข้อ 3/4: ฐานเงินเดือนที่คุณคาดหวังสำหรับตำแหน่งนี้อยู่ในช่วงใดครับ?`;
      } else if (qNum === 4) {
        qText = `📌 ข้อ 4/4: ทักษะเด่นหรือผลงานที่คุณมั่นใจที่สุดที่จะนำมาใช้ในงานนี้คืออะไรครับ?`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-q-${qNum}-${Date.now()}`,
          sender: 'bot',
          text: qText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 900);
  };

  const handleSendUserMessage = (userText) => {
    if (!userText.trim()) return;

    const newMsg = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Save answer based on current step
    const currentStep = step;
    let updatedAnswers = { ...answers };

    if (currentStep === 1) updatedAnswers.startDate = userText;
    else if (currentStep === 2) updatedAnswers.workMode = userText;
    else if (currentStep === 3) updatedAnswers.expectedSalary = userText;
    else if (currentStep === 4) updatedAnswers.keyStrength = userText;

    setAnswers(updatedAnswers);

    // Proceed to next step or complete
    if (currentStep < 4) {
      askQuestion(currentStep + 1);
    } else {
      // Finalize Screening
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setIsCompleted(true);
        setStep(5);

        setMessages(prev => [
          ...prev,
          {
            id: `msg-final-${Date.now()}`,
            sender: 'bot',
            text: `🎉 ขอบคุณมากครับคุณ ${currentUser?.name || ''}! ผมได้ทำการวิเคราะห์ข้อมูลคำตอบของคุณ และจัดทำ "รายงานสรุปความพร้อมใบสมัคร (AI Readiness Report)" ส่งตรงถึงฝ่าย HR ของ ${job?.company || 'องค์กร'} เรียบร้อยแล้วครับ! ✨`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 1200);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }}
    >
      <div 
        className="animate-fade-in"
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '650px',
          height: '90vh',
          maxHeight: '720px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Header */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
            padding: '18px 24px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#ffffff', color: '#4338ca', padding: '10px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }}>
              <Bot style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🤖 น้อง BlueBot <span style={{ fontSize: '0.7rem', background: '#22c55e', color: '#ffffff', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>AI Online</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#c7d2fe', margin: 0, fontWeight: '500' }}>
                ผู้ช่วยคัดกรองใบสมัครอัตโนมัติ 24 ชม. — {job?.company || 'BlueHouse'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              transition: 'all 0.2s'
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div 
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: '10px'
              }}
            >
              {msg.sender === 'bot' && (
                <div style={{ background: '#312e81', color: '#ffffff', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', shrink: 0, marginTop: '4px' }}>
                  <Bot style={{ width: '18px', height: '18px' }} />
                </div>
              )}

              <div style={{ maxWidth: '82%' }}>
                <div
                  style={{
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                    boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 2px 8px rgba(15, 23, 42, 0.05)',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0'
                  }}
                >
                  {msg.text}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic', paddingLeft: '44px' }}>
              <Sparkles style={{ width: '14px', height: '14px', color: '#7c3aed', animation: 'spin 2s linear infinite' }} />
              น้อง BlueBot กำลังพิมพ์ข้อความ...
            </div>
          )}

          {/* Quick Option Buttons for Step Questions */}
          {!isTyping && !isCompleted && step === 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '44px', marginTop: '4px' }}>
              {['⚡ เริ่มงานได้ทันที', '📅 ภายใน 2 สัปดาห์', '🗓️ ภายใน 1 เดือน'].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendUserMessage(opt)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #7c3aed',
                    color: '#7c3aed',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 6px rgba(124,58,237,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#7c3aed';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#7c3aed';
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {!isTyping && !isCompleted && step === 2 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '44px', marginTop: '4px' }}>
              {['🏢 เข้าออฟฟิศ (On-site)', '🏡 Work from Home (WFH)', '🔄 แบบผสม (Hybrid)'].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendUserMessage(opt)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #2563eb',
                    color: '#2563eb',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2563eb';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#2563eb';
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {!isTyping && !isCompleted && step === 3 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '44px', marginTop: '4px' }}>
              {['ตามโครงสร้างบริษัท', '25,000 - 35,000 บาท', '35,000 - 50,000 บาท'].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendUserMessage(opt)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #059669',
                    color: '#059669',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#059669';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#059669';
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {!isTyping && !isCompleted && step === 4 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '44px', marginTop: '4px' }}>
              {['ทักษะการเขียนโปรแกรม & Problem Solving', 'ทักษะการื่อสารและการทำงานเป็นทีม', 'การเรียนรู้เทคโนโลยีใหม่ๆ ได้รวดเร็ว'].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendUserMessage(opt)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #d97706',
                    color: '#d97706',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#d97706';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#d97706';
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* AI Screening Summary Report Card when completed */}
          {isCompleted && (
            <div 
              className="animate-fade-in"
              style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
                border: '1px solid #86efac',
                borderRadius: '20px',
                padding: '20px',
                marginTop: '10px',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.12)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#065f46', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award style={{ width: '18px', height: '18px', color: '#16a34a' }} /> รายงานผลการคัดกรองเบื้องต้น (AI Screening Summary)
                </h4>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', background: '#16a34a', color: '#ffffff', padding: '3px 10px', borderRadius: '999px' }}>
                  98% High Readiness 🎯
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', color: '#334155' }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '600' }}>⚡ วันพร้อมเริ่มงาน</div>
                  <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{answers.startDate || 'เริ่มงานได้ทันที'}</div>
                </div>

                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '600' }}>💻 รูปแบบการทำงาน</div>
                  <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{answers.workMode || 'ตามตกลง'}</div>
                </div>

                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '600' }}>💰 เงินเดือนที่คาดหวัง</div>
                  <div style={{ fontWeight: '800', color: '#059669', marginTop: '2px' }}>{answers.expectedSalary || 'ตามโครงสร้างบริษัท'}</div>
                </div>

                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '600' }}>🌟 จุดเด่นหลัก</div>
                  <div style={{ fontWeight: '800', color: '#1d4ed8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{answers.keyStrength || 'ทักษะเฉพาะสายงาน'}</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '16px', fontSize: '0.85rem', padding: '10px', background: 'linear-gradient(135deg, #16a34a, #059669)' }}
              >
                <CheckCircle2 style={{ width: '16px', height: '16px' }} /> ปิดหน้าต่างและรอการติดต่อกลับจาก HR
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        {!isCompleted && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendUserMessage(inputText);
            }}
            style={{
              padding: '14px 20px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="พิมพ์คำตอบของคุณที่นี่..."
              disabled={isTyping}
              className="input-field"
              style={{ flex: 1, padding: '10px 16px', fontSize: '0.85rem' }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="btn btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #312e81, #4338ca)' }}
            >
              <Send style={{ width: '16px', height: '16px' }} /> ส่ง
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
