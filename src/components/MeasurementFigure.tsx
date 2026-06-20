// Crisp SVG abaya figure with the active measurement line highlighted.
// Mirrors automatically in RTL via the `rtl-flip` class.
type Props = { active: string };

const ACTIVE = '#B79189'; // rose
const FAINT = 'rgba(43,41,38,0.18)';

function line(key: string, active: string) {
  return key === active ? ACTIVE : FAINT;
}
function w(key: string, active: string) {
  return key === active ? 2.5 : 1;
}

export function MeasurementFigure({ active }: Props) {
  return (
    <svg viewBox="0 0 220 340" className="w-full h-auto rtl-flip" role="img" aria-label={`Measurement diagram: ${active}`}>
      {/* abaya silhouette */}
      <path
        d="M110 28
           c-10 0 -18 6 -22 14
           l-34 12 c-6 2 -8 6 -6 12 l8 26 c1 4 6 5 9 3 l10 -6
           c-4 60 -10 140 -12 220 c-1 8 4 10 12 10 l66 0 c8 0 13 -2 12 -10
           c-2 -80 -8 -160 -12 -220 l10 6 c3 2 8 1 9 -3 l8 -26 c2 -6 0 -10 -6 -12
           l-34 -12 c-4 -8 -12 -14 -22 -14 z"
        fill="#F7F3EC"
        stroke="rgba(43,41,38,0.45)"
        strokeWidth="1.5"
      />
      {/* head */}
      <circle cx="110" cy="16" r="11" fill="#F7F3EC" stroke="rgba(43,41,38,0.45)" strokeWidth="1.5" />

      {/* neck */}
      <line x1="98" y1="30" x2="122" y2="30" stroke={line('neck', active)} strokeWidth={w('neck', active)} strokeDasharray="3 2" />
      {/* shoulderWidth */}
      <line x1="70" y1="48" x2="150" y2="48" stroke={line('shoulderWidth', active)} strokeWidth={w('shoulderWidth', active)} strokeDasharray="3 2" />
      {/* bust */}
      <line x1="64" y1="86" x2="156" y2="86" stroke={line('bust', active)} strokeWidth={w('bust', active)} strokeDasharray="3 2" />
      {/* waist */}
      <line x1="70" y1="120" x2="150" y2="120" stroke={line('waist', active)} strokeWidth={w('waist', active)} strokeDasharray="3 2" />
      {/* hips */}
      <line x1="64" y1="158" x2="156" y2="158" stroke={line('hips', active)} strokeWidth={w('hips', active)} strokeDasharray="3 2" />
      {/* armWidth (upper arm) */}
      <line x1="48" y1="70" x2="70" y2="70" stroke={line('armWidth', active)} strokeWidth={w('armWidth', active)} strokeDasharray="3 2" />
      {/* sleeveLength (down the arm) */}
      <line x1="52" y1="56" x2="40" y2="120" stroke={line('sleeveLength', active)} strokeWidth={w('sleeveLength', active)} strokeDasharray="3 2" />
      {/* totalLength (shoulder to hem) */}
      <line x1="180" y1="44" x2="180" y2="318" stroke={line('totalLength', active)} strokeWidth={w('totalLength', active)} strokeDasharray="3 2" />
      <text x="186" y="184" fontSize="9" fill={active === 'totalLength' ? ACTIVE : FAINT} transform="rotate(90 186 184)">length</text>
    </svg>
  );
}
