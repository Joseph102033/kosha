/**
 * Fall accident icon (추락)
 * Simple, deterministic SVG representation
 */

interface IconProps {
  className?: string;
}

export default function FallIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground */}
      <line x1="0" y1="90" x2="100" y2="90" stroke="#6B7280" strokeWidth="2" />

      {/* Building/Structure */}
      <rect x="60" y="20" width="30" height="70" fill="#D1D5DB" stroke="#6B7280" strokeWidth="1" />

      {/* Ladder */}
      <line x1="65" y1="40" x2="65" y2="85" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="72" y1="40" x2="72" y2="85" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="65" y1="50" x2="72" y2="50" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="65" y1="60" x2="72" y2="60" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="65" y1="70" x2="72" y2="70" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="65" y1="80" x2="72" y2="80" stroke="#9CA3AF" strokeWidth="1" />

      {/* Falling person (stick figure) */}
      <circle cx="40" cy="50" r="5" fill="#EF4444" />
      <line x1="40" y1="55" x2="40" y2="70" stroke="#EF4444" strokeWidth="2" />
      <line x1="40" y1="60" x2="32" y2="68" stroke="#EF4444" strokeWidth="2" />
      <line x1="40" y1="60" x2="48" y2="68" stroke="#EF4444" strokeWidth="2" />
      <line x1="40" y1="70" x2="33" y2="78" stroke="#EF4444" strokeWidth="2" />
      <line x1="40" y1="70" x2="47" y2="78" stroke="#EF4444" strokeWidth="2" />

      {/* Motion lines */}
      <path d="M 50 45 Q 52 47 50 49" stroke="#EF4444" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M 45 42 Q 47 44 45 46" stroke="#EF4444" strokeWidth="1" fill="none" opacity="0.5" />

      {/* Warning symbol */}
      <circle cx="15" cy="15" r="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <text x="15" y="20" textAnchor="middle" fill="#F59E0B" fontSize="16" fontWeight="bold" fontFamily="system-ui">!</text>
    </svg>
  );
}
