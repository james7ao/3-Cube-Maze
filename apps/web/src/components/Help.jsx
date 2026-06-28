export default function Help() {
  return (
    <div id="help" className="panel help">
      <h2>How to play</h2>
      Move with <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / arrows through the lit maze layer.
      Reach a <span style={{ color: 'var(--pivot)' }}>purple pivot</span> tile, then{' '}
      <span className="pill rot">rotate the cube</span>
      with <kbd>Q</kbd><kbd>E</kbd> (roll) or <kbd>R</kbd><kbd>F</kbd> (tumble) — this turns a wall you can't pass
      into a new floor, revealing fresh layers. Get the{' '}
      <span style={{ color: 'var(--accent2)' }}>gold marker</span> onto the
      <span style={{ color: 'var(--good)' }}>green goal</span>. Drag to orbit. Toggle <kbd>V</kbd> for flat 2D.
    </div>
  );
}
