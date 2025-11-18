export const RoomPage = () => {
    return (
        <>
            <div className="room-header">
                <button className="back-button">&lt; Back</button>
                <h2 className="room-title">Mayumitos</h2>
            </div>

            <div className="room-content">
                <div className="messages-area">
                    <div className="messages-list">
                        <div className="message other">
                            <span className="user-name">User A</span>
                            <p className="message-text">Hello World!.</p>
                            <span className="timestamp">10:30 AM</span>
                        </div>

                        <div className="message mine">
                            <p className="message-text">...</p>
                            <span className="timestamp">[You] 10:31 AM</span>
                        </div>

                        <div className="message other">
                            <span className="user-name">User B</span>
                            <p className="message-text">
                                This is a{' '}
                                <span className="censored">********</span>
                                message
                            </p>
                            <span className="timestamp">10:31 AM</span>
                        </div>

                        <div className="message mine hola-style">
                            <p className="message-text">Hi!</p>
                            <span className="timestamp">10:32 AM</span>
                        </div>
                    </div>
                </div>

                <div className="room-members-container">
                    <h3 className="area-title">Users: 23</h3>
                    <ul className="members-list">
                        {' '}
                        <li>
                            <span className="user-icon"></span>
                            <span className="member-name">User A</span>
                        </li>{' '}
                        <li>
                            <span className="user-icon"></span>
                            <span className="member-name">
                                User B Lorem ipsum dolor sit, amet consectetur
                                adipisicing elit. Esse, eum. Nihil cumque,
                                ducimus aliquid optio adipisci maiores labore
                                doloremque eius! Similique tenetur provident et
                                quaerat ullam iusto veniam aliquam obcaecati.
                            </span>
                        </li>{' '}
                        <li>
                            <span className="user-icon"></span>
                            <span className="member-name">You</span>
                        </li>{' '}
                        <li>
                            <span className="user-icon"></span>
                            <span className="member-name">User C</span>
                        </li>
                    </ul>
                </div>
            </div>

            <form className="message-input-container">
                <input
                    type="text"
                    placeholder="Message..."
                    className="message-input"
                />
                <button type="submit" className="send-button button">
                    SEND
                </button>
            </form>
        </>
    );
};

export default RoomPage;
