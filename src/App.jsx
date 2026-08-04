import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import ApplicationsPage from './components/ApplicationsPage';
import JobDetailPage from './components/JobDetailPage';
import { fetchJobs, deleteJob, loginUser, submitApplication, fetchUserApplications } from './data/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // 1. User Session Persistence (per browser)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('app_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [selectedJob, setSelectedJob] = useState(null);

  // 2. Real Jobs state synced ONLY with SQLite Shared DB and localStorage (NO MOCK DATA)
  const [jobs, setJobs] = useState(() => {
    try {
      const savedJobs = localStorage.getItem('app_jobs_data');
      return savedJobs ? JSON.parse(savedJobs) : [];
    } catch (e) {
      return [];
    }
  });

  // 3. Real Applications state synced ONLY with SQLite Shared DB (NO MOCK DATA)
  const [applications, setApplications] = useState([]);

  // Sync Current User session with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('app_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('app_current_user');
    }
  }, [currentUser]);

  // Sync Jobs with localStorage
  useEffect(() => {
    if (jobs) {
      localStorage.setItem('app_jobs_data', JSON.stringify(jobs));
    }
  }, [jobs]);

  // Load Latest Shared Jobs from SQLite DB Server
  const loadJobsData = async () => {
    const dbJobs = await fetchJobs();
    if (dbJobs) {
      setJobs(dbJobs);
      localStorage.setItem('app_jobs_data', JSON.stringify(dbJobs));
    }
  };

  useEffect(() => {
    async function loadData() {
      await loadJobsData();
      if (currentUser?.id) {
        const dbApps = await fetchUserApplications(currentUser.id);
        if (dbApps) {
          setApplications(dbApps);
        }
      }
    }
    loadData();

    // Auto Poll Shared DB Every 3 Seconds for 100% Real-Time updates across all devices
    const interval = setInterval(() => {
      loadJobsData();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Add new job posted by Employer instantly
  const handleAddNewJob = (newJob) => {
    setJobs(prevJobs => {
      const updated = [newJob, ...prevJobs.filter(j => j.id !== newJob.id)];
      localStorage.setItem('app_jobs_data', JSON.stringify(updated));
      return updated;
    });
    loadJobsData();
  };

  // Delete job for Employer
  const handleDeleteJob = async (jobId) => {
    await deleteJob(jobId);
    setJobs(prevJobs => {
      const updated = prevJobs.filter(j => j.id !== jobId);
      localStorage.setItem('app_jobs_data', JSON.stringify(updated));
      return updated;
    });
    loadJobsData();
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
      applicantName: currentUser?.name || 'ผู้สมัครงาน',
      coverNote: 'ยื่นผ่านระบบสมัครงาน'
    };

    await submitApplication(appData);

    const newApp = {
      id: `app-${Date.now()}`,
      jobTitle: job.title,
      company: job.company,
      applicantName: currentUser?.name || 'ผู้สมัครงาน',
      applyDate: new Date().toISOString().split('T')[0],
      status: 'กำลังพิจารณา (Under Review)',
      statusColor: 'badge-accent'
    };
    setApplications(prev => [newApp, ...prev]);
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
            currentUser={currentUser}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
