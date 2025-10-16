/**
 * Explosion accident icon (폭발)
 * Simple, deterministic SVG representation
 */

interface IconProps {
  className?: string;
}

export default function ExplosionIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground */}
      <line x1="0" y1="90" x2="100" y2="90" stroke="#6B7280" strokeWidth="2" />

      {/* Explosion center (burst pattern) */}
      <circle cx="65" cy="50" r="15" fill="#EF4444" opacity="0.8" />
      <circle cx="65" cy="50" r="10" fill="#F59E0B" opacity="0.9" />
      <circle cx="65" cy="50" r="5" fill="#FBBF24" />

      {/* Explosion rays */}
      <path d="M 65 35 L 65 25" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      <path d="M 65 65 L 65 75" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      <path d="M 50 50 L 40 50" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      <path d="M 80 50 L 90 50" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      <path d="M 55 40 L 48 33" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 75 60 L 82 67" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 55 60 L 48 67" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 75 40 L 82 33" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

      {/* Debris/fragments */}
      <rect x="42" y="38" width="4" height="4" fill="#6B7280" transform="rotate(20 44 40)" />
      <rect x="85" y="42" width="3" height="3" fill="#6B7280" transform="rotate(-15 86.5 43.5)" />
      <circle cx="52" cy="70" r="2" fill="#4B5563" />
      <circle cx="78" cy="68" r="2" fill="#4B5563" />

      {/* Smoke cloud */}
      <ellipse cx="65" cy="25" rx="12" ry="8" fill="#9CA3AF" opacity="0.6" />
      <ellipse cx="60" cy="20" rx="8" ry="6" fill="#9CA3AF" opacity="0.5" />
      <ellipse cx="70" cy="22" rx="9" ry="7" fill="#9CA3AF" opacity="0.5" />

      {/* Damaged equipment */}
      <rect x="58" y="70" width="14" height="20" fill="#6B7280" stroke="#4B5563" strokeWidth="1" />
      <line x1="58" y1="75" x2="72" y2="75" stroke="#374151" strokeWidth="1" />

      {/* Person taking cover */}
      <circle cx="20" cy="70" r="5" fill="#3B82F6" />
      <line x1="20" y1="75" x2="25" y2="82" stroke="#3B82F6" strokeWidth="2" />
      <line x1="20" y1="77" x2="12" y2="82" stroke="#3B82F6" strokeWidth="2" />
      <line x1="20" y1="77" x2="28" y2="80" stroke="#3B82F6" strokeWidth="2" />
      <line x1="25" y1="82" x2="25" y2="88" stroke="#3B82F6" strokeWidth="2" />
      <line x1="12" y1="82" x2="10" y2="88" stroke="#3B82F6" strokeWidth="2" />

      {/* Shield (protective barrier) */}
      <path d="M 15 65 Q 12 70 15 75 Q 18 70 15 65" fill="#10B981" opacity="0.7" />

      {/* Warning symbol */}
      <path d="M 90 12 L 85 22 L 95 22 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <text x="90" y="21" textAnchor="middle" fill="#F59E0B" fontSize="12" fontWeight="bold" fontFamily="system-ui">!</text>
    </svg>
  );
}
