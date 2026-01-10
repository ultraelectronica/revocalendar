import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Map subject codes to readable labels
    const subjectLabels: Record<string, string> = {
      general: 'General Inquiry',
      support: 'Technical Support',
      feedback: 'Feature Feedback',
      bug: 'Bug Report',
      partnership: 'Partnership Opportunity',
    };

    const subjectLabel = subjectLabels[subject] || subject;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Revo Contact Form <onboarding@resend.dev>',
      to: ['heiminrei22@gmail.com'],
      replyTo: email,
      subject: `[Revo] ${subjectLabel}: Message from ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a12; color: #ffffff;">
          <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px; background: linear-gradient(to right, #06b6d4, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Revo Contact Form
            </h1>
          </div>
          
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Subject
            </p>
            <p style="margin: 0; color: #06b6d4; font-weight: 600;">
              ${subjectLabel}
            </p>
          </div>
          
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              From
            </p>
            <p style="margin: 0; color: #ffffff; font-weight: 600;">
              ${name}
            </p>
            <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.6);">
              <a href="mailto:${email}" style="color: #8b5cf6; text-decoration: none;">${email}</a>
            </p>
          </div>
          
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px;">
            <p style="margin: 0 0 10px 0; color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Message
            </p>
            <p style="margin: 0; color: rgba(255,255,255,0.9); line-height: 1.6; white-space: pre-wrap;">
              ${message}
            </p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <p style="margin: 0; color: rgba(255,255,255,0.3); font-size: 12px;">
              Sent from Revo Contact Form
            </p>
          </div>
        </div>
      `,
      text: `
New contact form submission from Revo

Subject: ${subjectLabel}

From: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    if (error) {
      console.error('Resend error:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data?.id);
    return NextResponse.json(
      { success: true, messageId: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
