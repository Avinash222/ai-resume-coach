import { supabase } from "../lib/supabase";

export default function Auth() {
  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Google Sign-In Error:", error);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🚀 AI Resume Coach</h1>
        <p className="text-lg text-gray-600">
          Get **AI-powered resume feedback** to improve your chances of landing your dream job.  
          Simply upload your resume, paste a job description, and receive **instant AI suggestions**  
          to optimize your resume for **ATS systems and hiring managers**.
        </p>
      </div>

      {/* Google Sign-In Button with Working SVG */}
      <button
        onClick={signInWithGoogle}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md shadow-md transition"
      >
        <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.1 0 5.8 1.1 8 2.9l6.3-6.3C34.5 2.1 29.6 0 24 0 14.8 0 7.3 5.1 3.3 12.5l7.4 5.8C13 11.3 18 9.5 24 9.5z"></path>
          <path fill="#4285F4" d="M47.5 24.5c0-1.7-.2-3.3-.5-5H24v9.5h13.2c-.6 3.3-2.3 6-4.7 7.9l7.4 5.8c4.3-3.9 7.6-9.5 7.6-17.2z"></path>
          <path fill="#FBBC05" d="M10.7 28.7c-.5-1.4-.7-2.9-.7-4.2s.3-2.9.7-4.2l-7.4-5.8C1 17.1 0 20.4 0 24s1 6.9 2.6 9.5l7.4-5.8z"></path>
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6 0-11-4-12.8-9.5l-7.4 5.8C7.3 42.9 14.8 48 24 48z"></path>
        </svg>
        Sign in with Google
      </button>
    </div>
  );
}
