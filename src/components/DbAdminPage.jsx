import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Users, Briefcase, FileCheck, Code, FolderGit2 } from 'lucide-react';
import { fetchAdminTableData } from '../data/api';

export default function DbAdminPage() {
  const [activeTable, setActiveTable] = useState('users');
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDbData = async (table = activeTable) => {
    setIsLoading(true);
    const data = await fetchAdminTableData(table);
    setTableData(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadDbData(activeTable);
  }, [activeTable]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* Header */}
      <div className="glass-card" style={{ padding: '24px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database style={{ width: '28px', height: '28px', color: '#2563eb' }} />
            เครื่องมือตรวจสอบฐานข้อมูลสด (SQLite DB Inspector)
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            ไฟล์ฐานข้อมูลจริง: <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', color: '#2563eb', fontWeight: '700' }}>server/database.sqlite</code>
          </p>
        </div>

        <button
          onClick={() => loadDbData(activeTable)}
          disabled={isLoading}
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem' }}
        >
          <RefreshCw style={{ width: '16px', height: '16px' }} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'กำลังโหลด...' : 'ดึงข้อมูลสดจาก DB'}
        </button>
      </div>

      {/* Table Selector Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTable('users')}
          className={`btn ${activeTable === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '999px', fontSize: '0.8rem' }}
        >
          <Users style={{ width: '15px', height: '15px' }} /> ตาราง users (สมาชิก)
        </button>

        <button
          onClick={() => setActiveTable('jobs')}
          className={`btn ${activeTable === 'jobs' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '999px', fontSize: '0.8rem' }}
        >
          <Briefcase style={{ width: '15px', height: '15px' }} /> ตาราง jobs (ประกาศงาน)
        </button>

        <button
          onClick={() => setActiveTable('applications')}
          className={`btn ${activeTable === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '999px', fontSize: '0.8rem' }}
        >
          <FileCheck style={{ width: '15px', height: '15px' }} /> ตาราง applications (ใบสมัคร)
        </button>

        <button
          onClick={() => setActiveTable('skills')}
          className={`btn ${activeTable === 'skills' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '999px', fontSize: '0.8rem' }}
        >
          <Code style={{ width: '15px', height: '15px' }} /> ตาราง skills (ทักษะ)
        </button>

        <button
          onClick={() => setActiveTable('projects')}
          className={`btn ${activeTable === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '999px', fontSize: '0.8rem' }}
        >
          <FolderGit2 style={{ width: '15px', height: '15px' }} /> ตาราง projects (ผลงาน)
        </button>
      </div>

      {/* Data Table Content */}
      <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            📊 ตาราง `{activeTable}` ({tableData.length} รายการ)
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', background: '#ecfdf5', padding: '2px 10px', borderRadius: '999px' }}>
            ● Live Data Connected
          </span>
        </div>

        {tableData.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
            ยังไม่มีข้อมูลในตาราง `{activeTable}`
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                {Object.keys(tableData[0]).map((col) => (
                  <th key={col} style={{ padding: '10px 12px', whiteSpace: 'nowrap', fontWeight: '800' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {Object.entries(row).map(([col, val], colIdx) => (
                    <td key={colIdx} style={{ padding: '10px 12px', whiteSpace: 'nowrap', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {typeof val === 'object' ? JSON.stringify(val) : String(val || '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
}
