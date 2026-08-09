import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import ApplicationsPage from './components/ApplicationsPage';
import JobDetailPage from './components/JobDetailPage';
import HotChat from './components/HotChat';
import PostJobModal from './components/PostJobModal';
import { fetchJobs, deleteJob, loginUser, submitApplication, fetchUserApplications, fetchEmployerApplications } from './data/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [viewProfileId, setViewProfileId] = useState(null);

  // Handle URL Routing for /profile/:userId dynamically
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/profile\/([^/]+)$/);
      if (match) {
        const userId = match[1];
        setViewProfileId(userId);
        setActiveTab('view-profile');
      } else {
        setViewProfileId(null);
      }
    };

    handleUrlRouting(); // Run on mount
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.history.pushState({}, '', '/');
      setViewProfileId(null);
    } else if (tab === 'profile' && currentUser?.id) {
      window.history.pushState({}, '', `/profile/${currentUser.id}`);
      setViewProfileId(currentUser.id);
    } else {
      window.history.pushState({}, '', '/');
      setViewProfileId(null);
    }
  };

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
  const [activeChatApp, setActiveChatApp] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

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

  // Load Latest Applications from SQLite DB Server (handles both applicant and employer roles)
  const loadApplicationsData = async () => {
    if (!currentUser?.id) return;
    const dbApps = currentUser.role === 'employer'
      ? await fetchEmployerApplications(currentUser.id)
      : await fetchUserApplications(currentUser.id);
    if (dbApps) {
      setApplications(dbApps);
    }
  };

  useEffect(() => {
    async function loadData() {
      await loadJobsData();
      await loadApplicationsData();
    }
    loadData();

    // Auto Poll Shared DB Every 3 Seconds for 100% Real-Time updates across all devices
    const interval = setInterval(() => {
      loadJobsData();
      loadApplicationsData();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser?.id, currentUser?.role]);

  // Add new job posted by Employer instantly
  const handleAddNewJob = (newJob) => {
    setJobs(prevJobs => {
      const updated = [newJob, ...prevJobs.filter(j => j.id !== newJob.id)];
      localStorage.setItem('app_jobs_data', JSON.stringify(updated));
      return updated;
    });
    loadJobsData();
  };

  const handleJobPostedSuccess = (newJob) => {
    handleAddNewJob(newJob);
    setShowPostJobModal(false);
    setEditingJob(null);
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
    handleTabChange('home');
  };

  const handleRegisterSuccess = async (user) => {
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('app_current_user', JSON.stringify(user));
    }
    handleTabChange('profile');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('app_current_user');
    handleTabChange('home');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Navbar Header */}
      <Navbar 
        activeTab={activeTab === 'view-profile' && viewProfileId === currentUser?.id ? 'profile' : activeTab} 
        setActiveTab={handleTabChange} 
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
            onNavigateToProfile={() => handleTabChange('profile')}
            onRefreshJobs={loadJobsData}
            onAddNewJob={handleAddNewJob}
            onDeleteJob={handleDeleteJob}
            onOpenPostJobModal={() => {
              setEditingJob(null);
              setShowPostJobModal(true);
            }}
            onOpenEditJobModal={(job) => {
              setEditingJob(job);
              setShowPostJobModal(true);
            }}
          />
        )}

        {activeTab === 'job-detail' && (
          <JobDetailPage
            job={selectedJob}
            currentUser={currentUser}
            onBack={() => handleTabChange('home')}
            onApplySuccess={handleApplySuccess}
            onEditJob={(job) => {
              setEditingJob(job);
              setShowPostJobModal(true);
            }}
            onDeleteJob={async (jobId) => {
              if (window.confirm('คุณต้องการลบประกาศตำแหน่งงานนี้ (ปิดรับสมัคร) หรือไม่?')) {
                await handleDeleteJob(jobId);
                handleTabChange('home');
              }
            }}
          />
        )}

        {activeTab === 'login' && (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => handleTabChange('register')}
          />
        )}

        {activeTab === 'register' && (
          <RegisterPage 
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => handleTabChange('login')}
          />
        )}

        {(activeTab === 'profile' || activeTab === 'view-profile') && (
          <ProfilePage 
            user={activeTab === 'view-profile' ? { id: viewProfileId } : currentUser} 
            onUpdateUser={(updatedUser) => {
              setCurrentUser(updatedUser);
              localStorage.setItem('app_current_user', JSON.stringify(updatedUser));
            }}
            readOnly={activeTab === 'view-profile' && viewProfileId !== currentUser?.id}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationsPage 
            applications={applications} 
            currentUser={currentUser}
            onNavigateHome={() => handleTabChange('home')}
            onRefreshApplications={loadApplicationsData}
            onOpenChat={(app) => {
              setActiveChatApp(app);
              setIsChatOpen(true);
            }}
          />
        )}
      </main>

      {/* Post Job Modal Popup */}
      {showPostJobModal && (
        <PostJobModal
          onClose={() => {
            setShowPostJobModal(false);
            setEditingJob(null);
          }}
          onJobPosted={handleJobPostedSuccess}
          currentUser={currentUser}
          editingJob={editingJob}
        />
      )}

      {/* HotChat Floating Widget */}
      <HotChat 
        currentUser={currentUser}
        applications={applications}
        activeChatApp={activeChatApp}
        setActiveChatApp={setActiveChatApp}
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
