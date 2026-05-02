const BLUE = "hsl(217,90%,40%)";

interface Props {
  className?: string;
}

export default function PricingIntelligenceIllustration({ className }: Props) {
  return (
    <svg
      viewBox="0 0 480 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Competitor pricing dashboard with AI trend analysis"
    >
      {/* Dashboard frame */}
      <rect x="20" y="30" width="440" height="220" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
      {/* Title bar */}
      <rect x="20" y="30" width="440" height="30" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="20" y="48" width="440" height="12" fill="white"/>
      <rect x="34" y="40" width="80" height="8" rx="3" fill="#111"/>
      <rect x="124" y="40" width="40" height="8" rx="3" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="380" y="38" width="64" height="12" rx="4" fill={BLUE}/>
      <rect x="390" y="42" width="44" height="4" rx="2" fill="white"/>

      {/* Trend chart area (top) */}
      <rect x="36" y="72" width="280" height="100" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="44" y="80" width="60" height="6" rx="2" fill="#111"/>
      <rect x="44" y="92" width="40" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      {/* Axes */}
      <line x1="50" y1="160" x2="306" y2="160" stroke="#111" strokeWidth="1"/>
      <line x1="50" y1="108" x2="50" y2="160" stroke="#111" strokeWidth="1"/>
      {/* Grid */}
      {[0.33, 0.66, 1].map((r, i) => (
        <line key={i} x1="50" y1={160 - r * 48} x2="306" y2={160 - r * 48} stroke="#111" strokeWidth="0.5" strokeDasharray="4 3"/>
      ))}
      {/* Rising trend line - blue */}
      <polyline
        points="56,150 88,142 120,148 152,134 184,128 216,118 248,120 280,108 300,102"
        stroke={BLUE}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Trend dots */}
      <circle cx="56" cy="150" r="3" fill="white" stroke="#111" strokeWidth="1.2"/>
      <circle cx="120" cy="148" r="3" fill="white" stroke="#111" strokeWidth="1.2"/>
      <circle cx="184" cy="128" r="3" fill="white" stroke="#111" strokeWidth="1.2"/>
      <circle cx="248" cy="120" r="3" fill="white" stroke="#111" strokeWidth="1.2"/>
      <circle cx="300" cy="102" r="5" fill={BLUE} stroke="#111" strokeWidth="1.5"/>
      {/* Up arrow at end */}
      <polyline points="294,108 300,100 306,108" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Right-side stat panel */}
      <rect x="328" y="72" width="116" height="48" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="338" y="80" width="50" height="5" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="338" y="90" width="60" height="12" rx="2" fill={BLUE}/>
      <rect x="338" y="106" width="40" height="4" rx="2" fill="#111"/>
      <polyline points="412,108 418,102 424,108" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* AI / robot node (corner) */}
      <rect x="328" y="128" width="116" height="44" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      {/* Robot head */}
      <rect x="338" y="136" width="28" height="24" rx="5" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="346" cy="148" r="2.5" fill={BLUE}/>
      <circle cx="358" cy="148" r="2.5" fill={BLUE}/>
      <line x1="352" y1="132" x2="352" y2="136" stroke="#111" strokeWidth="1.5"/>
      <circle cx="352" cy="130" r="2" fill={BLUE}/>
      <rect x="346" y="154" width="12" height="3" rx="1" fill="#111"/>
      {/* AI label */}
      <rect x="374" y="138" width="60" height="6" rx="2" fill="#111"/>
      <rect x="374" y="148" width="50" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="374" y="156" width="40" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>

      {/* Competitor price cards (bottom row) */}
      {/* Card 1 */}
      <rect x="36" y="184" width="130" height="56" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="46" y="192" width="40" height="5" rx="2" fill="#111"/>
      <rect x="46" y="201" width="60" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="46" y="214" width="56" height="14" rx="3" fill={BLUE}/>
      <rect x="52" y="218" width="44" height="6" rx="2" fill="white"/>
      <polyline points="148,222 154,216 160,222" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Card 2 */}
      <rect x="174" y="184" width="130" height="56" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="184" y="192" width="40" height="5" rx="2" fill="#111"/>
      <rect x="184" y="201" width="60" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="184" y="214" width="56" height="14" rx="3" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="190" y="218" width="44" height="6" rx="2" fill="#111"/>
      <polyline points="286,216 292,222 298,216" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Card 3 */}
      <rect x="312" y="184" width="132" height="56" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="322" y="192" width="40" height="5" rx="2" fill="#111"/>
      <rect x="322" y="201" width="60" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="322" y="214" width="56" height="14" rx="3" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="328" y="218" width="44" height="6" rx="2" fill="#111"/>
      <polyline points="426,216 432,222 438,216" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Data flow arrows from cards up to chart */}
      <path d="M 100 184 Q 100 174 130 174" stroke="#111" strokeWidth="1.2" strokeDasharray="3 2" fill="none"/>
      <circle cx="130" cy="174" r="2.5" fill={BLUE}/>
      <path d="M 240 184 Q 240 176 220 176" stroke="#111" strokeWidth="1.2" strokeDasharray="3 2" fill="none"/>
      <circle cx="220" cy="176" r="2.5" fill={BLUE}/>
      <path d="M 378 184 Q 378 156 386 150" stroke="#111" strokeWidth="1.2" strokeDasharray="3 2" fill="none"/>
      <circle cx="386" cy="150" r="2.5" fill={BLUE}/>

      {/* Floating accents */}
      <circle cx="22" cy="20" r="3" fill={BLUE}/>
      <circle cx="466" cy="20" r="2.5" fill="#111"/>
      <circle cx="22" cy="266" r="2" fill="#111"/>
      <circle cx="466" cy="266" r="3" fill={BLUE}/>
    </svg>
  );
}
