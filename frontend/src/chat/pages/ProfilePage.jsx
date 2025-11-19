import { avatars } from '../../assets/avatar';
import { Alert } from '../../auth/components/Alert';
import { AvatarPicker } from '../components/AvatarPicker';
import { useProfileForm } from '../hooks/useProfileForm';
import { Role } from '../../core/entities/Role';

export const ProfilePage = () => {
    const {
        currentIcon,
        setCurrentIcon,
        name,
        setName,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        email,
        role,
        isSubmitting,
        resultMessage,
        handleSubmit,
    } = useProfileForm();

    return (
        <div className="profile-page">
            <AvatarPicker
                currentIcon={currentIcon}
                onSelect={setCurrentIcon}
                avatars={avatars}
            />

            <form className="form profile-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Your name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            disabled
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Your email"
                            value={email}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <input
                            disabled
                            type="text"
                            id="role"
                            name="role"
                            value={
                                role
                                    ? new Role(role).getDisplayName()
                                    : 'Student'
                            }
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
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            placeholder="New password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                    </div>
                </div>

                {resultMessage.type && (
                    <Alert type={resultMessage.type}>
                        {resultMessage.text}
                    </Alert>
                )}

                <div className="form-group">
                    <button
                        type="submit"
                        className="button profile-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};
