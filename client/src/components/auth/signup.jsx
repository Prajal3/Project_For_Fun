import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api/axios";

const Signup = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const GENERATED_OTP = "123456"; 

  const handleSendOtp = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post("/auth/signup", {
      fullName,
      email,
      password,
    });

    toast.success(res.data.message || "OTP sent");
    setStep(2);
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Signup failed"
    );
  }
};
 const handleVerifyOtp = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post("/auth/verify-otp", {
      email,
      otp,
    });

    toast.success(res.data.message || "Signup successful");

    setTimeout(() => {
      navigate("/");
    }, 1500);
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Invalid OTP"
    );
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">
          {step === 1 ? "Create Account" : "Verify OTP"}
        </h2>

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Gmail"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Send OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-3 border rounded-lg mb-4 text-center tracking-widest focus:ring-2 focus:ring-indigo-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
            >
              Verify OTP
            </button>

            <p
              className="text-sm text-center text-indigo-600 mt-4 cursor-pointer hover:underline"
              onClick={() => setStep(1)}
            >
              Change details
            </p>
          </form>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default Signup;
