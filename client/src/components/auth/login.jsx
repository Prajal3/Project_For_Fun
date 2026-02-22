import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { validateLoginForm } from "../../utils/validation";
import { AuthContex } from "../../context/authContex";

// Floating orb component
const Orb = ({ style }) => (
  <div className="absolute rounded-full pointer-events-none" style={style} />
);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContex);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateLoginForm({ email, password });
    if (!isValid) {
      toast.error(errors.email?.[0] || errors.password?.[0]);
      return;
    }
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success("Welcome back ✦");
      setTimeout(() => navigate("/home"), 1500);
    } catch {
      // handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        .auth-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #080810;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .auth-serif { font-family: 'Instrument Serif', serif; }

        /* Animated mesh background */
        .mesh-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(120, 80, 255, 0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 90%, rgba(255, 60, 120, 0.14) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(30, 20, 60, 0.8) 0%, transparent 100%);
          animation: meshShift 12s ease-in-out infinite alternate;
        }
        @keyframes meshShift {
          0% { opacity: 1; }
          50% { opacity: 0.85; }
          100% { opacity: 1; }
        }

        /* Grid texture overlay */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
        }

        /* Floating orbs */
        .orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(120,80,255,0.22) 0%, transparent 70%);
          top: -100px; left: -100px;
          animation: orbFloat1 10s ease-in-out infinite;
        }
        .orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(255,60,120,0.18) 0%, transparent 70%);
          bottom: -80px; right: -60px;
          animation: orbFloat2 14s ease-in-out infinite;
        }
        .orb-3 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(80,200,255,0.12) 0%, transparent 70%);
          top: 40%; right: 15%;
          animation: orbFloat3 8s ease-in-out infinite;
        }
        @keyframes orbFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.1); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-30px, -40px) scale(1.08); }
        }
        @keyframes orbFloat3 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-20px, 20px); }
        }

        /* Card */
        .auth-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 48px 44px;
          background: rgba(255,255,255,0.042);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          backdrop-filter: blur(32px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 40px 80px rgba(0,0,0,0.5),
            0 0 60px rgba(120,80,255,0.07);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
          transform: translateY(24px);
        }
        .auth-card.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        /* Logo mark */
        .logo-mark {
          width: 52px; height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #7c50ff, #ff3c78);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 28px;
          box-shadow: 0 8px 32px rgba(124, 80, 255, 0.4);
          position: relative;
        }
        .logo-mark::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 17px;
          background: linear-gradient(135deg, rgba(124,80,255,0.6), rgba(255,60,120,0.6));
          z-index: -1;
          filter: blur(8px);
        }

        /* Input field */
        .auth-field {
          width: 100%;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.01em;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .auth-field::placeholder { color: rgba(255,255,255,0.28); }
        .auth-field:focus {
          border-color: rgba(124,80,255,0.6);
          background: rgba(124,80,255,0.06);
          box-shadow: 0 0 0 4px rgba(124,80,255,0.12);
        }

        /* Label */
        .field-label {
          display: block;
          color: rgba(255,255,255,0.45);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        /* Submit button */
        .auth-btn {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #7c50ff 0%, #a855f7 50%, #ff3c78 100%);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.04em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 24px rgba(124,80,255,0.35);
        }
        .auth-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .auth-btn:hover:not(:disabled)::before { opacity: 1; }
        .auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(124,80,255,0.45); }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Divider */
        .divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .divider span { color: rgba(255,255,255,0.2); font-size: 11px; letter-spacing: 0.06em; }

        /* Spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }

        /* Shimmer on card border */
        .auth-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 25px;
          background: linear-gradient(135deg, rgba(124,80,255,0.2), transparent 40%, rgba(255,60,120,0.15) 80%, transparent);
          z-index: -1;
          opacity: 0.6;
        }
      `}</style>

      <div className="auth-root">
        <div className="mesh-bg" />
        <div className="grid-overlay" />
        <div className="orb-1" style={{ position: 'absolute' }} />
        <div className="orb-2" style={{ position: 'absolute' }} />
        <div className="orb-3" style={{ position: 'absolute' }} />

        <div className={`auth-card ${mounted ? "mounted" : ""}`}>
          {/* Logo */}
          <div className="logo-mark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 className="auth-serif" style={{ fontSize: 32, color: '#fff', fontWeight: 400, margin: '0 0 8px', lineHeight: 1.15 }}>
              Welcome back
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, margin: 0, fontWeight: 300 }}>
              Sign in to continue your conversations
            </p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label className="field-label">Email address</label>
              <input
                type="email"
                className="auth-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28, position: 'relative' }}>
              <label className="field-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-field"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.35)', padding: 0, display: 'flex',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                >
                  {showPassword
                    ? <EyeOff size={17} />
                    : <Eye size={17} />
                  }
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading && <span className="spinner" />}
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line" />
            <span>OR</span>
            <div className="divider-line" />
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            No account yet?{" "}
            <button
              onClick={() => navigate("/signup")}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#a78bfa', fontWeight: 500, fontSize: 13,
                fontFamily: 'DM Sans, sans-serif', padding: 0,
                textDecoration: 'none', transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
              onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
            >
              Create account →
            </button>
          </p>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="dark"
        toastStyle={{ background: 'rgba(20,15,40,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
      />
    </>
  );
};

export default Login;