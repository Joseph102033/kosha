/**
 * Chemical hazard accident icon (화학물질)
 * Simple, deterministic SVG representation
 */

interface IconProps {
  className?: string;
}

export default function ChemicalIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground */}
      <line x1="0" y1="90" x2="100" y2="90" stroke="#6B7280" strokeWidth="2" />

      {/* Chemical container/drum */}
      <rect x="55" y="55" width="25" height="35" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" rx="2" />
      <ellipse cx="67.5" cy="55" rx="12.5" ry="4" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1" />

      {/* Chemical symbol */}
      <circle cx="67.5" cy="72" r="8" fill="white" opacity="0.9" />
      <text x="67.5" y="77" textAnchor="middle" fill="#DC2626" fontSize="12" fontWeight="bold" fontFamily="system-ui">☠</text>

      {/* Spilled chemical */}
      <ellipse cx="70" cy="90" rx="15" ry="3" fill="#A3E635" opacity="0.6" />
      <path d="M 70 90 Q 65 88 62 85" stroke="#A3E635" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M 70 90 Q 75 88 78 85" stroke="#A3E635" strokeWidth="2" fill="none" opacity="0.6" />

      {/* Vapor/fumes */}
      <path d="M 65 52 Q 63 48 65 44 Q 67 46 65 48" stroke="#9CA3AF" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M 70 50 Q 68 46 70 42 Q 72 44 70 46" stroke="#9CA3AF" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M 75 52 Q 73 48 75 44 Q 77 46 75 48" stroke="#9CA3AF" strokeWidth="1.5" fill="none" opacity="0.5" />

      {/* Person with protective gear */}
      <circle cx="30" cy="60" r="5" fill="#3B82F6" />
      {/* Mask indication */}
      <rect x="27" y="59" width="6" height="3" fill="#6B7280" stroke="#4B5563" strokeWidth="0.5" rx="1" />
      <line x1="30" y1="65" x2="30" y2="78" stroke="#3B82F6" strokeWidth="2" />
      <line x1="30" y1="68" x2="23" y2="73" stroke="#3B82F6" strokeWidth="2" />
      <line x1="30" y1="68" x2="37" y2="73" stroke="#3B82F6" strokeWidth="2" />
      <line x1="30" y1="78" x2="25" y2="88" stroke="#3B82F6" strokeWidth="2" />
      <line x1="30" y1="78" x2="35" y2="88" stroke="#3B82F6" strokeWidth="2" />

      {/* Gloves indication */}
      <circle cx="23" cy="73" r="2" fill="#10B981" />
      <circle cx="37" cy="73" r="2" fill="#10B981" />

      {/* Warning symbol */}
      <path d="M 15 10 L 10 20 L 20 20 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <text x="15" y="19" textAnchor="middle" fill="#F59E0B" fontSize="12" fontWeight="bold" fontFamily="system-ui">!</text>

      {/* Danger label */}
      <rect x="58" y="62" width="19" height="8" fill="#EF4444" stroke="#DC2626" strokeWidth="0.5" rx="1" />
      <text x="67.5" y="68" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="system-ui">위험</text>
    </svg>
  );
}
