export default function Toast({ state }) {
  const toastClass = state?.lost ? 'toast lose' : 'toast';
  const isVisible = state?.won || state?.lost;

  return (
    <div id="toast" className={`panel ${toastClass} ${isVisible ? 'show' : ''}`}>
      <h2 id="toastTitle">{state?.won ? 'Solved! 🎉' : 'Out of moves'}</h2>
      <p id="toastBody">
        {state?.won
          ? `${state.moves} moves · ${state.rots} rotations`
          : `You spent your ${state?.moveLimit}-action budget.`}
      </p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button className="btn" id="toastRetry">↻ Retry this cube</button>
        <button className="btn" id="toastBtn">✦ New cube</button>
      </div>
    </div>
  );
}
