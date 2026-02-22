import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api/axios";
import "react-toastify/dist/ReactToastify.css";
import { validateOTP } from "../../utils/validation";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  const inputsRef = useRef([]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
    inputsRef.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleDigitChange = (e, idx) => {
    const val = e.target.value.replace(/\D/, "").slice(-1);
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    const { isValid, errors } = validateOTP(otp);
    if (!isValid) { toast.error(errors[0]); return; }
    setIsLoading(true);
    try {
      await api.post("/auth/verifyOtp", { email, otp });
      toast.success("Account verified! 🎉");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
      // Shake animation
      document.querySelector('.otp-row')?.classList.add('shake');
      setTimeout(() => document.querySelector('.otp-row')?.classList.remove('shake'), 500);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif' }}>Invalid request. Please sign up again.</p>
      </div>
    );
  }

  const isComplete = digits.every(d => d !== "");
  const progressPct = (digits.filter(d => d !== "").length / 6) * 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');

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
            radial-gradient(ellipse 70% 50% at 30% 20%, rgba(16,185,129,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 60% 70% at 70% 80%, rgba(120,80,255,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(20,25,50,0.9) 0%, transparent 100%);
        }
        .grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
        }
        .orb-green {
          position: absolute;
          width: 450px; height: 450px;
          background: radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 70%);
          top: -120px; left: -80px;
          animation: gFloat 12s ease-in-out infinite;
        }
        .orb-purple {
          position: absolute;
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(120,80,255,0.16) 0%, transparent 70%);
          bottom: -80px; right: -60px;
          animation: pFloat 10s ease-in-out infinite;
        }
        @keyframes gFloat {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(30px, 40px); }
        }
        @keyframes pFloat {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-25px, -35px); }
        }

        .auth-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 420px;
          padding: 48px 44px;
          background: rgba(255,255,255,0.038);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          backdrop-filter: blur(32px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.03) inset, 0 40px 80px rgba(0,0,0,0.5);
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .auth-card.mounted { opacity: 1; transform: translateY(0); }
        .auth-card::before {
          content: '';
          position: absolute; inset: -1px; border-radius: 25px;
          background: linear-gradient(135deg, rgba(16,185,129,0.18), transparent 40%, rgba(120,80,255,0.12));
          z-index: -1; opacity: 0.6;
        }

        .logo-mark {
          width: 52px; height: 52px; border-radius: 16px;
          background: linear-gradient(135deg, #10b981, #7c50ff);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 28px;
          box-shadow: 0 8px 32px rgba(16,185,129,0.35);
        }

        /* OTP digit inputs */
        .otp-row {
          display: flex; gap: 10px; justify-content: center;
          margin: 32px 0;
        }
        .otp-digit {
          width: 52px; height: 60px;
          background: rgba(255,255,255,0.055);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          color: #fff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 22px;
          font-weight: 600;
          text-align: center;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.15s;
          caret-color: #10b981;
        }
        .otp-digit:focus {
          border-color: rgba(16,185,129,0.7);
          background: rgba(16,185,129,0.07);
          box-shadow: 0 0 0 4px rgba(16,185,129,0.12);
          transform: scale(1.04);
        }
        .otp-digit.filled {
          border-color: rgba(16,185,129,0.4);
          background: rgba(16,185,129,0.06);
        }

        /* Shake animation on error */
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .shake { animation: shake 0.45s cubic-bezier(0.36,0.07,0.19,0.97); }

        /* Progress bar */
        .progress-wrap {
          height: 2px;
          background: rgba(255,255,255,0.07);
          border-radius: 99px;
          margin-bottom: 28px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #10b981, #7c50ff);
          transition: width 0.25s ease;
        }

        /* Submit */
        .auth-btn {
          width: 100%; padding: 15px;
          border: none; border-radius: 12px;
          background: linear-gradient(135deg, #10b981 0%, #059669 40%, #7c50ff 100%);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500; letter-spacing: 0.04em;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
          box-shadow: 0 4px 24px rgba(16,185,129,0.3);
        }
        .auth-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .auth-btn:hover:not(:disabled)::before { opacity: 1; }
        .auth-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(16,185,129,0.4); }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }
        .auth-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          display: inline-block; width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 8px;
        }

        /* Email chip */
        .email-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 99px;
          padding: 4px 12px;
          font-size: 13px;
          color: #6ee7b7;
          font-weight: 500;
          margin-top: 6px;
          max-width: 100%;
          word-break: break-all;
        }

        /* Timer */
        .timer {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          color: ${timeLeft < 60 ? '#f87171' : 'rgba(255,255,255,0.35)'};
          transition: color 0.3s;
        }
      `}</style>

      <div className="auth-root">
        <div className="mesh-bg" />
        <div className="grid-overlay" />
        <div className="orb-green" />
        <div className="orb-purple" />

        <div className={`auth-card ${mounted ? "mounted" : ""}`}>
          {/* Logo */}
          <div className="logo-mark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center' }}>
            <h1 className="auth-serif" style={{ fontSize: 30, color: '#fff', fontWeight: 400, margin: '0 0 10px', lineHeight: 1.2 }}>
              Verify your email
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '0 0 6px', fontWeight: 300 }}>
              We sent a 6-digit code to
            </p>
            <div className="email-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              {email}
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-wrap" style={{ marginTop: 28 }}>
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>

          <form onSubmit={handleVerify}>
            {/* OTP inputs */}
            <div className="otp-row" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => inputsRef.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className={`otp-digit ${d ? "filled" : ""}`}
                />
              ))}
            </div>

            {/* Timer */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span className="timer">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Code expires in {formatTime(timeLeft)}
              </span>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={isLoading || !isComplete}
            >
              {isLoading && <span className="spinner" />}
              {isLoading ? "Verifying…" : "Verify & Continue"}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.28)' }}>
            Wrong email?{" "}
            <button
              onClick={() => navigate("/signup")}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: 13,
                fontFamily: 'DM Sans, sans-serif', padding: 0, transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              Go back
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

export default VerifyOtp;