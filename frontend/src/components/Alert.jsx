export const Alert = ({ type = 'error', children, role = 'alert' }) => {
    const kind = type === 'success' ? 'success' : 'error';
    return (
        <div className={`alert alert--${kind}`} role={role}>
            {typeof children === 'string' ? <p>{children}</p> : children}
        </div>
    );
};
