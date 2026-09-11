import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginView, ROLES } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { UploadView } from './views/UploadView';
import { RegisterLandView } from './views/RegisterLandView';
import { HumanReviewView } from './views/HumanReviewView';
import { FraudDetectionView } from './views/FraudDetectionView';
import { RecordsView } from './views/RecordsView';
import { DistrictMapView } from './views/DistrictMapView';
import { AuditTrailView } from './views/AuditTrailView';
import { RecordDetailModal } from './components/RecordDetailModal';
import { api } from './api';

export default function App() {
  // Authentication State
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('landmark_ai_user_profile') || localStorage.getItem('bhudigi_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, upload, register, review, fraud, records, map, audit
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [detailModalRecord, setDetailModalRecord] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);

  const refreshCounts = async () => {
    try {
      const stats = await api.getStats();
      setPendingCount(stats.summary?.pending_review || 0);
      setFlaggedCount(stats.summary?.flagged_issues || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userProfile) {
      refreshCounts();
    }
  }, [currentView, userProfile]);

  const handleLoginSuccess = (profile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem('landmark_ai_user_profile', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
    // Route to appropriate initial view based on role
    if (profile.role === 'citizen') {
      setCurrentView('records');
    } else if (profile.role === 'patwari') {
      setCurrentView('upload');
    } else if (profile.role === 'verifier') {
      setCurrentView('review');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUserProfile(null);
    try {
      localStorage.removeItem('landmark_ai_user_profile');
      localStorage.removeItem('bhudigi_user_profile');
    } catch (e) {
      console.error(e);
    }
    setCurrentView('dashboard');
  };

  const handleSwitchRole = (roleId) => {
    const roleDef = ROLES.find((r) => r.id === roleId);
    if (roleDef) {
      const updatedProfile = {
        ...userProfile,
        role: roleDef.id,
        name: roleDef.defaultName || userProfile?.name || 'Authorized User',
        email: roleDef.defaultEmail || userProfile?.email || 'user@landmark.gov.in',
        phone: roleDef.defaultPhone || userProfile?.phone || '9876543210',
        roleTitle: roleDef.title,
        badge: roleDef.badge,
        badgeColor: roleDef.badgeColor,
        dept: roleDef.dept,
      };
      setUserProfile(updatedProfile);
      try {
        localStorage.setItem('landmark_ai_user_profile', JSON.stringify(updatedProfile));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleOpenReview = (record) => {
    setSelectedRecordId(record?.id || null);
    setCurrentView('review');
  };

  const handleSelectRecord = async (record) => {
    try {
      const full = await api.getRecordDetail(record.id);
      setDetailModalRecord(full);
    } catch (err) {
      setDetailModalRecord(record);
    }
  };

  // 1. If not logged in, show Login Screen first
  if (!userProfile) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Main Authenticated Platform
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar (Always Visible) */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view !== 'review') setSelectedRecordId(null);
          setCurrentView(view);
        }}
        userProfile={userProfile}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        pendingCount={pendingCount}
        flaggedCount={flaggedCount}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {currentView === 'dashboard' && (
          <DashboardView
            onNavigate={(view) => setCurrentView(view)}
            onSelectRecord={handleSelectRecord}
            userProfile={userProfile}
          />
        )}

        {currentView === 'upload' && (
          <UploadView
            onNavigate={(view) => setCurrentView(view)}
            onOpenReview={handleOpenReview}
            onSelectRecord={handleSelectRecord}
            userProfile={userProfile}
          />
        )}

        {currentView === 'register' && (
          <RegisterLandView
            onNavigate={(view) => setCurrentView(view)}
            onSelectRecord={handleSelectRecord}
            onRecordCreated={refreshCounts}
            userProfile={userProfile}
          />
        )}

        {currentView === 'review' && (
          <HumanReviewView
            selectedRecordId={selectedRecordId}
            onRecordUpdated={refreshCounts}
            onNavigate={(view) => setCurrentView(view)}
            userProfile={userProfile}
          />
        )}

        {currentView === 'fraud' && (
          <FraudDetectionView
            onNavigate={(view) => setCurrentView(view)}
            onOpenReview={handleOpenReview}
            onSelectRecord={handleSelectRecord}
            onResolved={refreshCounts}
            userProfile={userProfile}
          />
        )}

        {currentView === 'records' && (
          <RecordsView
            onSelectRecord={handleSelectRecord}
            onOpenReview={handleOpenReview}
            onNavigate={(view) => setCurrentView(view)}
            userProfile={userProfile}
          />
        )}

        {currentView === 'map' && (
          <DistrictMapView
            onNavigate={(view) => setCurrentView(view)}
            userProfile={userProfile}
          />
        )}

        {currentView === 'audit' && (
          <AuditTrailView
            onNavigate={(view) => setCurrentView(view)}
            onSelectRecord={handleSelectRecord}
            userProfile={userProfile}
          />
        )}
      </main>

      {/* Record Inspection Modal */}
      {detailModalRecord && (
        <RecordDetailModal
          record={detailModalRecord}
          onClose={() => setDetailModalRecord(null)}
          onOpenReview={handleOpenReview}
        />
      )}
    </div>
  );
}
