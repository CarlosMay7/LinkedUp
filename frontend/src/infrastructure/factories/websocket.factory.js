import { WebSocketRepository } from '../repositories/websocket.repository';
import { FinalizeWebSocketUseCase } from '../../core/use-cases/chat/finalize-websocket.use-case';
import { InitializeWebSocketUseCase } from '../../core/use-cases/chat/initialize-websocket.use-case';
import { JoinRoomUseCase } from '../../core/use-cases/chat/join-room.use-case';
import { LeaveRoomUseCase } from '../../core/use-cases/chat/leave-room.use-case';
import { RegisterUserUseCase } from '../../core/use-cases/chat/register-user.use-case';
import { SendMessageUseCase } from '../../core/use-cases/chat/send-message.use-case';

export class WebSocketFactory {
    static createWebSocketDependencies() {
        const websocketRepository = new WebSocketRepository();

        const finalizeWebSocketUseCase = new FinalizeWebSocketUseCase(
            websocketRepository
        );
        const initializeWebSocketUseCase = new InitializeWebSocketUseCase(
            websocketRepository
        );
        const joinRoomUseCase = new JoinRoomUseCase(websocketRepository);
        const leaveRoomUseCase = new LeaveRoomUseCase(websocketRepository);
        const registerUserUseCase = new RegisterUserUseCase(
            websocketRepository
        );
        const sendMessageUseCase = new SendMessageUseCase(websocketRepository);

        return {
            websocketRepository,
            finalizeWebSocketUseCase,
            initializeWebSocketUseCase,
            joinRoomUseCase,
            leaveRoomUseCase,
            registerUserUseCase,
            sendMessageUseCase,
        };
    }
}
