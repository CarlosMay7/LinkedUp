import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../config/constants';

export const AuthTabs = () => {
    return (
        <div className="tabs">
            <NavLink
                to={ROUTES.AUTH_LOGIN}
                className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
            >
                Log In
            </NavLink>

            <NavLink
                to={ROUTES.AUTH_REGISTER}
                className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
            >
                Create Account
            </NavLink>
        </div>
    );
};
