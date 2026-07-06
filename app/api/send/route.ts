import { EmailTemplate } from '@/components/email-template/email-template'
import { Resend } from 'resend';

export async function POST() {
  try {
    // initialize resend inside the post handler to prevent next.js build time crashes
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Hello world',
      react: EmailTemplate({ firstName: 'John', taskTitle: 'test task', projectName: 'test project' }),
    });

    if (error) {
      console.error("resend api error in /api/send:", error);
      return Response.json({ success: false, error });
    }

    return Response.json({ success: true, data });
  } catch (error: any) {
    console.error("server error in /api/send:", error);
    return Response.json({ success: false, error: error?.message || error });
  }
}