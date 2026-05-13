/**
 * Sidebar — High-Doodly Production version (Stable)
 */
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RoughBox, RoughButton } from "./Rough/RoughComponents";
import DoodleIcon from "./Rough/DoodleIcon";

const navItems = [
  { to: "/dashboard/upload", icon: "upload", label: "Upload & Sign" },
  { to: "/dashboard/inbox", icon: "inbox", label: "Inbox" },
  { to: "/dashboard/sent", icon: "send", label: "Sent Documents" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-80 h-screen bg-transparent flex flex-col shrink-0 p-8 relative z-20">
      <RoughBox className="h-full bg-white flex flex-col" options={{ roughness: 1.5, bowing: 2 }}>
        {/* Logo */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DoodleIcon name="shield" size={40} color="#0066FF" className="rotate-3" />
            <h1 className="text-4xl font-doodle">DocDrop</h1>
          </div>
          <p className="text-[10px] uppercase tracking-widest opacity-40 font-sans font-bold">Enterprise Cryptography</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-4 py-3 px-4 transition-all rounded-lg ${
                  isActive 
                    ? "text-accent bg-accent/5 translate-x-2" 
                    : "text-primary hover:bg-surface-dim"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <DoodleIcon 
                    name={item.icon} 
                    size={24} 
                    color={isActive ? "#0066FF" : "#222222"} 
                    className={isActive ? "scale-110" : ""}
                  />
                  <span className="text-lg font-hand">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="pt-8 border-t border-dashed border-primary/20">
          <div className="flex items-center gap-3 mb-6 px-4">
            <div className="w-10 h-10 rounded-full border border-primary bg-surface-dim flex items-center justify-center overflow-hidden">
              <DoodleIcon name="user" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase opacity-40 font-sans font-bold">Authorized Node</p>
              <p className="text-lg font-hand truncate leading-tight">{user?.username}</p>
            </div>
          </div>
          <RoughButton 
            onClick={handleLogout} 
            color="#FFF0F0"
            className="w-full"
          >
            <div className="flex items-center justify-center gap-2">
              <DoodleIcon name="logout" size={18} color="#FF3300" />
              <span>Sign Out</span>
            </div>
          </RoughButton>
        </div>
      </RoughBox>
    </aside>
  );
}
