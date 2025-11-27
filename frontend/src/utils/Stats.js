export function aggregateStats(perMessageResults) {
    const users = {}; 

    for (const r of perMessageResults) {
        const u = r.user || 'unknown';
        if (!users[u]) users[u] = { totalBad: 0, messages: 0, words: {} };
        users[u].totalBad += r.totalBad || 0;
        users[u].messages += 1;
        const bw = r.badWords || {};
        for (const [w, c] of Object.entries(bw)) {
            users[u].words[w] = (users[u].words[w] || 0) + c;
        }
    }

    const arr = Object.entries(users).map(([user, stats]) => ({ user, ...stats }));
    arr.sort((a, b) => b.totalBad - a.totalBad);
    return arr;
}