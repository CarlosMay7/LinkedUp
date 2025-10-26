import { Outlet } from "react-router-dom";
import { Logo } from "../../components/Logo";
import { AuthTabs } from "./AuthTabs";

export const AuthLayout = () => {
  return (
    <div className="login-page-wrapper">
      <Logo />

      <div className="login-card">
        <AuthTabs />

        <Outlet />
      </div>
    </div>
  );
};
