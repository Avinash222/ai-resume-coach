import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ResumeUpload({ user, onExtractedText }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");

  async function handleUpload() {
    if (!file) return alert("Please select a file first!");

    setUploading(true);

    try {
      // Convert file to Base64 for API processing
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = async function () {
        const base64File = Buffer.from(reader.result).toString("base64");

        // Send file to API for text extraction
        const response = await fetch("/api/extractText", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileBuffer: base64File }),
        });

        if (!response.ok) {
          throw new Error("Failed to extract text.");
        }

        const data = await response.json();
        if (data.text) {
          onExtractedText(data.text);
        } else {
          alert("Failed to extract text.");
        }
      };

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/resume.${fileExt}`;

      const { error } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, { upsert: true });

      if (error) {
        throw new Error(error.message);
      }

      // Generate public URL for uploaded file
      const { data: publicUrlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

      setResumeUrl(publicUrlData.publicUrl);
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-4 border rounded-md shadow-md bg-white">
      <h2 className="text-lg font-semibold mb-2">Upload Your Resume</h2>
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />
      <button
        className={`bg-blue-500 text-white px-4 py-2 rounded ${
          uploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Resume"}
      </button>
      {resumeUrl && (
        <p className="mt-2">
          ✅ Resume uploaded!  
          <a href={resumeUrl} target="_blank" className="text-blue-600">
            View Resume
          </a>
        </p>
      )}
    </div>
  );
}
