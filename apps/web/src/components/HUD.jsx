export default function HUD({ state }) {
  if (!state) return null;

  return (
    <div id="hud" className="panel hud">
      <h1>🧊 CUBE MAZE</h1>
      <div className="hud-row">
        <span>Layer (depth)</span>
        <b>{state.p ? state.p[0] + 1 + ' / ' + state.N : '–'}</b>
      </div>
      <div className="hud-row">
        <span>Up-axis</span>
        <b>{'–'}</b>
      </div>
      <div className="hud-row">
        <span>Moves</span>
        <b>{state.moves}</b>
      </div>
      <div className="hud-row">
        <span>Rotations</span>
        <b>{state.rots}</b>
      </div>
      <div className="hud-row">
        <span>Best solve</span>
        <b>{state.level?.par || '–'}</b>
      </div>
      <div className="hud-row">
        <span>Budget left</span>
        <b>{Math.max(0, state.moveLimit - (state.moves + state.rots))} / {state.moveLimit}</b>
      </div>
      <div className="hud-row">
        <span>Goal</span>
        <b>{state.won ? 'reached ✓' : (state.lost ? 'out of moves' : 'find it')}</b>
      </div>
    </div>
  );
}
