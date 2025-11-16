import React, { useState } from 'react';

export const AdminPage = () => {
  const [manualActions, setManualActions] = useState({
    Usuario_X: '',
    Usuario_Y: '',
    Usuario_Z: '',
    Usuario_A: ''
  });

  const [autoBlockThreshold, setAutoBlockThreshold] = useState(100);

  const handleManualAction = (usuario, accion) => {
    setManualActions(prev => ({
      ...prev,
      [usuario]: accion
    }));
  };

  const handleSaveActions = () => {
    console.log('Acciones guardadas:', {
      manualActions,
      autoBlockThreshold
    });
    alert('Acciones guardadas correctamente');
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Estadisticas Globales de Moderación</h1>
      </div>

      <div className="stats-section">
        <div className="stats-card">
          <div className="stats-row">
            <div className="total-words">
              <h3>Total Palabras</h3>
              <div className="filtered-today">
                <span className="label">Filtradas (Hoy)</span>
                <span className="value">{/* Poner estadísticas */}11,204</span>
              </div>
            </div>
            
            <div className="top-words">
              <h3>Top 10 Palabras</h3>
              <div className="words-list">
                <div className="word-item">
                  <span className="rank">1.</span>
                  <span className="word">{/* Poner palabras */}Palabra_A</span>
                  <span className="count">{/* Contador de palabra */}</span>
                </div>
                <div className="word-item">
                  <span className="rank">2.</span>
                  <span className="word">Palabra_B</span>
                  <span className="count">(310)</span>
                </div>
                <div className="word-item">
                  <span className="rank">3.</span>
                  <span className="word">...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="users-section">
        <h2>Gestión Manual de Usuarios</h2>
        <div className="users-table">
          <div className="table-header">
            <div className="col-usuario">Usuario</div>
            <div className="col-mensajes">Mensajes Obscenos</div>
            <div className="col-acciones">Acciones Manuales</div>
          </div>
          
          <div className="table-row">
            <div className="col-usuario">Usuario_X</div>
            <div className="col-mensajes">15</div>
            <div className="col-acciones">
              <button 
                className={`action-btn btn-advertir ${manualActions.Usuario_X === 'advertir' ? 'active' : ''}`}
                onClick={() => handleManualAction('Usuario_X', 'advertir')}
              >
                Advertir
              </button>
              <button 
                className={`action-btn btn-bloquear ${manualActions.Usuario_X === 'bloquear' ? 'active' : ''}`}
                onClick={() => handleManualAction('Usuario_X', 'bloquear')}
              >
                Bloquear
              </button>
            </div>
          </div>
          
          <div className="table-row">
            <div className="col-usuario">Usuario_Y</div>
            <div className="col-mensajes">92</div>
            <div className="col-acciones">
              <span className="advertido">Advertido</span>
              <button 
                className={`action-btn btn-bloquear ${manualActions.Usuario_Y === 'bloquear' ? 'active' : ''}`}
                onClick={() => handleManualAction('Usuario_Y', 'bloquear')}
              >
                Bloquear
              </button>
            </div>
          </div>
          
          <div className="table-row">
            <div className="col-usuario">Usuario_Z</div>
            <div className="col-mensajes">101</div>
            <div className="col-acciones">
              <span className="bloqueado">Bloqueado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="separator"></div>

      <div className="auto-actions-section">
        <h3>Acciones Automáticas</h3>
        <div className="auto-block">
          <p>
            Bloquear cuenta automáticamente al superar 
            <input 
              type="number" 
              value={autoBlockThreshold}
              onChange={(e) => setAutoBlockThreshold(parseInt(e.target.value))}
              className="threshold-input"
            /> 
            mensajes obscenos.
          </p>
        </div>
      </div>

      <div className="save-section">
        <button className="button btn-save" onClick={handleSaveActions}>
          GUARDAR ACCIONES
        </button>
      </div>
    </div>
  );
};
