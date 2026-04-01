import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function useEmails(prospectId) {
  // Query to get daily sending limit
  const sentTodayCount = useQuery(api.emails.getDailyLimit) ?? 0;
  
  // Specific query to get logs for a single prospect, only if prospectId is provided
  const emailLogs = useQuery(
    api.emails.getLogsForProspect,
    prospectId ? { prospectId } : "skip" 
  );

  const sendEmailAction = useAction(api.emails.sendEmail);

  const sendProspectEmail = async (prospect) => {
    if (!prospect.contactEmail || !prospect.emailSubject || !prospect.emailBody) {
      throw new Error("El prospecto no tiene email, asunto o cuerpo de mensaje configurado.");
    }
    
    if (sentTodayCount >= 10) {
      throw new Error("Haz alcanzado el límite diario de 10 envíos.");
    }

    // Call the action
    const result = await sendEmailAction({
      prospectId: prospect.id || prospect.prospectId,
      subject: prospect.emailSubject,
      body: prospect.emailBody,
      recipient: prospect.contactEmail
    });

    return result;
  };

  return {
    sentTodayCount,
    emailLogs,
    sendProspectEmail,
    canSendToday: sentTodayCount < 10
  };
}
