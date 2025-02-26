import pdfParse from "pdf-parse";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if file is attached
    if (!req.body || !req.body.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Convert Base64 string back to a Buffer
    const fileBuffer = Buffer.from(req.body.file, "base64");

    // Parse the PDF
    const parsedData = await pdfParse(fileBuffer);

    // Return the extracted text (only serializable data)
    res.status(200).json({ text: parsedData.text });
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    res.status(500).json({ error: "Failed to parse PDF" });
  }
}
