import OpenAI from "openai";
import { supabase } from "../../lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract Authorization token from request headers
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify token & get user details
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth Error:", authError);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const userId = user.id; // Ensure user ID is fetched correctly
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // AI Prompt
    const prompt = `
      You are an AI-powered **Career Coach & Resume Expert**. Your task is to evaluate the given resume based on the job description and provide structured, actionable feedback.

      ---
      ## **1️⃣ Resume Score (Out of 100)**
      - Give a **resume match score** (0-100) based on how well the resume fits the job description.
      - Consider **ATS compatibility, relevant skills, formatting, and keyword matching**.

      ## **2️⃣ ATS Optimization Check**
      - Is the resume formatted correctly for **Applicant Tracking Systems (ATS)**?
      - Does it use **simple fonts, bullet points, and standard section titles**?
      - Does it avoid **graphics, tables, and unnecessary styling**?

      ## **3️⃣ Missing Keywords & Skills**
      - Extract **important keywords** from the job description.
      - List **keywords missing** from the resume that should be included.
      - Provide a **corrected resume summary** using these keywords.

      ## **4️⃣ Formatting & Readability**
      - Is the resume **easy to read**?
      - Suggest formatting improvements **(e.g., font size, bullet points, section order)**.

      ## **5️⃣ Final Actionable Steps**
      - List **3-5 specific things** the user should change.

      ---
      **Resume:**
      ${resumeText}

      **Job Description:**
      ${jobDescription}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const aiFeedback = response.choices[0].message.content;

    // Save AI feedback to Supabase (MANUALLY FILTERED)
    const { error: insertError } = await supabase.from("feedback").insert([
      {
        user_id: userId, // Ensures feedback is linked to the user
        resume_text: resumeText || null,
        job_description: jobDescription || null,
        ai_feedback: aiFeedback || null,
      },
    ]);

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return res.status(500).json({ error: "Database error: Unable to save feedback" });
    }

    res.status(200).json({ feedback: aiFeedback });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "AI processing error" });
  }
}
