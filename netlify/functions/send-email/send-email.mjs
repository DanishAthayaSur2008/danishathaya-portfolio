// Docs on request and context https://docs.netlify.com/functions/build/#code-your-function-2
// netlify/functions/send-email/send-email.mjs

export default async (request, context) => {
  // 1. Hanya izinkan method POST dari frontend portofoliomu
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // 2. Mengambil data JSON yang dikirim oleh script.js frontend
    const body = await request.json();
    const { name, email, message } = body;
    
    // 3. Mengambil API Key yang disimpan aman di Dashboard Netlify
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing RESEND_API_KEY in Netlify Environment Variables" }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Kirim data ke API Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Contact Form <onboarding@resend.dev>", // Ganti dengan domain custom kamu jika ada nanti
        to: ["danish.athayan@gmail.com"],
        subject: `New Message from ${name}`,
        html: `
          <h3>Pesan Baru dari Kontak Website</h3>
          <p><strong>Nama:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Pesan:</strong></p>
          <p>${message}</p>
        `,
      }),
    });

    // 5. Jika API Resend error, tangkap errornya
    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      return new Response(
        JSON.stringify({ error: "Resend API Error", details: errorText }), 
        { status: resendResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // 6. Jika sukses kirim email, beri tahu frontend
    return new Response(
      JSON.stringify({ message: "Email sent successfully!" }), 
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    // Tangkap error jika json parsing atau network fetch gagal
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};