import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';

export const AccountConfirmationModal = ({ setShowSuccess }) => {
    const navigate = useNavigate();
    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
                <h3>Check your email for confirmation</h3>
                <p>
                    We sent you a confirmation link to finish creating your
                    account.
                </p>
                <div className="modal-actions">
                    <button
                        className="button"
                        onClick={() => {
                            setShowSuccess(false);
                            navigate(ROUTES.AUTH_LOGIN, { replace: true });
                        }}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
    );
};
