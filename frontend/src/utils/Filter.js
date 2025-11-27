export function filterMessages(messages, options = {}) {

    const { minLength = 2, onlyUsers = null } = options;

    return messages
        .filter(m => m && (typeof m.text === 'string' || typeof m.content === 'string'))
        .map(m => ({ id: m.id ?? null, user: m.user ?? 'unknown', text: m.text || m.content }))
        .filter(m => m.text.trim().length >= minLength)
        .filter(m => (onlyUsers ? onlyUsers.includes(m.user) : true));
}