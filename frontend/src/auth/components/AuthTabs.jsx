import { NavLink } from "react-router-dom";

export const AuthTabs = () => {
  return (
    <div className="tabs">
      <NavLink
        to="/auth/login"
        className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
      >
        Log In
      </NavLink>

      <NavLink
        to="/auth/register"
        className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
      >
        Create Account
      </NavLink>
    </div>
  );
};
