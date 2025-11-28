import { useEffect, useState } from "react";

import { filterMessages } from "../../../utils/Filter";
// import { checkMessage } from "../../../utils/CheckMessage";
import { aggregateStats } from "../../../utils/Stats";
import { StatsRepository } from "../../../infrastructure/repositories/stats.repository";
import { SaveUserStatsUseCase } from "../../../core/use-cases/stats/save-user-stats.use-case";
import { supabase } from '../../auth/supabase/supabaseClient';

export const AdminPage = () => {
  const [stats, setStats] = useState([]);
  const [topWords, setTopWords] = useState([]);
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
        console.log("Cargando estadísticas...");
      try {
    // ------------------------
    // MENSAJE DE PRUEBA
    // ------------------------
        const testMessage = {
            user: "550e8400-e29b-41d4-a716-446655440001",
            text: "negro bitch damn",
        };

        const messages = [testMessage];
        console.log("📨 Mensajes a procesar:", messages);

        const filtered = filterMessages(messages);
        console.log("✅ Mensajes filtrados:", filtered);

        let allResults = [];
        let wordCounter = {};

        for (const msg of filtered) {
          console.log("🔍 Procesando mensaje:", msg);

          const messageToCheck = {
            user: msg.senderId || msg.user || "unknown",
            content: msg.content || msg.text || ""
          };

          console.log("📤 Enviando a checkMessage:", messageToCheck);
          // const result = await checkMessage(messageToCheck);
          const statsRepository = new StatsRepository(supabase);
          const saveUserStatsUseCase = new SaveUserStatsUseCase(statsRepository);
          
          if (Object.keys(result.badWords).length > 0) {
            await saveUserStatsUseCase.execute(result.user, result.badWords);
          }

          allResults.push(result);

          for (const [word, count] of Object.entries(result.badWords || {})) {
            wordCounter[word] = (wordCounter[word] || 0) + count;
          }
        }

        console.log("📊 Todos los resultados:", allResults);
        console.log("🔢 Contador de palabras:", wordCounter);

        const aggregated = aggregateStats(allResults);
        console.log("📈 Estadísticas agregadas:", aggregated);
        setStats(aggregated);

        const sortedTop = Object.entries(wordCounter)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);
        setTopWords(sortedTop);

        const total = Object.values(wordCounter).reduce((acc, v) => acc + v, 0);
        setTotalWords(total);

      } catch (err) {
        console.error("Error loading stats:", err);
      }
  };

    loadStats();

}, []);

return ( <div className="admin-page"> <div className="admin-header"> <h1>Global Moderation Statistics</h1> </div>

  <div className="stats-section">
    <div className="stats-card">
      <div className="stats-row">

        <div className="total-words">
          <h3>Total Words</h3>
          <div className="filtered-today">
            <span className="label">Filtered (Today)</span>
            <span className="value">{totalWords.toLocaleString()}</span>
          </div>
        </div>

        <div className="top-words">
          <h3>Top 10 Words</h3>
          <div className="words-list">
            {topWords.length === 0 && <p>No data available</p>}

            {topWords.map(([word, count], index) => (
              <div key={word} className="word-item">
                <span className="rank">{index + 1}.</span>
                <span className="word">{word}</span>
                <span className="count">({count})</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </div>
</div>

);
};

