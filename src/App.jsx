import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme';
import { useProspects } from './hooks/useProspects';
import { useMeetings } from './hooks/useMeetings';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Prospects from './pages/Prospects';
import ProspectDetail from './pages/ProspectDetail';
import Opportunities from './pages/Opportunities';
import Meetings from './pages/Meetings';
import Reports from './pages/Reports';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { prospects, addProspects, updateProspect, deleteProspect, deduplicateAll, reportHistory, stats } = useProspects();
  const { meetings, addMeeting, updateMeeting, deleteMeeting, uploadBriefPdf } = useMeetings();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProspectId, setSelectedProspectId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [prospectFilter, setProspectFilter] = useState('all');

  const isDark = theme === 'dark';

  // Derive selected prospect from live data so edits are reflected immediately
  const selectedProspect = selectedProspectId
    ? prospects.find(p => p.id === selectedProspectId) || null
    : null;

  const goToProspect = (prospect) => {
    setSelectedProspectId(prospect.id);
    setActiveTab('prospect-detail');
  };

  const goBack = () => {
    setSelectedProspectId(null);
    setActiveTab('prospects');
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          prospects={prospects} meetings={meetings} stats={stats} isDark={isDark} onViewProspect={goToProspect} 
          onStatusClick={(status) => {
            setProspectFilter(status);
            setActiveTab('prospects');
          }}
        />;
      case 'pipeline':
        return <Pipeline prospects={prospects} isDark={isDark} />;
      case 'prospects':
        return <Prospects prospects={prospects} isDark={isDark} onSelect={goToProspect} onDelete={deleteProspect} onDeduplicate={deduplicateAll} forcedStatus={prospectFilter} />;
      case 'prospect-detail':
        return <ProspectDetail prospect={selectedProspect} isDark={isDark} onBack={goBack} onUpdate={updateProspect} onScheduleMeeting={addMeeting} />;
      case 'opportunities':
        return <Opportunities prospects={prospects} meetings={meetings} isDark={isDark} onSelect={goToProspect} />;
      case 'meetings':
        return <Meetings meetings={meetings} isDark={isDark} onAdd={addMeeting} onUpdate={updateMeeting} onDelete={deleteMeeting} uploadBriefPdf={uploadBriefPdf} />;
      case 'reports':
        return <Reports isDark={isDark} reportHistory={reportHistory} onDataExtracted={addProspects} />;
      default:
        return <Dashboard prospects={prospects} meetings={meetings} stats={stats} isDark={isDark} onViewProspect={goToProspect} />;
    }
  };

  const getTitle = () => {
    let prospectsTitle = 'Prospectos';
    if (activeTab === 'prospects') {
      if (prospectFilter === 'ready') prospectsTitle = 'En cola para envío';
      if (prospectFilter === 'pending') prospectsTitle = 'Por Enriquecer';
    }

    const titles = {
      'dashboard': 'Dashboard',
      'pipeline': 'Pipeline',
      'prospects': prospectsTitle,
      'prospect-detail': 'Detalle de Prospecto',
      'opportunities': 'Oportunidades',
      'meetings': 'Reuniones',
      'reports': 'Reportes',
    };
    return titles[activeTab] || 'Dashboard';
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDark ? 'bg-[#09090b] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDark ? '#18181b' : '#ffffff',
            color: isDark ? '#fafafa' : '#09090b',
            border: `1px solid ${isDark ? '#27272a' : '#e5e7eb'}`,
            borderRadius: '12px',
          },
        }}
      />
      
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => { 
          setActiveTab(tab); 
          if (tab !== 'prospect-detail') setSelectedProspectId(null); 
          if (tab === 'prospects') setProspectFilter('all');
        }}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        stats={stats}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        latestReportDate={reportHistory[0]?.date}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          title={getTitle()}
          isDark={isDark}
          prospects={prospects}
          meetings={meetings}
          latestReportDate={reportHistory[0]?.date}
        />
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
