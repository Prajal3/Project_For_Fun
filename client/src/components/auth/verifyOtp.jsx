import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { ShieldCheck } from "lucide-react";
import api from "../../api/axios";
import "react-toastify/dist/ReactToastify.css";
import { validateOTP } from "../../utils/validation";


const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const [otp, setOtp] = useState("");

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const { isValid, errors } = validateOTP(otp);

    if (!isValid) {
      toast.error(errors[0]);
      return;
    }

    try {
      await api.post("/auth/verifyOtp", { email, otp });

      toast.success("Account created successfully 🎉");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  // auto move focus + combine OTP
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "");
    const otpArray = otp.split("");
    otpArray[index] = value;
    const newOtp = otpArray.join("");
    setOtp(newOtp);

    if (value && e.target.nextSibling) {
      e.target.nextSibling.focus();
    }
  };

  if (!email) {
    return <p className="text-center mt-20">Invalid request</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-sky-500 to-blue-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full mb-3">
            <ShieldCheck className="text-white w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold">Enter Code</h2>
          <p className="text-sm text-gray-500 text-center">
            We sent a verification code to
            <br />
            <b>{email}</b>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp}>
          {/* OTP Boxes */}
          <div className="flex justify-between mb-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                className="w-12 h-14 text-xl text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleOtpChange(e, i)}
              />
            ))}
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Verify Code
          </button>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default VerifyOtp;