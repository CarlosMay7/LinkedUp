import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, RegisterPage } from "../pages";
import { AuthLayout } from "../components/AuthLayout";
import '../auth.css';

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="/*" element={<Navigate to="/auth/login" />} />
      </Route>
    </Routes>
  );
};
