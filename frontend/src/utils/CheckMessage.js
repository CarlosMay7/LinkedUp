const DEFAULT_API = 'https://vector.profanity.dev';

export async function checkMessage({ user, content }, { apiUrl = DEFAULT_API, timeout = 7000 } = {}) {
    const messageText = content;
    const result = { user, totalBad: 0, badWords: {}, tokens: [] };
    if (!messageText.trim()) return result;

    try {
        console.log("🔍 Analizando mensaje completo con API:", messageText);
        
        const words = messageText.toLowerCase().split(/\s+/);
        const detectedWords = [];

        for (const word of words) {
            if (word.length > 3 && !isCommonWord(word)) {
                try {
                    console.log(`🔍 Verificando palabra: "${word}"`);
                    const wordResult = await analyzeWordWithAPI(word, apiUrl, timeout);
                    
                    if (wordResult.isProfanity) {
                        const detectedWord = wordResult.flaggedWord || word;
                        detectedWords.push(detectedWord);
                        console.log(`✅ API detectó palabra mala: "${detectedWord}"`);
                    }
                } catch (error) {
                    console.log(`⚠️ Error analizando palabra "${word}":`, error.message);
                }
            }
        }
        
        detectedWords.forEach(word => {
            const cleanWord = word.toLowerCase().trim();
            result.badWords[cleanWord] = (result.badWords[cleanWord] || 0) + 1;
            result.totalBad += 1;
        });
        
        console.log("📊 Resultado final de análisis por palabras:", result);
        
        if (result.totalBad > 0) {
            return result;
        }
        
        console.log("🔄 Intentando análisis del mensaje completo...");
        const fullMessageResult = await analyzeWordWithAPI(messageText, apiUrl, timeout);
        
        if (fullMessageResult.isProfanity && fullMessageResult.flaggedWord) {
            const badWord = fullMessageResult.flaggedWord.toLowerCase();
            result.badWords[badWord] = 1;
            result.totalBad = 1;
            console.log("✅ Mensaje completo detectó palabra:", badWord);
            return result;
        }
        
        console.log("ℹ️ No se detectaron palabras malas con la API");
        return result;

    } catch (err) {
        console.warn('⚠️ API error:', err.message);
    }

    const tokens = Array.from(messageText.toLowerCase().matchAll(/\p{L}+/gu), m => m[0]);
    result.tokens = tokens;

    const localBadWords = ["bitch", "fuck", "shit", "damn", "bullshit", "asshole", "negro"];
    tokens.forEach(t => {
        if (localBadWords.includes(t)) {
            result.badWords[t] = (result.badWords[t] || 0) + 1;
            result.totalBad++;
        }
    });

    return result;
}

async function analyzeWordWithAPI(word, apiUrl, timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: word }),
        signal: controller.signal,
    });
    
    clearTimeout(id);
    
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    
    const json = await res.json();
    return {
        isProfanity: json.isProfanity || false,
        flaggedWord: json.flaggedFor || word,
        score: json.score || 0
    };
}

function isCommonWord(word) {
    const commonWords = [
        'the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 
        'they', 'this', 'have', 'from', 'your', 'what', 'when', 'where',
        'how', 'why', 'which', 'who', 'their', 'there', 'been', 'were',
        'will', 'would', 'could', 'should', 'them', 'then', 'than', 'such'
    ];
    return commonWords.includes(word.toLowerCase());
}
