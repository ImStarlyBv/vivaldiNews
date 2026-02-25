import type { Conflict } from '@/lib/conflicts';

export default function ConflictBanner({
  conflict,
  activeSide = 'A',
}: {
  conflict: Conflict;
  activeSide?: 'A' | 'B' | null;
}) {
  const side = activeSide === 'B' ? conflict.sideB : conflict.sideA;
  return (
    <div
      className="w-full py-2 px-4 text-white text-xs font-semibold text-center tracking-wide"
      style={{ backgroundColor: side.color }}
    >
      <span className="mr-2">{side.flag}</span>
      {side.label}
      <span className="mx-2 opacity-60">·</span>
      <span className="opacity-80 font-normal">{conflict.title}</span>
    </div>
  );
}
