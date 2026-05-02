const BLUE = "hsl(217,90%,40%)";

interface Props {
  className?: string;
}

export default function WebDevIllustration({ className }: Props) {
  return (
    <svg
      viewBox="0 0 480 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Responsive website being designed in a browser"
    >
      {/* Browser window */}
      <rect x="20" y="30" width="360" height="220" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
      {/* Browser chrome */}
      <rect x="20" y="30" width="360" height="32" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="20" y="50" width="360" height="12" fill="white"/>
      <circle cx="38" cy="46" r="4.5" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="54" cy="46" r="4.5" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="70" cy="46" r="4.5" fill="white" stroke="#111" strokeWidth="1.5"/>
      {/* Address bar */}
      <rect x="92" y="38" width="240" height="16" rx="8" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="102" cy="46" r="3" fill={BLUE}/>
      <rect x="112" y="43" width="120" height="6" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="340" y="40" width="32" height="12" rx="4" fill="white" stroke="#111" strokeWidth="1.2"/>

      {/* Site nav skeleton (left panel) */}
      <rect x="36" y="76" width="80" height="160" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="44" y="86" width="40" height="6" rx="2" fill="#111"/>
      <rect x="44" y="100" width="64" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="44" y="110" width="56" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="44" y="120" width="60" height="4" rx="2" fill={BLUE}/>
      <rect x="44" y="130" width="50" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="44" y="140" width="58" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <line x1="44" y1="154" x2="108" y2="154" stroke="#111" strokeWidth="0.8"/>
      <rect x="44" y="162" width="40" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="44" y="172" width="50" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="44" y="182" width="44" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="44" y="200" width="56" height="20" rx="4" fill={BLUE}/>

      {/* Hero block being assembled (centre panel) */}
      <rect x="124" y="76" width="248" height="160" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      {/* Hero headline */}
      <rect x="136" y="90" width="140" height="10" rx="3" fill="#111"/>
      <rect x="136" y="106" width="180" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="136" y="116" width="160" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="136" y="126" width="120" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      {/* Hero CTA - blue */}
      <rect x="136" y="142" width="80" height="20" rx="6" fill={BLUE} stroke="#111" strokeWidth="1.5"/>
      <rect x="148" y="149" width="56" height="6" rx="2" fill="white"/>
      <rect x="224" y="142" width="80" height="20" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="240" y="149" width="48" height="6" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      {/* Three feature blocks */}
      <rect x="136" y="174" width="68" height="50" rx="5" fill="white" stroke="#111" strokeWidth="1.2"/>
      <rect x="146" y="182" width="14" height="14" rx="3" fill={BLUE}/>
      <rect x="146" y="202" width="48" height="4" rx="2" fill="#111"/>
      <rect x="146" y="210" width="40" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="146" y="216" width="32" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="214" y="174" width="68" height="50" rx="5" fill="white" stroke="#111" strokeWidth="1.2"/>
      <rect x="224" y="182" width="14" height="14" rx="3" fill="white" stroke="#111" strokeWidth="1.2"/>
      <rect x="224" y="202" width="48" height="4" rx="2" fill="#111"/>
      <rect x="224" y="210" width="40" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="224" y="216" width="32" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="292" y="174" width="68" height="50" rx="5" fill="white" stroke="#111" strokeWidth="1.2" strokeDasharray="4 3"/>
      <rect x="302" y="182" width="14" height="14" rx="3" fill="white" stroke="#111" strokeWidth="1.2" strokeDasharray="3 2"/>
      <rect x="302" y="202" width="48" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8" strokeDasharray="3 2"/>
      <rect x="302" y="210" width="40" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8" strokeDasharray="3 2"/>

      {/* Mobile-frame preview (right) */}
      <rect x="396" y="80" width="68" height="140" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="396" y="80" width="68" height="14" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="396" y="88" width="68" height="6" fill="white"/>
      <rect x="416" y="84" width="28" height="4" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      {/* Mobile content */}
      <rect x="402" y="100" width="56" height="22" rx="3" fill={BLUE}/>
      <rect x="408" y="108" width="40" height="3" rx="1.5" fill="white"/>
      <rect x="408" y="114" width="32" height="3" rx="1.5" fill="white"/>
      <rect x="402" y="128" width="56" height="6" rx="2" fill="#111"/>
      <rect x="402" y="138" width="48" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="402" y="146" width="50" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="402" y="156" width="44" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="402" y="170" width="56" height="14" rx="3" fill="white" stroke="#111" strokeWidth="1.2"/>
      <rect x="406" y="174" width="48" height="6" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="402" y="190" width="56" height="14" rx="3" fill="white" stroke="#111" strokeWidth="1.2"/>
      <rect x="406" y="194" width="48" height="6" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <circle cx="430" cy="212" r="3" fill={BLUE}/>

      {/* Cursor / building accent */}
      <path d="M 296 130 L 308 142 L 302 144 L 304 152 L 300 153 L 298 145 L 294 148 Z" fill="white" stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>

      {/* Connector to mobile preview */}
      <path d="M 372 150 Q 384 150 392 150" stroke="#111" strokeWidth="1.5" strokeDasharray="4 3" fill="none"/>
      <circle cx="392" cy="150" r="3" fill={BLUE}/>

      {/* Floating accent dots */}
      <circle cx="20" cy="20" r="3" fill={BLUE}/>
      <circle cx="466" cy="40" r="2.5" fill="#111"/>
      <circle cx="32" cy="266" r="2" fill="#111"/>
      <circle cx="448" cy="258" r="3" fill={BLUE}/>
    </svg>
  );
}
