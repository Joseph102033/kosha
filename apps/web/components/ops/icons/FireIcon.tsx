/**
 * Fire accident icon (화재)
 * Simple, deterministic SVG representation
 */

interface IconProps {
  className?: string;
}

export default function FireIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground */}
      <line x1="0" y1="90" x2="100" y2="90" stroke="#6B7280" strokeWidth="2" />

      {/* Burning object/equipment */}
      <rect x="55" y="60" width="25" height="30" fill="#6B7280" stroke="#4B5563" strokeWidth="1" />

      {/* Flames (layered) */}
      {/* Large flame */}
      <path
        d="M 67 60 Q 62 50 65 40 Q 67 35 70 40 Q 73 35 72 30 Q 75 35 75 40 Q 78 35 77 40 Q 80 50 75 60 Z"
        fill="#EF4444"
        opacity="0.9"
      />
      {/* Medium flame */}
      <path
        d="M 67 60 Q 64 52 67 45 Q 69 42 71 45 Q 73 42 73 38 Q 74 42 74 45 Q 76 42 76 45 Q 79 52 75 60 Z"
        fill="#F59E0B"
        opacity="0.8"
      />
      {/* Small flame */}
      <path
        d="M 67 60 Q 66 54 68 50 Q 69 48 70 50 Q 71 48 71 46 Q 72 48 72 50 Q 73 48 73 50 Q 76 54 73 60 Z"
        fill="#FBBF24"
        opacity="0.7"
      />

      {/* Smoke */}
      <ellipse cx="70" cy="22" rx="8" ry="6" fill="#9CA3AF" opacity="0.5" />
      <ellipse cx="67" cy="16" rx="6" ry="5" fill="#9CA3AF" opacity="0.4" />
      <ellipse cx="73" cy="18" rx="5" ry="4" fill="#9CA3AF" opacity="0.4" />

      {/* Person running away */}
      <circle cx="25" cy="60" r="5" fill="#3B82F6" />
      <line x1="25" y1="65" x2="22" y2="78" stroke="#3B82F6" strokeWidth="2" />
      <line x1="25" y1="68" x2="18" y2="63" stroke="#3B82F6" strokeWidth="2" />
      <line x1="25" y1="68" x2="32" y2="65" stroke="#3B82F6" strokeWidth="2" />
      <line x1="22" y1="78" x2="18" y2="88" stroke="#3B82F6" strokeWidth="2" />
      <line x1="22" y1="78" x2="28" y2="88" stroke="#3B82F6" strokeWidth="2" />

      {/* Motion lines */}
      <path d="M 15 62 L 10 62" stroke="#3B82F6" strokeWidth="1" opacity="0.5" />
      <path d="M 15 68 L 12 68" stroke="#3B82F6" strokeWidth="1" opacity="0.5" />

      {/* Fire extinguisher (not used) */}
      <rect x="85" y="70" width="8" height="18" fill="#EF4444" stroke="#DC2626" strokeWidth="1" rx="1" />
      <rect x="86" y="68" width="6" height="3" fill="#6B7280" stroke="#4B5563" strokeWidth="0.5" />

      {/* Warning symbol */}
      <circle cx="15" cy="15" r="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <text x="15" y="20" textAnchor="middle" fill="#F59E0B" fontSize="16" fontWeight="bold" fontFamily="system-ui">!</text>
    </svg>
  );
}
