import { useState } from "react";
import { supabase } from "../lib/supbase.ts";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({email, password});
    if (error) setError(error.message);
    setIsSubmitting(false);
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6">
        
        <div className="bg-white shadow-xl rounded-2xl p-8 lg:w-1/2 border-2 border-blue-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Material Request Tracker
            </h1>
            <p className="text-gray-500 text-sm">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6 lg:w-1/2 border-2 border-blue-200">
          <div className="flex items-center  gap-2 mb-4">
    
            <h3 className="text-lg font-semibold text-gray-900 text-">Demo Accounts</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4"></p>
          
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Company A</h4>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 font-medium min-w-[60px]">EMAIL:</span>
                  <span className="text-xs font-mono text-gray-700 break-all">test@gmail.com</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 font-medium min-w-[60px]">PASSWORD: </span>
                  <span className="text-xs font-mono text-gray-700">password123</span>
                </div>
              </div>
              <button
                onClick={() => handleDemoLogin("test@gmail.com", "1234")}
                className="w-full text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow"
              >
                Use Company A
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Company B</h4>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 font-medium min-w-[60px]">EMAIL:</span>
                  <span className="text-xs font-mono text-gray-700 break-all">companyb@example.com</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 font-medium min-w-[60px]">PASSWORD:</span>
                  <span className="text-xs font-mono text-gray-700">password456</span>
                </div>
              </div>
              <button
                onClick={() => handleDemoLogin("companyb@example.com", "password456")}
                className="w-full text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all font-medium shadow-sm hover:shadow"
              >
                Use Company B
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}