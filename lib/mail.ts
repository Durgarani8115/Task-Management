import { Resend } from "resend";

// resend client initialization
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendAssignmentEmail(
  toEmail: string,
  userName: string,
  taskTitle: string,
  projectName: string
) {
  const subject = `task assigned: ${taskTitle}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #10b981;">clove task management</h2>
      <p>hi ${userName},</p>
      <p>you have been assigned a new task: <strong>${taskTitle}</strong> in project <strong>${projectName}</strong>.</p>
      <p>please open your project board to check details and start working on it.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #888;">this is an automated notification from clove task management.</p>
    </div>
  `;

  // check if resend client is initialized with an api key
  if (resend) {
    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: toEmail,
        subject,
        html,
      });
      console.log(`assignment email sent to ${toEmail}`);
    } catch (error) {
      console.error("failed to send assignment email via resend:", error);
    }
  } else {
    // fallback to console log for testing if resend is not configured
    console.log(`[mock email notification]`);
    console.log(`to: ${toEmail}`);
    console.log(`subject: ${subject}`);
    console.log(`html: ${html}`);
  }
}
