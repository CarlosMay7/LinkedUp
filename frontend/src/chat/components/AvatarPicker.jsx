import { useState } from 'react';

export const AvatarPicker = ({ currentIcon, onSelect, avatars }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleSelectIcon = icon => {
        onSelect(icon);
        setIsPickerOpen(false);
    };

    return (
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
    );
};
