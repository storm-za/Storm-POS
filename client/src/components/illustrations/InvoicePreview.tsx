const BLUE = "hsl(217,90%,40%)";

interface Props {
  className?: string;
}

export default function InvoicePreview({ className }: Props) {
  return (
    <svg
      viewBox="0 0 380 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Storm POS invoice and quote generator"
    >
      <rect x="40" y="20" width="200" height="260" rx="6" fill="white" stroke="#111" strokeWidth="2"/>
      <rect x="40" y="20" width="200" height="50" rx="6" fill="white" stroke="#111" strokeWidth="2"/>
      <rect x="40" y="48" width="200" height="22" fill="white"/>
      <rect x="48" y="28" width="28" height="28" rx="4" fill={BLUE}/>
      <rect x="52" y="32" width="6" height="20" rx="1" fill="white"/>
      <rect x="60" y="32" width="12" height="4" rx="1" fill="white"/>
      <rect x="60" y="38" width="10" height="4" rx="1" fill="white"/>
      <rect x="60" y="44" width="8" height="4" rx="1" fill="white"/>
      <rect x="82" y="28" width="50" height="8" rx="2" fill="#111"/>
      <rect x="82" y="40" width="30" height="5" rx="2" fill="#d1d5db"/>
      <rect x="82" y="48" width="40" height="4" rx="2" fill="#e5e7eb"/>
      <rect x="168" y="28" width="64" height="22" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
      <rect x="172" y="32" width="30" height="4" rx="2" fill="#e5e7eb"/>
      <rect x="172" y="38" width="50" height="4" rx="2" fill="#e5e7eb"/>
      <rect x="172" y="44" width="40" height="4" rx="2" fill="#e5e7eb"/>
      <rect x="48" y="76" width="80" height="6" rx="2" fill="#111"/>
      <rect x="48" y="86" width="100" height="4" rx="2" fill="#d1d5db"/>
      <rect x="48" y="94" width="80" height="4" rx="2" fill="#d1d5db"/>
      <rect x="48" y="102" width="60" height="4" rx="2" fill="#d1d5db"/>
      <rect x="48" y="116" width="184" height="1" fill="#e5e7eb"/>
      <rect x="48" y="122" width="80" height="5" rx="2" fill="#9ca3af"/>
      <rect x="170" y="122" width="30" height="5" rx="2" fill="#9ca3af"/>
      <rect x="212" y="122" width="20" height="5" rx="2" fill="#9ca3af"/>
      <rect x="48" y="132" width="180" height="1" fill="#e5e7eb"/>
      <rect x="48" y="137" width="70" height="4" rx="2" fill="#374151"/>
      <rect x="170" y="137" width="24" height="4" rx="2" fill="#374151"/>
      <rect x="212" y="137" width="16" height="4" rx="2" fill="#374151"/>
      <rect x="48" y="146" width="80" height="4" rx="2" fill="#d1d5db"/>
      <rect x="170" y="146" width="24" height="4" rx="2" fill="#d1d5db"/>
      <rect x="212" y="146" width="16" height="4" rx="2" fill="#d1d5db"/>
      <rect x="48" y="155" width="90" height="4" rx="2" fill="#d1d5db"/>
      <rect x="170" y="155" width="24" height="4" rx="2" fill="#d1d5db"/>
      <rect x="212" y="155" width="16" height="4" rx="2" fill="#d1d5db"/>
      <rect x="48" y="164" width="60" height="4" rx="2" fill="#d1d5db"/>
      <rect x="170" y="164" width="24" height="4" rx="2" fill="#d1d5db"/>
      <rect x="212" y="164" width="16" height="4" rx="2" fill="#d1d5db"/>
      <rect x="48" y="178" width="184" height="1" fill="#e5e7eb"/>
      <rect x="130" y="184" width="50" height="5" rx="2" fill="#9ca3af"/>
      <rect x="188" y="184" width="44" height="5" rx="2" fill="#374151"/>
      <rect x="130" y="194" width="50" height="5" rx="2" fill="#9ca3af"/>
      <rect x="188" y="194" width="44" height="5" rx="2" fill="#374151"/>
      <rect x="130" y="204" width="50" height="7" rx="2" fill="#111"/>
      <rect x="186" y="204" width="46" height="7" rx="2" fill={BLUE}/>
      <rect x="48" y="220" width="80" height="4" rx="2" fill="#d1d5db"/>
      <rect x="48" y="228" width="60" height="4" rx="2" fill="#d1d5db"/>
      <rect x="48" y="240" width="184" height="1" fill="#e5e7eb"/>
      <rect x="48" y="246" width="100" height="4" rx="2" fill="#e5e7eb"/>
      <rect x="48" y="254" width="80" height="4" rx="2" fill="#e5e7eb"/>
      <g transform="translate(205, 135) rotate(-15)">
        <rect x="-38" y="-18" width="76" height="36" rx="5" fill="none" stroke={BLUE} strokeWidth="3"/>
        <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="bold" fill={BLUE} letterSpacing="4">PAID</text>
      </g>
      <rect x="270" y="50" width="90" height="110" rx="5" fill="white" stroke="#d1d5db" strokeWidth="1.5" opacity="0.8"/>
      <rect x="270" y="50" width="90" height="30" rx="5" fill="white" stroke="#d1d5db" strokeWidth="1.5" opacity="0.8"/>
      <rect x="270" y="62" width="90" height="18" fill="white" opacity="0.8"/>
      <rect x="276" y="55" width="22" height="22" rx="3" fill={BLUE} opacity="0.7"/>
      <rect x="302" y="57" width="40" height="6" rx="2" fill="#9ca3af" opacity="0.8"/>
      <rect x="302" y="65" width="28" height="4" rx="2" fill="#d1d5db" opacity="0.8"/>
      <rect x="276" y="88" width="76" height="4" rx="2" fill="#e5e7eb" opacity="0.8"/>
      <rect x="276" y="96" width="60" height="4" rx="2" fill="#e5e7eb" opacity="0.8"/>
      <rect x="276" y="104" width="70" height="4" rx="2" fill="#e5e7eb" opacity="0.8"/>
      <rect x="276" y="112" width="50" height="4" rx="2" fill="#e5e7eb" opacity="0.8"/>
      <rect x="276" y="124" width="76" height="18" rx="4" fill={BLUE} opacity="0.8"/>
      <rect x="280" y="128" width="40" height="4" rx="2" fill="white" opacity="0.9"/>
      <g transform="translate(310, 105) rotate(-12)">
        <rect x="-28" y="-14" width="56" height="28" rx="4" fill="none" stroke={BLUE} strokeWidth="2.5" opacity="0.7"/>
        <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="bold" fill={BLUE} letterSpacing="3" opacity="0.7">DRAFT</text>
      </g>
    </svg>
  );
}
