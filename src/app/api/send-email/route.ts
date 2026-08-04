import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    const { to, subject, body, documentId, type } = data;

    if (!to || !subject || !body) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Mock Email sending using a theoretical service like Resend or SendGrid
    console.log("=============================");
    console.log(`[EMAIL MOCK] Sending email to: ${to}`);
    console.log(`[EMAIL MOCK] Subject: ${subject}`);
    console.log(`[EMAIL MOCK] Type: ${type}`);
    console.log(`[EMAIL MOCK] Attached Doc ID: ${documentId}`);
    console.log("=============================");

    // In production:
    // await resend.emails.send({
    //   from: 'NJ FENCE <billing@njfence.com>',
    //   to: [to],
    //   subject: subject,
    //   html: `<p>${body}</p>`
    // });

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
