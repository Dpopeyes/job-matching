const API_BASE = 'http://localhost:3001/api';

// Live Jobs Fetch
export async function fetchJobs(options = {}) {
  try {
    const { adminView, employerId } = options;
    let url = `${API_BASE}/jobs`;
    const params = [];
    if (adminView) params.push(`adminView=true`);
    if (employerId) params.push(`employerId=${encodeURIComponent(employerId)}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลตำแหน่งงานได้');
    return await res.json();
  } catch (err) {
    console.warn('API Error (Jobs):', err.message);
    return null;
  }
}

// Admin Update Job Approval Status (อนุมัติ / ปฏิเสธงาน)
export async function updateJobApprovalStatus(jobId, approvalStatus) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/approval`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalStatus })
    });
    if (!res.ok) throw new Error('Update job approval failed');
    return await res.json();
  } catch (err) {
    console.error('API Error (Update Job Approval):', err);
    return null;
  }
}

// Admin Fetch All Applications in the System
export async function fetchAdminApplications() {
  try {
    const res = await fetch(`${API_BASE}/applications/admin`);
    if (!res.ok) throw new Error('Failed to fetch admin applications');
    return await res.json();
  } catch (err) {
    console.error('API Error (Admin Fetch Applications):', err);
    return null;
  }
}

// Delete Job API (สำหรับปิดรับสมัครหรือลบประกาศงาน)
export async function deleteJob(jobId) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    console.error('API Error (Delete Job):', err);
    return null;
  }
}

// Update Job API (สำหรับแก้ไขประกาศงาน)
export async function updateJob(jobId, jobData) {
  try {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
    return await res.json();
  } catch (err) {
    console.error('API Error (Update Job):', err);
    return null;
  }
}

// Login API
export async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'เข้าสู่ระบบไม่สำเร็จ' };
    }
    return { success: true, user: data.user, message: data.message };
  } catch (err) {
    console.error('API Error (Login):', err);
    return { success: false, error: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ฐานข้อมูลได้' };
  }
}

// Register API
export async function registerUser(userData) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'สมัครสมาชิกไม่สำเร็จ' };
    }
    return { success: true, user: data.user, message: data.message };
  } catch (err) {
    console.error('API Error (Register):', err);
    return { success: false, error: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ฐานข้อมูลได้' };
  }
}

// Face Login
export async function faceLoginUser() {
  try {
    const res = await fetch(`${API_BASE}/auth/face-login`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: 'การสแกนใบหน้าขัดข้อง' };
  }
}

// Submit Job Application
export async function submitApplication(appData) {
  try {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
    return await res.json();
  } catch (err) {
    console.warn('API Error (Application):', err);
    return null;
  }
}

// Fetch User Applications
export async function fetchUserApplications(userId) {
  try {
    const res = await fetch(`${API_BASE}/applications/user/${userId}`);
    if (!res.ok) throw new Error('Fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('API Error (Fetch Applications):', err);
    return null;
  }
}

// Add Skill to DB
export async function addUserSkill(userId, name, level = 'Intermediate') {
  try {
    const res = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, level })
    });
    return await res.json();
  } catch (err) {
    console.error('API Error (Add Skill):', err);
    return null;
  }
}

// Delete Skill from DB
export async function deleteUserSkill(skillId) {
  try {
    const res = await fetch(`${API_BASE}/skills/${skillId}`, { method: 'DELETE' });
    return await res.json();
  } catch (err) {
    console.error('API Error (Delete Skill):', err);
    return null;
  }
}

// Fetch Employer Applications (ดึงใบสมัครงานของนายจ้าง)
export async function fetchEmployerApplications(employerId) {
  try {
    const res = await fetch(`${API_BASE}/applications/employer/${employerId}`);
    if (!res.ok) throw new Error('Fetch employer applications failed');
    return await res.json();
  } catch (err) {
    console.warn('API Error (Fetch Employer Applications):', err);
    return null;
  }
}

// Update Application Status (อัปเดตสถานะใบสมัครงาน)
export async function updateApplicationStatus(appId, status, interviewDate, interviewNote) {
  try {
    const res = await fetch(`${API_BASE}/applications/${appId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, interviewDate, interviewNote })
    });
    if (!res.ok) throw new Error('Update status failed');
    return await res.json();
  } catch (err) {
    console.error('API Error (Update Status):', err);
    return null;
  }
}

// Fetch Messages for an Application (ดึงข้อความแชท)
export async function fetchMessages(appId) {
  try {
    const res = await fetch(`${API_BASE}/applications/${appId}/messages`);
    if (!res.ok) throw new Error('Fetch messages failed');
    return await res.json();
  } catch (err) {
    console.warn('API Error (Fetch Messages):', err);
    return [];
  }
}

// Send Message (ส่งข้อความแชท)
export async function sendMessage(appId, senderId, senderName, content) {
  try {
    const res = await fetch(`${API_BASE}/applications/${appId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, senderName, content })
    });
    if (!res.ok) throw new Error('Send message failed');
    return await res.json();
  } catch (err) {
    console.error('API Error (Send Message):', err);
    return null;
  }
}

// Fetch Candidate Portfolio (ดึงข้อมูลพอร์ต/ผลงานของผู้สมัคร)
export async function fetchUserPortfolio(userId) {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/portfolio`);
    if (!res.ok) throw new Error('Fetch portfolio failed');
    return await res.json();
  } catch (err) {
    console.warn('API Error (Fetch Portfolio):', err);
    return null;
  }
}

// Update User Profile (อัปเดตข้อมูลผู้ใช้)
export async function updateUserProfile(userId, userData) {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Update user profile failed');
    return await res.json();
  } catch (err) {
    console.error('API Error (Update User Profile):', err);
    return null;
  }
}

// Add User Project (เพิ่มผลงานผู้ใช้)
export async function addUserProject(userId, projectData) {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!res.ok) throw new Error('Add user project failed');
    return await res.json();
  } catch (err) {
    console.error('API Error (Add User Project):', err);
    return null;
  }
}

// Delete User Project (ลบผลงานผู้ใช้)
export async function deleteUserProject(projectId) {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Delete user project failed');
    return await res.json();
  } catch (err) {
    console.error('API Error (Delete User Project):', err);
    return null;
  }
}

// Update User Project (แก้ไขผลงานผู้ใช้)
export async function updateUserProject(projectId, projectData) {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!res.ok) throw new Error('Update user project failed');
    return await res.json();
  } catch (err) {
    console.error('API Error (Update User Project):', err);
    return null;
  }
}
