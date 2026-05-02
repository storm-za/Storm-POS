const BLUE = "hsl(217,90%,40%)";

interface Props {
  className?: string;
}

export default function GrowthAnalyticsIllustration({ className }: Props) {
  return (
    <svg
      viewBox="0 0 480 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Website growth analytics with rising chart, customer count and star rating"
    >
      {/* Main analytics card */}
      <rect x="30" y="30" width="320" height="220" rx="12" fill="white" stroke="#111" strokeWidth="2.5"/>
      {/* Title bar */}
      <rect x="30" y="30" width="320" height="34" rx="12" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="30" y="50" width="320" height="14" fill="white"/>
      <circle cx="48" cy="47" r="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="62" cy="47" r="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="76" cy="47" r="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="160" y="42" width="80" height="10" rx="3" fill="#111"/>
      <rect x="304" y="40" width="36" height="14" rx="4" fill={BLUE}/>

      {/* KPI strip */}
      <rect x="44" y="80" width="92" height="46" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="52" y="86" width="44" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="52" y="96" width="60" height="14" rx="2" fill={BLUE}/>
      <polyline points="116,108 122,100 128,108" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="52" y="115" width="40" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>

      <rect x="142" y="80" width="92" height="46" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="150" y="86" width="44" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="150" y="96" width="56" height="14" rx="2" fill="#111"/>
      <rect x="150" y="115" width="40" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>

      <rect x="240" y="80" width="92" height="46" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="248" y="86" width="44" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="248" y="96" width="50" height="14" rx="2" fill={BLUE}/>
      <polyline points="304,108 310,100 316,108" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="248" y="115" width="40" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>

      {/* Chart area */}
      <rect x="44" y="138" width="288" height="100" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      {/* Axes */}
      <line x1="60" y1="222" x2="320" y2="222" stroke="#111" strokeWidth="1"/>
      <line x1="60" y1="152" x2="60" y2="222" stroke="#111" strokeWidth="1"/>
      {/* Grid lines */}
      {[0.33, 0.66, 1].map((r, i) => (
        <line key={i} x1="60" y1={222 - r * 64} x2="320" y2={222 - r * 64} stroke="#111" strokeWidth="0.5" strokeDasharray="4 3"/>
      ))}
      {/* Area under curve */}
      <path d="M 66 210 L 96 200 L 126 204 L 156 188 L 186 178 L 216 168 L 246 156 L 276 148 L 306 138 L 306 222 L 66 222 Z" fill={BLUE} fillOpacity="0.12"/>
      {/* Trend line */}
      <polyline
        points="66,210 96,200 126,204 156,188 186,178 216,168 246,156 276,148 306,138"
        stroke={BLUE}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Trend dots */}
      <circle cx="66" cy="210" r="3" fill="white" stroke="#111" strokeWidth="1.2"/>
      <circle cx="156" cy="188" r="3" fill="white" stroke="#111" strokeWidth="1.2"/>
      <circle cx="216" cy="168" r="3" fill="white" stroke="#111" strokeWidth="1.2"/>
      <circle cx="306" cy="138" r="6" fill={BLUE} stroke="#111" strokeWidth="1.5"/>
      {/* Up arrow at end */}
      <polyline points="298,144 306,134 314,144" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Floating "+300% sales" callout */}
      <g>
        <rect x="280" y="166" width="116" height="46" rx="8" fill="white" stroke="#111" strokeWidth="2"/>
        <polyline points="298,178 306,170 314,178" stroke={BLUE} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="306" y1="170" x2="306" y2="186" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round"/>
        <text x="328" y="182" fontSize="14" fontWeight="bold" fill={BLUE}>+300%</text>
        <text x="328" y="200" fontSize="9" fill="#111" opacity="0.7">Online Sales</text>
      </g>

      {/* Floating customer count card */}
      <g>
        <rect x="280" y="260" width="170" height="64" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
        {/* Avatars */}
        <circle cx="306" cy="292" r="14" fill="white" stroke="#111" strokeWidth="1.5"/>
        <circle cx="306" cy="288" r="4.5" fill="#111"/>
        <path d="M 296 300 Q 306 294 316 300" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <circle cx="328" cy="292" r="14" fill={BLUE} stroke="#111" strokeWidth="1.5"/>
        <circle cx="328" cy="288" r="4.5" fill="white"/>
        <path d="M 318 300 Q 328 294 338 300" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <circle cx="350" cy="292" r="14" fill="white" stroke="#111" strokeWidth="1.5"/>
        <circle cx="350" cy="288" r="4.5" fill="#111"/>
        <path d="M 340 300 Q 350 294 360 300" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <text x="376" y="290" fontSize="14" fontWeight="bold" fill="#111">2,400+</text>
        <text x="376" y="306" fontSize="9" fill="#111" opacity="0.65">New Visitors</text>
      </g>

      {/* Floating star rating card */}
      <g>
        <rect x="36" y="278" width="200" height="56" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
        {/* Stars */}
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M ${56 + i * 26} 298 l 3.5 7.2 l 7.9 1.1 l -5.7 5.6 l 1.4 7.9 l -7.1 -3.7 l -7.1 3.7 l 1.4 -7.9 l -5.7 -5.6 l 7.9 -1.1 Z`}
            fill={BLUE}
            stroke="#111"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        ))}
        <text x="190" y="312" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#111">4.9 / 5</text>
        <text x="56" y="328" fontSize="9" fill="#111" opacity="0.65">Average client rating across reviews</text>
      </g>

      {/* Floating accents */}
      <circle cx="22" cy="22" r="3" fill={BLUE}/>
      <circle cx="40" cy="38" r="2" fill="#111"/>
      <circle cx="466" cy="22" r="3" fill={BLUE}/>
      <circle cx="20" cy="350" r="2.5" fill="#111"/>
      <circle cx="466" cy="350" r="3" fill={BLUE}/>
    </svg>
  );
}
