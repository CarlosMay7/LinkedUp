import { useEffect, useState } from 'react';
import { avatars } from '../../assets/avatar';
import { useAuth } from '../../auth/context/AuthContext';

export const ProfilePage = () => {
    const { metaData } = useAuth();
    const defaultIcon = avatars['avatar1.png'];
    const [currentIcon, setCurrentIcon] = useState(
        metaData?.profilePicture || defaultIcon
    );
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    useEffect(() => {
        if (metaData?.profilePicture) {
            setCurrentIcon(metaData.profilePicture);
        }
    }, [metaData?.profilePicture]);

    const handleSelectIcon = icon => {
        setCurrentIcon(icon);
        setIsPickerOpen(false);
    };

    return (
        <div className="profile-page">
            <section className="avatar-section">
                <div className="avatar">
                    <img
                        src={currentIcon}
                        alt="User avatar"
                        className="avatar-current"
                    />
                </div>

                <button
                    type="button"
                    className="button"
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                >
                    Change Icon
                </button>

                <div className={`avatar-picker ${isPickerOpen ? 'show' : ''}`}>
                    {Object.entries(avatars).map(([name, src]) => (
                        <img
                            key={name}
                            src={src}
                            alt={name}
                            className={`avatar-option ${
                                src === currentIcon ? 'selected' : ''
                            }`}
                            onClick={() => handleSelectIcon(src)}
                        />
                    ))}
                </div>
            </section>

            <form className="form profile-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Your name"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Your email"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="password">Current Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Current password"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            placeholder="New password"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <button type="submit" className="button profile-button">
                        Save changes
                    </button>
                </div>
            </form>
        </div>
    );
};
