import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: "TutorLink Contact <onboarding@resend.dev>",
      to: "hasithgamlath327@gmail.com",
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 100px;">Name:</td>
              <td style="padding: 8px 0; color: #6b7280;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
              <td style="padding: 8px 0; color: #6b7280;">${email}</td>
            </tr>
          </table>
          <div style="margin-top: 16px;">
            <p style="font-weight: bold; color: #374151; margin-bottom: 8px;">Message:</p>
            <p style="color: #6b7280; background: #f9fafb; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to send email." },
        { status: 500 }
      )
    }

    console.log("Email sent, id:", data?.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    )
  }
}
