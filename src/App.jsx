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
  const { prospects, addProspects, reportHistory, stats } = useProspects();
  const { meetings, addMeeting, updateMeeting, deleteMeeting } = useMeetings();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isDark = theme === 'dark';

  const goToProspect = (prospect) => {
    setSelectedProspect(prospect);
    setActiveTab('prospect-detail');
  };

  const goBack = () => {
    setSelectedProspect(null);
    setActiveTab('prospects');
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard prospects={prospects} meetings={meetings} stats={stats} isDark={isDark} onViewProspect={goToProspect} />;
      case 'pipeline':
        return <Pipeline prospects={prospects} isDark={isDark} />;
      case 'prospects':
        return <Prospects prospects={prospects} isDark={isDark} onSelect={goToProspect} />;
      case 'prospect-detail':
        return <ProspectDetail prospect={selectedProspect} isDark={isDark} onBack={goBack} />;
      case 'opportunities':
        return <Opportunities prospects={prospects} isDark={isDark} onSelect={goToProspect} />;
      case 'meetings':
        return <Meetings meetings={meetings} isDark={isDark} onAdd={addMeeting} onUpdate={updateMeeting} onDelete={deleteMeeting} />;
      case 'reports':
        return <Reports isDark={isDark} reportHistory={reportHistory} onDataExtracted={addProspects} />;
      default:
        return <Dashboard prospects={prospects} meetings={meetings} stats={stats} isDark={isDark} onViewProspect={goToProspect} />;
    }
  };

  const getTitle = () => {
    const titles = {
      'dashboard': 'Dashboard',
      'pipeline': 'Pipeline',
      'prospects': 'Prospectos',
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
        onTabChange={(tab) => { setActiveTab(tab); if (tab !== 'prospect-detail') setSelectedProspect(null); }}
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
