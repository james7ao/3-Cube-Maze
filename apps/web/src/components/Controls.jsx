export default function Controls({ state }) {
  return (
    <div className="controls">
      <button className="btn active" id="view3d">3D view</button>
      <button className="btn" id="view2d">2D view</button>
      <div className="seg" style={{ marginTop: '4px' }}>
        <button className="btn" data-size="3">3³</button>
        <button className="btn active" data-size="5">5³</button>
        <button className="btn" data-size="7">7³</button>
      </div>
      <button className="btn" id="restart">↻ New cube</button>
      <button className="btn" id="solve" style={{ marginTop: '4px' }}>🧭 Stuck? Auto-solve</button>
    </div>
  );
}
