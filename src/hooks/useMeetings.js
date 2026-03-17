import { useState, useEffect } from 'react';
import { loadData, saveData } from '../utils/dataStore';
import { initialMeetings } from '../data/initialData';

export function useMeetings() {
  const [meetings, setMeetings] = useState(() => {
    return loadData('MEETINGS') || initialMeetings;
  });

  useEffect(() => {
    saveData('MEETINGS', meetings);
  }, [meetings]);

  const addMeeting = (meeting) => {
    setMeetings(prev => [...prev, { ...meeting, id: `meeting-${Date.now()}` }]);
  };

  const updateMeeting = (id, updates) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMeeting = (id) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  return { meetings, addMeeting, updateMeeting, deleteMeeting };
}
