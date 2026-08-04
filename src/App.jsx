import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import ApplicationsPage from './components/ApplicationsPage';
import JobDetailPage from './components/JobDetailPage';
import { MOCK_JOBS, MOCK_APPLICATIONS } from './data/mockData';
import { fetchJobs, deleteJob, loginUser, submitApplication, fetchUserApplications } from './data/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // 1. User Session Persistence via localStorage (ไม่ต้องออกจากระบบเมื่อรีเฟรช)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('app_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [selectedJob, setSelectedJob] = useState(null);

  // 2. Jobs Persistence via localStorage + SQLite DB
  const [jobs, setJobs] = useState(() => {
    try {
      const savedJobs = localStorage.getItem('app_jobs_data');
      return savedJobs ? JSON.parse(savedJobs) : MOCK_JOBS;
    } catch (e) {
      return MOCK_JOBS;
    }
  });

  const [applications, setApplications] = useState(MOCK_APPLICATIONS);

  // Sync Current User with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('app_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('app_current_user');
    }
  }, [currentUser]);

  // Sync Jobs with localStorage
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      localStorage.setItem('app_jobs_data', JSON.stringify(jobs));
    }
  }, [jobs]);

  // Load latest jobs from SQLite DB Server
  const loadJobsData = async () => {
    const dbJobs = await fetchJobs();
    if (dbJobs && dbJobs.length > 0) {
      setJobs(prevJobs => {
        // Merge DB jobs with any local newly posted jobs
        const existingIds = new Set(dbJobs.map(j => j.id));
        const localCustomJobs = prevJobs.filter(j => !existingIds.has(j.id));
        const merged = [...localCustomJobs, ...dbJobs];
        localStorage.setItem('app_jobs_data', JSON.stringify(merged));
        return merged;
      });
    }
  };

  useEffect(() => {
    async function loadData() {
      await loadJobsData();
      if (currentUser?.id) {
        const dbApps = await fetchUserApplications(currentUser.id);
        if (dbApps && dbApps.length > 0) {
          setApplications(dbApps);
        }
      }
    }
    loadData();
  }, [currentUser?.id]);

  // Add new job posted by Employer instantly for everyone
  const handleAddNewJob = (newJob) => {
    setJobs(prevJobs => {
      const updated = [newJob, ...prevJobs.filter(j => j.id !== newJob.id)];
      localStorage.setItem('app_jobs_data', JSON.stringify(updated));
      return updated;
    });
  };

  // Delete job for Employer
  const handleDeleteJob = async (jobId) => {
    await deleteJob(jobId);
    setJobs(prevJobs => {
      const updated = prevJobs.filter(j => j.id !== jobId);
      localStorage.setItem('app_jobs_data', JSON.stringify(updated));
      return updated;
    });
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setActiveTab('job-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplySuccess = async (job) => {
    const appData = {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      userId: currentUser?.id || 'user-001',
      coverNote: 'ยื่นผ่านระบบสมัครงาน'
    };

    await submitApplication(appData);

    const newApp = {
      id: `app-${Date.now()}`,
      jobTitle: job.title,
      company: job.company,
      applyDate: new Date().toISOString().split('T')[0],
      status: 'กำลังพิจารณา (Under Review)',
      statusColor: 'badge-accent',
      notes: 'ส่งข้อมูลผู้สมัครให้นายจ้างเรียบร้อย'
    };
    setApplications([newApp, ...applications]);
  };

  const handleLoginSuccess = async (user) => {
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('app_current_user', JSON.stringify(user));
    }
    setActiveTab('home');
  };

  const handleRegisterSuccess = async (user) => {
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('app_current_user', JSON.stringify(user));
    }
    setActiveTab('profile');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('app_current_user');
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Navbar Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        setCurrentUser={handleLogout} 
      />

      {/* Main Views */}
      <main className="app-container flex-1 pt-6 pb-12">
        {activeTab === 'home' && (
          <HomePage 
            jobs={jobs} 
            onSelectJob={handleJobSelect} 
            currentUser={currentUser} 
            onNavigateToProfile={() => setActiveTab('profile')}
            onRefreshJobs={loadJobsData}
            onAddNewJob={handleAddNewJob}
            onDeleteJob={handleDeleteJob}
          />
        )}

        {activeTab === 'job-detail' && (
          <JobDetailPage
            job={selectedJob}
            currentUser={currentUser}
            onBack={() => setActiveTab('home')}
            onApplySuccess={handleApplySuccess}
          />
        )}

        {activeTab === 'login' && (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setActiveTab('register')}
          />
        )}

        {activeTab === 'register' && (
          <RegisterPage 
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setActiveTab('login')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage 
            user={currentUser} 
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationsPage 
            applications={applications} 
            onNavigateHome={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
