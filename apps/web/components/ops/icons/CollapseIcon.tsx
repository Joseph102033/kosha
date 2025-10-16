/**
 * Collapse/fall accident icon (전도/붕괴)
 * Simple, deterministic SVG representation
 */

interface IconProps {
  className?: string;
}

export default function CollapseIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground */}
      <line x1="0" y1="90" x2="100" y2="90" stroke="#6B7280" strokeWidth="2" />

      {/* Collapsing structure (tilted) */}
      <path
        d="M 55 30 L 75 30 L 78 85 L 52 85 Z"
        fill="#D1D5DB"
        stroke="#6B7280"
        strokeWidth="1"
        transform="rotate(15 65 57.5)"
      />

      {/* Cracks in structure */}
      <line x1="62" y1="40" x2="60" y2="55" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2,2" transform="rotate(15 65 57.5)" />
      <line x1="70" y1="45" x2="68" y2="60" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2,2" transform="rotate(15 65 57.5)" />

      {/* Falling debris */}
      <rect x="48" y="50" width="6" height="6" fill="#9CA3AF" transform="rotate(25 51 53)" />
      <rect x="72" y="55" width="5" height="5" fill="#9CA3AF" transform="rotate(-20 74.5 57.5)" />
      <rect x="60" y="62" width="4" height="4" fill="#6B7280" transform="rotate(10 62 64)" />
      <circle cx="68" cy="68" r="2" fill="#4B5563" />
      <circle cx="55" cy="65" r="2" fill="#4B5563" />

      {/* Motion lines (indicating movement) */}
      <path d="M 75 35 Q 77 37 79 35" stroke="#EF4444" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M 73 45 Q 75 47 77 45" stroke="#EF4444" strokeWidth="1" fill="none" opacity="0.6" />
      <path d="M 71 55 Q 73 57 75 55" stroke="#EF4444" strokeWidth="1" fill="none" opacity="0.6" />

      {/* Person running away */}
      <circle cx="25" cy="65" r="5" fill="#3B82F6" />
      <line x1="25" y1="70" x2="22" y2="80" stroke="#3B82F6" strokeWidth="2" />
      <line x1="25" y1="73" x2="18" y2="70" stroke="#3B82F6" strokeWidth="2" />
      <line x1="25" y1="73" x2="32" y2="76" stroke="#3B82F6" strokeWidth="2" />
      <line x1="22" y1="80" x2="18" y2="88" stroke="#3B82F6" strokeWidth="2" />
      <line x1="22" y1="80" x2="27" y2="88" stroke="#3B82F6" strokeWidth="2" />

      {/* Running motion lines */}
      <path d="M 15 67 L 10 67" stroke="#3B82F6" strokeWidth="1" opacity="0.5" />
      <path d="M 15 73 L 12 73" stroke="#3B82F6" strokeWidth="1" opacity="0.5" />

      {/* Support/scaffolding (unstable) */}
      <line x1="50" y1="85" x2="50" y2="75" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="80" y1="85" x2="82" y2="72" stroke="#9CA3AF" strokeWidth="2" />
      <line x1="50" y1="75" x2="82" y2="72" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="3,3" />

      {/* Warning symbol */}
      <circle cx="15" cy="15" r="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <text x="15" y="20" textAnchor="middle" fill="#F59E0B" fontSize="16" fontWeight="bold" fontFamily="system-ui">!</text>

      {/* Danger zone marking */}
      <path d="M 45 88 L 85 88" stroke="#EF4444" strokeWidth="2" strokeDasharray="4,4" opacity="0.7" />
    </svg>
  );
}
