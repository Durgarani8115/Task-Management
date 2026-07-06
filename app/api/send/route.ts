import { EmailTemplate } from '@/components/email-template/email-template'
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
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