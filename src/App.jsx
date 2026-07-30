import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import ApplicationsPage from './components/ApplicationsPage';
import JobDetailPage from './components/JobDetailPage';
import { MOCK_USER, MOCK_JOBS, MOCK_APPLICATIONS } from './data/mockData';
import { fetchJobs, loginUser, registerUser, submitApplication, fetchUserApplications } from './data/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentUser, setCurrentUser] = useState(MOCK_USER);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);

  const loadJobsData = async () => {
    const dbJobs = await fetchJobs();
    if (dbJobs && dbJobs.length > 0) {
      setJobs(dbJobs);
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
      coverNote: 'ยื่นผ่านระบบ Skill Portfolio'
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
      if (user.email) {
        const dbUser = await loginUser(user.email, 'password123');
        setCurrentUser(dbUser?.user || user);
      } else {
        setCurrentUser(user);
      }
    }
    setActiveTab('home');
  };

  const handleRegisterSuccess = async (user) => {
    if (user) {
      setCurrentUser(user);
    }
    setActiveTab('profile');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Navbar Header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
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
