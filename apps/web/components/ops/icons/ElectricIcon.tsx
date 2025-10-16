/**
 * Electric shock accident icon (감전)
 * Simple, deterministic SVG representation
 */

interface IconProps {
  className?: string;
}

export default function ElectricIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground */}
      <line x1="0" y1="90" x2="100" y2="90" stroke="#6B7280" strokeWidth="2" />

      {/* Electrical panel */}
      <rect x="60" y="30" width="25" height="35" fill="#374151" stroke="#1F2937" strokeWidth="1" />
      <rect x="63" y="35" width="8" height="8" fill="#EF4444" stroke="#DC2626" strokeWidth="0.5" />
      <rect x="73" y="35" width="8" height="8" fill="#10B981" stroke="#059669" strokeWidth="0.5" />
      <rect x="63" y="48" width="18" height="12" fill="#6B7280" stroke="#4B5563" strokeWidth="0.5" />

      {/* Exposed wire */}
      <path d="M 75 65 Q 70 70 65 75 Q 60 80 55 82" stroke="#F59E0B" strokeWidth="2" fill="none" />
      <circle cx="55" cy="82" r="2" fill="#F59E0B" />

      {/* Person touching wire */}
      <circle cx="40" cy="60" r="5" fill="#3B82F6" />
      <line x1="40" y1="65" x2="40" y2="78" stroke="#3B82F6" strokeWidth="2" />
      <line x1="40" y1="70" x2="32" y2="75" stroke="#3B82F6" strokeWidth="2" />
      <line x1="40" y1="70" x2="55" y2="82" stroke="#3B82F6" strokeWidth="2" />
      <line x1="40" y1="78" x2="35" y2="88" stroke="#3B82F6" strokeWidth="2" />
      <line x1="40" y1="78" x2="45" y2="88" stroke="#3B82F6" strokeWidth="2" />

      {/* Electric shock effect (lightning bolts) */}
      <path d="M 50 75 L 48 78 L 50 78 L 48 82" stroke="#FBBF24" strokeWidth="1.5" fill="none" strokeLinejoin="miter" />
      <path d="M 52 77 L 50 80 L 52 80 L 50 84" stroke="#FBBF24" strokeWidth="1.5" fill="none" strokeLinejoin="miter" />

      {/* Danger symbol */}
      <path d="M 20 15 L 15 25 L 25 25 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <text x="20" y="24" textAnchor="middle" fill="#F59E0B" fontSize="14" fontWeight="bold" fontFamily="system-ui">!</text>

      {/* Voltage warning */}
      <text x="70" y="25" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold" fontFamily="system-ui">220V</text>
    </svg>
  );
}
