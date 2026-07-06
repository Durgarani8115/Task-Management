import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template/email-template";

// resend client initialization
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendAssignmentEmail(
  toEmail: string,
  userName: string,
  taskTitle: string,
  projectName: string
) {
  const subject = `task assigned: ${taskTitle}`;

  // check if resend client is initialized with an api key
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: toEmail,
        subject,
        react: EmailTemplate({ firstName: userName, taskTitle, projectName }),
      });

      if (error) {
        console.error("failed to send email via resend api:", error);
      } else {
        console.log(`assignment email sent successfully to ${toEmail}. id: ${data?.id}`);
      }
    } catch (error) {
      console.error("failed to send assignment email via resend:", error);
    }
  } else {
    // fallback to console log for testing if resend is not configured
    console.log(`[mock email notification]`);
    console.log(`to: ${toEmail}`);
    console.log(`subject: ${subject}`);
    console.log(`body: hi ${userName}, you have been assigned ${taskTitle} in project ${projectName}`);
  }
}
