import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import api from "../../api/axios";
import "react-toastify/dist/ReactToastify.css";
import { validateSignupForm } from "../../utils/validation";


const Signup = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

 const handleSignup = async (e) => {
  e.preventDefault();

  const { isValid, errors } = validateSignupForm({
    fullName,
    email,
    password,
  });

  if (!isValid) {
    const firstError =
      errors.fullName?.[0] ||
      errors.email?.[0] ||
      errors.password?.[0];

    toast.error(firstError);
    return;
  }

  try {
    await api.post("/auth/signup", {
      fullname: fullName,
      email,
      password,
    });

    toast.success("OTP sent to your email 📩");

    setTimeout(() => {
      navigate("/verify-otp", { state: { email } });
    }, 1200);
  } catch (err) {
    toast.error(err.response?.data?.message || "Signup failed");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-sm">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-full mb-3">
            <UserPlus className="text-white w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-sm text-gray-500">
            Join the conversation 💬
          </p>
        </div>

        <form onSubmit={handleSignup}>
          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email address"
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password with toggle */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-indigo-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Sign Up
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm mt-5">
          Already have an account?{" "}
          <span
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default Signup;