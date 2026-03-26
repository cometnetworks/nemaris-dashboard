import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useMeetings() {
  const convexMeetings = useQuery(api.meetings.list) ?? [];
  const addMeetingMut = useMutation(api.meetings.add);
  const updateMeetingMut = useMutation(api.meetings.update);
  const removeMeetingMut = useMutation(api.meetings.remove);
  const generateUploadUrl = useMutation(api.meetings.generateUploadUrl);

  // Map Convex docs to the shape the app expects
  const meetings = convexMeetings.map(m => ({
    ...m,
    id: m._id,
  }));

  const addMeeting = async (meeting) => {
    await addMeetingMut({
      company: meeting.company,
      date: meeting.date,
      link: meeting.link,
      notes: meeting.notes || '',
      status: meeting.status || 'por_realizar',
      ...(meeting.briefPdfId ? { briefPdfId: meeting.briefPdfId } : {}),
    });
  };

  const updateMeeting = async (id, updates) => {
    await updateMeetingMut({ id, updates });
  };

  const deleteMeeting = async (id) => {
    await removeMeetingMut({ id });
  };

  const uploadBriefPdf = async (file) => {
    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl();
    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    const { storageId } = await result.json();
    return storageId;
  };

  return { meetings, addMeeting, updateMeeting, deleteMeeting, uploadBriefPdf };
}
