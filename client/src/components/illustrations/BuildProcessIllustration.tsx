const BLUE = "hsl(217,90%,40%)";

interface Props {
  className?: string;
}

export default function BuildProcessIllustration({ className }: Props) {
  return (
    <svg
      viewBox="0 0 720 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Discovery, design, development, launch process"
    >
      {/* Connecting line */}
      <line x1="100" y1="110" x2="620" y2="110" stroke="#111" strokeWidth="1.5" strokeDasharray="6 5"/>

      {/* Node 1: Discovery (magnifier) */}
      <circle cx="100" cy="110" r="42" fill="white" stroke="#111" strokeWidth="2.5"/>
      <circle cx="100" cy="110" r="42" fill={BLUE} fillOpacity="0.08"/>
      <circle cx="94" cy="104" r="14" fill="white" stroke="#111" strokeWidth="2"/>
      <line x1="104" y1="114" x2="116" y2="126" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="94" cy="104" r="6" fill={BLUE}/>
      {/* Step badge */}
      <circle cx="138" cy="78" r="12" fill={BLUE} stroke="#111" strokeWidth="1.5"/>
      <text x="138" y="78" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold" fill="white">1</text>
      {/* Label */}
      <text x="100" y="180" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#111">Discovery</text>
      <text x="100" y="198" textAnchor="middle" fontSize="10" fill="#111" opacity="0.65">Goals & vision</text>

      {/* Connector dot */}
      <circle cx="200" cy="110" r="4" fill={BLUE}/>

      {/* Node 2: Design (palette) */}
      <circle cx="280" cy="110" r="42" fill="white" stroke="#111" strokeWidth="2.5"/>
      <circle cx="280" cy="110" r="42" fill={BLUE} fillOpacity="0.08"/>
      {/* Palette */}
      <path d="M 270 92 Q 254 100 256 116 Q 258 130 274 130 Q 278 130 278 126 Q 278 122 282 122 Q 290 122 294 116 Q 304 102 286 92 Q 280 89 270 92 Z" fill="white" stroke="#111" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="266" cy="104" r="2.5" fill="#111"/>
      <circle cx="276" cy="100" r="2.5" fill={BLUE}/>
      <circle cx="286" cy="106" r="2.5" fill="#111"/>
      <circle cx="282" cy="116" r="2.5" fill={BLUE}/>
      {/* Brush */}
      <line x1="294" y1="118" x2="306" y2="130" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
      <rect x="304" y="126" width="6" height="8" rx="1.5" fill={BLUE} stroke="#111" strokeWidth="1.2" transform="rotate(45 307 130)"/>
      {/* Step badge */}
      <circle cx="318" cy="78" r="12" fill={BLUE} stroke="#111" strokeWidth="1.5"/>
      <text x="318" y="78" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold" fill="white">2</text>
      <text x="280" y="180" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#111">Design</text>
      <text x="280" y="198" textAnchor="middle" fontSize="10" fill="#111" opacity="0.65">Brand & layout</text>

      {/* Connector dot */}
      <circle cx="380" cy="110" r="4" fill={BLUE}/>

      {/* Node 3: Development (code brackets) */}
      <circle cx="460" cy="110" r="42" fill="white" stroke="#111" strokeWidth="2.5"/>
      <circle cx="460" cy="110" r="42" fill={BLUE} fillOpacity="0.08"/>
      {/* Code window */}
      <rect x="438" y="92" width="44" height="36" rx="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="438" y="92" width="44" height="8" rx="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="438" y="96" width="44" height="4" fill="white"/>
      <circle cx="442" cy="96" r="1.2" fill="#111"/>
      <circle cx="446" cy="96" r="1.2" fill="#111"/>
      <circle cx="450" cy="96" r="1.2" fill="#111"/>
      {/* Code brackets */}
      <polyline points="446,108 442,114 446,120" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="474,108 478,114 474,120" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="454" y1="122" x2="468" y2="106" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Step badge */}
      <circle cx="498" cy="78" r="12" fill={BLUE} stroke="#111" strokeWidth="1.5"/>
      <text x="498" y="78" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold" fill="white">3</text>
      <text x="460" y="180" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#111">Development</text>
      <text x="460" y="198" textAnchor="middle" fontSize="10" fill="#111" opacity="0.65">Build & test</text>

      {/* Connector dot */}
      <circle cx="560" cy="110" r="4" fill={BLUE}/>

      {/* Node 4: Launch (rocket) */}
      <circle cx="620" cy="110" r="42" fill="white" stroke="#111" strokeWidth="2.5"/>
      <circle cx="620" cy="110" r="42" fill={BLUE} fillOpacity="0.08"/>
      {/* Rocket body */}
      <path d="M 620 88 Q 632 100 632 116 L 620 124 L 608 116 Q 608 100 620 88 Z" fill="white" stroke="#111" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="620" cy="106" r="4" fill={BLUE} stroke="#111" strokeWidth="1.5"/>
      {/* Fins */}
      <path d="M 608 116 L 600 128 L 614 124 Z" fill="white" stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M 632 116 L 640 128 L 626 124 Z" fill="white" stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Flame */}
      <path d="M 614 124 Q 620 138 626 124 L 622 132 L 620 136 L 618 132 Z" fill={BLUE} stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Step badge */}
      <circle cx="658" cy="78" r="12" fill={BLUE} stroke="#111" strokeWidth="1.5"/>
      <text x="658" y="78" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold" fill="white">4</text>
      <text x="620" y="180" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#111">Launch</text>
      <text x="620" y="198" textAnchor="middle" fontSize="10" fill="#111" opacity="0.65">Go live</text>

      {/* Floating accents */}
      <circle cx="40" cy="40" r="3" fill={BLUE}/>
      <circle cx="20" cy="60" r="2" fill="#111"/>
      <circle cx="700" cy="40" r="3" fill={BLUE}/>
      <circle cx="690" cy="180" r="2.5" fill="#111"/>
      <circle cx="20" cy="170" r="2.5" fill={BLUE}/>
    </svg>
  );
}
