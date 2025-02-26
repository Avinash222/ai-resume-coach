import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Auth from "../components/Auth";
import ResumeUpload from "../components/ResumeUpload";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [user, setUser] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedPastFeedback, setSelectedPastFeedback] = useState("");
  const [pastFeedback, setPastFeedback] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = supabase.auth.getSession();
    setUser(session?.user || null);

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserFeedback();
    }
  }, [user]);

  async function fetchUserFeedback() {
    if (!user) return;
  
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
  
    const { data, error } = await supabase
      .from("feedback")
      .select("id, created_at, ai_feedback")
      .eq("user_id", user.id) // ✅ Manually filter so users only get their own feedback
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error fetching feedback:", error);
    } else {
      setPastFeedback(data);
    }
  }  

  async function getAIAnalysis() {
    if (!resumeText || !jobDescription) {
      alert("Please upload a resume and enter a job description.");
      return;
    }

    setLoading(true);
    setSelectedPastFeedback("");

    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await res.json();
      setFeedback(data.feedback);
      fetchUserFeedback();
    } catch (error) {
      alert("Error fetching AI feedback. Please try again.");
    }

    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-6 w-full">
      {!user ? (
        <Auth />
      ) : (
        <div className="w-full max-w-3xl mx-auto">
          {/* Header with Logout Button */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg font-semibold">Welcome, {user.email}!</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md transition"
            >
              Logout
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <ResumeUpload user={user} onExtractedText={setResumeText} />

            <textarea
              className="w-full p-3 border rounded-md mt-4 focus:ring focus:ring-blue-300"
              placeholder="Paste job description here..."
              rows="5"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <button
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md mt-4 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={getAIAnalysis}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Analyzing...
                </div>
              ) : (
                "Get AI Feedback"
              )}
            </button>
          </div>

          {/* Live AI Feedback Section */}
          {feedback && !selectedPastFeedback && (
            <div className="mt-6 p-6 bg-white border rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">AI Feedback (New Analysis):</h3>
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          )}

          {/* Past Feedback Section */}
          {pastFeedback.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-3 text-center">Your Past AI Feedback</h2>
              {pastFeedback.map((entry) => (
                <div key={entry.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
                  <button
                    className="w-full text-left font-semibold text-blue-600 hover:underline"
                    onClick={() => {
                      setSelectedPastFeedback((prevFeedback) =>
                        prevFeedback === entry.ai_feedback ? "" : entry.ai_feedback
                      );
                      setFeedback("");
                    }}
                  >
                    📄 Feedback from {new Date(entry.created_at).toLocaleDateString()}
                  </button>
                  {selectedPastFeedback === entry.ai_feedback && (
                    <div className="mt-2 p-3 bg-gray-100 border rounded-md">
                      <ReactMarkdown>{entry.ai_feedback}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
