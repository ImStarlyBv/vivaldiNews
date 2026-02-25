export default function ConflictBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white uppercase tracking-wider ${className}`}
    >
      ⚡ Both Sides
    </span>
  );
}
