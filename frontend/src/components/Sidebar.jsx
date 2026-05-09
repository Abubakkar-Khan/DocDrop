/**
 * Sidebar — Navigation component
 */
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineShieldCheck,
  HiOutlineCloudArrowUp,
  HiOutlineInbox,
  HiOutlinePaperAirplane,
  HiOutlineArrowRightOnRectangle,
  HiOutlineUser,
  HiOutlineKey,
} from "react-icons/hi2";

const navItems = [
  {
    to: "/dashboard/upload",
    icon: HiOutlineCloudArrowUp,
    label: "Upload & Sign",
  },
  { to: "/dashboard/inbox", icon: HiOutlineInbox, label: "Inbox" },
  {
    to: "/dashboard/sent",
    icon: HiOutlinePaperAirplane,
    label: "Sent Documents",
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-surface-card border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
            <HiOutlineShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text tracking-tight leading-none">
              DocDrop
            </h1>
            <p className="text-[10px] text-text-light uppercase tracking-widest mt-0.5">
              Digital Signatures
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/8 text-primary"
                  : "text-text-muted hover:bg-surface-alt hover:text-text"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <HiOutlineUser className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text truncate">
              {user?.username}
            </p>
            <p className="text-[10px] text-text-light flex items-center gap-1">
              <HiOutlineKey className="w-3 h-3" />
              RSA-2048 keypair active
            </p>
          </div>
        </div>
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-error-50 hover:text-error transition-all duration-200"
        >
          <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
