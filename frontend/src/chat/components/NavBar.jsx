import { Link, useLocation } from 'react-router-dom';
import logoSrc from '../../assets/logo/Logo2.png';
import profileSrc from '../../assets/icon/profile.svg';
import logoutSrc from '../../assets/icon/logout.svg';

export const NavBar = () => {
    const location = useLocation();
    const { pathname } = location;

    const paths = {
        '/profile': 'Profile',
        '/admin': 'Admin Panel',
    };

    const title = paths[pathname] || '';

    return (
        <nav
            className={`container navbar ${pathname.includes('room') ? 'dont-show' : ''}`}
        >
            <div className="nav-logo">
                <Link to="/" className="logo">
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
                    to="/profile"
                    className={`profile-icon ${pathname === '/profile' ? 'dont-show' : ''}`}
                >
                    <img src={profileSrc} alt="profile" />
                </Link>
                <Link to="/auth/logout" className="logout-icon">
                    <img src={logoutSrc} alt="profile icon" />
                </Link>
            </div>
        </nav>
    );
};
