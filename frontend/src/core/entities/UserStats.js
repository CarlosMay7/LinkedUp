export class UserStats {
    constructor({ userId, messages = 0, totalBad = 0, words = {} }) {
        this.userId = userId;
        this.messages = messages;
        this.totalBad = totalBad;
        this.words = words;
    }
}
