import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import api from "../../api/axios";
import "react-toastify/dist/ReactToastify.css";
import { validateSignupForm } from "../../utils/validation";

const Signup = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [strength, setStrength] = useState(0); // 0-4 password strength

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const calcStrength = (pw) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return score;
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setStrength(calcStrength(val));
  };

  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const handleSignup = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateSignupForm({ fullName, email, password });
    if (!isValid) {
      toast.error(errors.fullName?.[0] || errors.email?.[0] || errors.password?.[0]);
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/signup", { fullname: fullName, email, password });
      toast.success("OTP sent to your inbox ✦");
      setTimeout(() => navigate("/verify-otp", { state: { email } }), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
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
          padding: 32px 16px;
        }
        .auth-serif { font-family: 'Instrument Serif', serif; }

        .mesh-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 80% 10%, rgba(80,200,255,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 20% 90%, rgba(120,80,255,0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(30,20,60,0.8) 0%, transparent 100%);
        }
        .grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
        }

        .orb-a {
          position: absolute;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(80,200,255,0.15) 0%, transparent 70%);
          top: -150px; right: -100px;
          animation: floatA 11s ease-in-out infinite;
        }
        .orb-b {
          position: absolute;
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(120,80,255,0.2) 0%, transparent 70%);
          bottom: -100px; left: -80px;
          animation: floatB 13s ease-in-out infinite;
        }
        @keyframes floatA {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-30px, 40px); }
        }
        @keyframes floatB {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(30px, -30px); }
        }

        .auth-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 440px;
          padding: 44px 44px;
          background: rgba(255,255,255,0.038);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          backdrop-filter: blur(32px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.035) inset, 0 40px 80px rgba(0,0,0,0.5);
          opacity: 0; transform: translateY(28px);
          transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .auth-card.mounted { opacity: 1; transform: translateY(0); }
        .auth-card::before {
          content: '';
          position: absolute; inset: -1px; border-radius: 25px;
          background: linear-gradient(135deg, rgba(80,200,255,0.15), transparent 40%, rgba(120,80,255,0.12));
          z-index: -1; opacity: 0.7;
        }

        .logo-mark {
          width: 52px; height: 52px; border-radius: 16px;
          background: linear-gradient(135deg, #4fc0ff, #7c50ff);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 28px;
          box-shadow: 0 8px 32px rgba(80,192,255,0.35);
        }

        .auth-field {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 14px 16px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .auth-field::placeholder { color: rgba(255,255,255,0.25); }
        .auth-field:focus {
          border-color: rgba(80,192,255,0.5);
          background: rgba(80,192,255,0.05);
          box-shadow: 0 0 0 4px rgba(80,192,255,0.1);
        }

        .field-label {
          display: block;
          color: rgba(255,255,255,0.4);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .auth-btn {
          width: 100%; padding: 15px;
          border: none; border-radius: 12px;
          background: linear-gradient(135deg, #4fc0ff 0%, #7c50ff 50%, #a855f7 100%);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500; letter-spacing: 0.04em;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 24px rgba(80,192,255,0.3);
        }
        .auth-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .auth-btn:hover:not(:disabled)::before { opacity: 1; }
        .auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(80,192,255,0.4); }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Password strength bar */
        .strength-bar-wrap {
          display: flex; gap: 4px; margin-top: 8px;
        }
        .strength-seg {
          flex: 1; height: 3px; border-radius: 99px;
          background: rgba(255,255,255,0.1);
          transition: background 0.3s;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }

        .divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider span { color: rgba(255,255,255,0.18); font-size: 11px; letter-spacing: 0.06em; }
      `}</style>

      <div className="auth-root">
        <div className="mesh-bg" />
        <div className="grid-overlay" />
        <div className="orb-a" />
        <div className="orb-b" />

        <div className={`auth-card ${mounted ? "mounted" : ""}`}>
          {/* Logo */}
          <div className="logo-mark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 className="auth-serif" style={{ fontSize: 32, color: '#fff', fontWeight: 400, margin: '0 0 8px', lineHeight: 1.15 }}>
              Create account
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: 0, fontWeight: 300 }}>
              Join thousands of people connecting daily
            </p>
          </div>

          <form onSubmit={handleSignup}>
            {/* Full Name */}
            <div style={{ marginBottom: 18 }}>
              <label className="field-label">Full name</label>
              <input
                type="text"
                className="auth-field"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
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
            <div style={{ marginBottom: 28 }}>
              <label className="field-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-field"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={handlePasswordChange}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.32)', padding: 0,
                    display: 'flex', transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.32)'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div>
                  <div className="strength-bar-wrap">
                    {[0,1,2,3].map(i => (
                      <div
                        key={i}
                        className="strength-seg"
                        style={{ background: i < strength ? strengthColors[strength - 1] : 'rgba(255,255,255,0.1)' }}
                      />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: strength > 0 ? strengthColors[strength-1] : 'rgba(255,255,255,0.3)', marginTop: 5, letterSpacing: '0.04em' }}>
                    {strength > 0 ? strengthLabels[strength - 1] : 'Enter password'}
                  </p>
                </div>
              )}
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading && <span className="spinner" />}
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line" />
            <span>OR</span>
            <div className="divider-line" />
          </div>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.32)', margin: 0 }}>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/")}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#7dd3fc', fontWeight: 500, fontSize: 13,
                fontFamily: 'DM Sans, sans-serif', padding: 0,
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#bae6fd'}
              onMouseLeave={e => e.currentTarget.style.color = '#7dd3fc'}
            >
              Sign in →
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

export default Signup;