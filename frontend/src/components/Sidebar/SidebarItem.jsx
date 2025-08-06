import { Link, useLocation } from "react-router-dom";
import './Sidebar.css';

function SidebarItem({ label, to, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={`sidebar-item ${isActive ? "active" : ""}`}>
      <span className="item-icon">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default SidebarItem;
