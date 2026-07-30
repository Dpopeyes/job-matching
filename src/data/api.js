const API_BASE = 'http://localhost:3001/api';

// Live Jobs Fetch
export async function fetchJobs() {
  try {
    const res = await fetch(`${API_BASE}/jobs`);
    if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลตำแหน่งงานได้');
    return await res.json();
  } catch (err) {
    console.warn('API Error (Jobs):', err.message);
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

// Add Project to DB
export async function addUserProject(userId, projectData) {
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...projectData })
    });
    return await res.json();
  } catch (err) {
    console.error('API Error (Add Project):', err);
    return null;
  }
}

// Fetch Admin Table Rows
export async function fetchAdminTableData(tableName) {
  try {
    const res = await fetch(`${API_BASE}/admin/tables/${tableName}`);
    if (!res.ok) throw new Error('Fetch admin table failed');
    return await res.json();
  } catch (err) {
    console.warn('API Error (Admin Table):', err);
    return [];
  }
}
