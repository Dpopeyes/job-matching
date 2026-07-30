import React, { useState } from 'react';
import { X, Building, MapPin, DollarSign, Clock, CheckCircle2, Send, Sparkles, AlertCircle } from 'lucide-react';

export default function JobDetailModal({ job, currentUser, onClose, onApplySuccess }) {
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverNote, setCoverNote] = useState('');

  if (!job) return null;

  const handleApply = (e) => {
    e.preventDefault();
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setApplied(true);
      if (onApplySuccess) onApplySuccess(job);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white">
          <div className="flex items-start gap-4">
            <img 
              src={job.logo} 
              alt={job.company} 
              className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="badge badge-primary">{job.type}</span>
                <span className="badge badge-success flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Match {job.matchRate}%
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 leading-snug">{job.title}</h2>
              <div className="flex items-center gap-4 text-sm text-slate-600 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium text-blue-600">
                  <Building className="w-4 h-4" /> {job.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                  <DollarSign className="w-4 h-4" /> {job.salary}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          {/* Overview */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">รายละเอียดตำแหน่งงาน</h3>
            <p className="text-slate-600 leading-relaxed text-sm">{job.description}</p>
          </div>

          {/* Required Skills */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
              ทักษะที่บริษัทกำลังมองหา (Required Skills)
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill, idx) => (
                <span key={idx} className="badge badge-skill text-sm px-3 py-1">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">หน้าที่ความรับผิดชอบ</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Qualifications */}
          {job.qualifications && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">คุณสมบัติผู้สมัคร (เด็กจบใหม่)</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {job.qualifications.map((qual, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800 mb-2">สวัสดิการและสิทธิประโยชน์:</h4>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                {job.benefits.map((b, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 px-3 py-1 rounded-lg">
                    ✨ {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Application Form */}
          <div className="border-t border-slate-200 pt-6">
            {applied ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-emerald-900">ส่งใบสมัครสำเร็จแล้ว!</h4>
                <p className="text-sm text-emerald-700">
                  ระบบได้แนบโปรไฟล์ดิจิทัล ผลงานโครงงาน และคะแนน Skill Match ของคุณส่งให้นายจ้างเรียบร้อยแล้ว
                </p>
                <button
                  onClick={onClose}
                  className="btn btn-secondary mt-3 text-xs"
                >
                  ปิดหน้าต่างนี้
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base">ยื่นใบสมัครออนไลน์ (Skill Portfolio Direct)</h4>
                  {currentUser && (
                    <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-2.5 py-1 rounded-full">
                      ✓ แนบ Skill Profile: {currentUser.name}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ข้อความแนะนำตัวเพิ่มเติมถึง HR (ระบุทักษะหรือโปรเจกต์ที่ภาคภูมิใจ):
                  </label>
                  <textarea
                    rows="3"
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="สวัสดีครับ/ค่ะ มีความสนใจตำแหน่งนี้ และได้ทำโครงงานที่เกี่ยวข้องกับ React/JavaScript..."
                    className="input-field text-sm"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="btn btn-primary"
                  >
                    {isApplying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        กำลังส่งข้อมูล...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> ส่งใบสมัครด้วย Skill Portfolio
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
