export default function RotationHint({ state }) {
  const isVisible = state?.level?.pivots.has(`${state?.p?.[0]},${state?.p?.[1]},${state?.p?.[2]}`) && !state?.won;

  return (
    <div id="rotHint" className={`rot-hint ${isVisible ? 'show' : ''}`}>
      On a pivot — <kbd>Q</kbd><kbd>E</kbd> roll · <kbd>R</kbd><kbd>F</kbd> tumble to rotate the cube
    </div>
  );
}
