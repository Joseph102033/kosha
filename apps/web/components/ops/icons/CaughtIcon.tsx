/**
 * Caught/pinched accident icon (끼임)
 * Simple, deterministic SVG representation
 */

interface IconProps {
  className?: string;
}

export default function CaughtIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground */}
      <line x1="0" y1="90" x2="100" y2="90" stroke="#6B7280" strokeWidth="2" />

      {/* Machine/Equipment base */}
      <rect x="40" y="70" width="40" height="20" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />

      {/* Moving parts (press/roller) */}
      <rect x="45" y="40" width="30" height="8" fill="#6B7280" stroke="#374151" strokeWidth="1" />
      <rect x="45" y="55" width="30" height="8" fill="#6B7280" stroke="#374151" strokeWidth="1" />

      {/* Caught hand/arm */}
      <ellipse cx="60" cy="52" rx="8" ry="3" fill="#EF4444" />
      <line x1="50" y1="52" x2="60" y2="52" stroke="#EF4444" strokeWidth="3" />

      {/* Person (stick figure) */}
      <circle cx="25" cy="55" r="5" fill="#3B82F6" />
      <line x1="25" y1="60" x2="25" y2="75" stroke="#3B82F6" strokeWidth="2" />
      <line x1="25" y1="65" x2="50" y2="52" stroke="#3B82F6" strokeWidth="2" />
      <line x1="25" y1="65" x2="18" y2="72" stroke="#3B82F6" strokeWidth="2" />
      <line x1="25" y1="75" x2="20" y2="85" stroke="#3B82F6" strokeWidth="2" />
      <line x1="25" y1="75" x2="30" y2="85" stroke="#3B82F6" strokeWidth="2" />

      {/* Danger arrows */}
      <path d="M 60 35 L 60 38 M 58 36 L 60 38 L 62 36" stroke="#EF4444" strokeWidth="1.5" fill="none" />
      <path d="M 60 65 L 60 62 M 58 64 L 60 62 L 62 64" stroke="#EF4444" strokeWidth="1.5" fill="none" />

      {/* Warning symbol */}
      <circle cx="85" cy="15" r="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <text x="85" y="20" textAnchor="middle" fill="#F59E0B" fontSize="16" fontWeight="bold" fontFamily="system-ui">!</text>
    </svg>
  );
}
