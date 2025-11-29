import React from 'react';

export default function AchievementsPanel({ achievements }) {
  if (!achievements || achievements.length === 0) {
    return null;
  }

  return (
    <div className="achievements-panel">
      <div className="achievements-header">
        <h3>🏆 Logros Desbloqueados</h3>
      </div>
      <div className="achievements-grid">
        {achievements.map(achievement => (
          <div key={achievement.id} className="achievement-card">
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-content">
              <h4>{achievement.name}</h4>
              <p>{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}