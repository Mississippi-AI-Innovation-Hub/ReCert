import { useState } from "react";
import { useNavigate } from "react-router";
import logo from '../utils/Seal_of_Mississippi.png';

export function meta() {
  return [
    { title: "CRS - Login" },
    { name: "description", content: "Login to CRS Domain Management" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

//This needs to change. I'm adding hardcoded credentials to test but once you get a database make sure this fits

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (email === "admin@crs.com" && password === "password") {
        sessionStorage.setItem("crs_auth", "true");
        sessionStorage.setItem("crs_role", "admin");
        navigate("/admin");
      } else if (email === "user@crs.com" && password === "password") {
        sessionStorage.setItem("crs_auth", "true");
        sessionStorage.setItem("crs_role", "user");
        navigate("/dashboard");
      } else {
        setError("Invalid email or password.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl border border-gray-100 p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-30 h-30 rounded-lg flex items-center justify-center shadow-sm mx-auto mb-4">
              <img src={logo} alt="CRS Logo" className="w-25 h-25 object-contain" />
            </div>
          <h1 className="text-2xl font-bold text-gray-900">ReCert</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@crs.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-center">
          <p className="text-s text-gray-400">Demo Accounts:</p>
            <p className="text-xs text-gray-400">Admin Username: admin@crs.com</p>
             <p className="text-xs text-gray-400">Admin Password: password</p>
            <br />
            <p className="text-xs text-gray-400">Username: user@crs.com</p>
             <p className="text-xs text-gray-400">Password: password</p>
        </div>
      </div>
    </div>
  );
}
