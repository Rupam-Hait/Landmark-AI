import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { UploadView } from './views/UploadView';
import { RegisterLandView } from './views/RegisterLandView';
import { HumanReviewView } from './views/HumanReviewView';
import { RecordsView } from './views/RecordsView';
import { DistrictMapView } from './views/DistrictMapView';
import { RecordDetailModal } from './components/RecordDetailModal';
import { api } from './api';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, upload, register, review, records, map
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
    refreshCounts();
  }, [currentView]);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        pendingCount={pendingCount}
        flaggedCount={flaggedCount}
        onNavigate={(view) => setCurrentView(view)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onViewChange={(view) => {
            if (view !== 'review') setSelectedRecordId(null);
            setCurrentView(view);
          }}
          pendingCount={pendingCount}
          flaggedCount={flaggedCount}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentView === 'dashboard' && (
            <DashboardView
              onNavigate={(view) => setCurrentView(view)}
              onSelectRecord={handleSelectRecord}
            />
          )}

          {currentView === 'upload' && (
            <UploadView
              onNavigate={(view) => setCurrentView(view)}
              onOpenReview={handleOpenReview}
              onSelectRecord={handleSelectRecord}
            />
          )}

          {currentView === 'register' && (
            <RegisterLandView
              onNavigate={(view) => setCurrentView(view)}
              onSelectRecord={handleSelectRecord}
              onRecordCreated={refreshCounts}
            />
          )}

          {currentView === 'review' && (
            <HumanReviewView
              selectedRecordId={selectedRecordId}
              onRecordUpdated={refreshCounts}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'records' && (
            <RecordsView
              onSelectRecord={handleSelectRecord}
              onOpenReview={handleOpenReview}
            />
          )}

          {currentView === 'map' && (
            <DistrictMapView
              onNavigate={(view) => setCurrentView(view)}
            />
          )}
        </main>
      </div>

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
