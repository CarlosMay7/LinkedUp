import { Link, useLocation } from 'react-router-dom';
import logoSrc from '../../assets/logo/Logo2.png';
import profileSrc from '../../assets/icon/profile.svg';
import logoutSrc from '../../assets/icon/logout.svg';
import { ROUTES } from '../../config/constants';

export const NavBar = () => {
    const location = useLocation();
    const { pathname } = location;

    const paths = {
        [ROUTES.PROFILE]: 'Profile',
        [ROUTES.ADMIN]: 'Admin Panel',
        [ROUTES.HOME]: 'Lobby',
    };

    const title = paths[pathname] || '';

    return (
        <nav
            className={`container navbar ${pathname.includes('room') ? 'dont-show' : ''}`}
        >
            <div className="nav-logo">
                <Link to={ROUTES.HOME} className="logo">
                    <img
                        src={logoSrc}
                        alt="LinkedUp Logo"
                        className="brand-logo"
                    />
                </Link>
            </div>

            <div>
                <h1 className="nav-title">{title}</h1>
            </div>

            <div className="nav-actions">
                <Link
                    to={ROUTES.PROFILE}
                    className={`profile-icon ${pathname === ROUTES.PROFILE ? 'dont-show' : ''}`}
                >
                    <img src={profileSrc} alt="profile" />
                </Link>
                <Link to={ROUTES.AUTH_LOGOUT} className="logout-icon">
                    <img src={logoutSrc} alt="logout icon" />
                </Link>
            </div>
        </nav>
    );
};
