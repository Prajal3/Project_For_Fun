import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Eye, EyeOff, MessageCircle } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api/axios";
import { validateLoginForm } from "../../utils/validation";
import { AuthContex } from "../../context/authContex";


const Login = () => {
  const navigate = useNavigate();
  const {login, currentUser} = useContext(AuthContex);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

 const handleLogin = async (e) => {
  e.preventDefault();

  const { isValid, errors } = validateLoginForm({
    email,
    password,
  });

  if (!isValid) {
    const firstError =
      errors.email?.[0] || errors.password?.[0];
    toast.error(firstError);
    return;
  }

  try {
    const res = await api.post("/auth/login", { email, password });

    toast.success("Welcome back 👋");
    localStorage.setItem("token", res.data.token);

    setTimeout(() => navigate("/home"), 1500);
  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-sm">

        {/* Logo / Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-full mb-3">
            <MessageCircle className="text-white w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold">Chat Login</h2>
          <p className="text-sm text-gray-500">
            Sign in to continue chatting
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email address"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password with toggle */}
          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500 hover:text-indigo-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>

        {/* Signup */}
        <p className="text-center text-sm mt-5">
          Don’t have an account?{" "}
          <span
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default Login;
