import pdfParse from "pdf-parse";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileBuffer } = req.body;
    if (!fileBuffer) {
      return res.status(400).json({ error: "No file provided" });
    }

    const text = await pdfParse(Buffer.from(fileBuffer, "base64"));

    console.log("Extracted Resume Text:", text.text); // Debugging log
    return res.status(200).json({ text: text.text });
  } catch (error) {
    console.error("Error extracting text:", error);
    return res.status(500).json({ error: "Error extracting text" });
  }
}
