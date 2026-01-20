import { useState } from "react";
import { LogOut, MessageSquare, Globe, Video } from "lucide-react";

const Home = () => {
  const [user] = useState({
    name: "Alex Johnson",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  });

  const [onlineUsers] = useState(1847);

  const chatModes = [
    {
      title: "Text Chat",
      description: "Connect with random strangers worldwide",
      icon: MessageSquare,
      gradient: "from-indigo-600 to-purple-600",
      action: () => console.log("Start text chat"),
    },
    {
      title: "Video Chat",
      description: "Face-to-face conversations instantly",
      icon: Video,
      gradient: "from-purple-600 to-pink-600",
      action: () => console.log("Start video chat"),
    },
  ];

  const stats = [
    {
      label: "Online Now",
      value: onlineUsers.toLocaleString(),
      icon: Globe,
      color: "text-green-300",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
            />
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-white/80 text-sm">Ready to chat!</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex justify-center mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/20 backdrop-blur-xl rounded-xl p-4 w-64 text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon className={stat.color} size={18} />
                  <span className="text-white/80 text-xs font-medium">
                    {stat.label}
                  </span>
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 text-white">
            Start Chatting Now
          </h1>
          <p className="text-white/80 text-lg">
            Choose how you want to connect
          </p>
        </div>

        {/* Chat Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {chatModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <div
                key={index}
                onClick={mode.action}
                className="group cursor-pointer bg-white/20 backdrop-blur-xl rounded-2xl p-6 hover:bg-white/30 transition hover:scale-105"
              >
                <div
                  className={`inline-flex p-4 rounded-xl bg-linear-to-br ${mode.gradient} mb-4`}
                >
                  <Icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {mode.title}
                </h3>
                <p className="text-white/80">{mode.description}</p>
              </div>
            );
          })}
        </div>

        {/* Random Chat */}
        <div className="flex justify-center">
          <button className="px-8 py-4 bg-linear-to-r from-indigo-600 to-pink-600 rounded-full text-white font-bold text-lg hover:scale-105 transition">
            <span className="flex items-center gap-3">
              
              Random Chat Now
              
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Home;
