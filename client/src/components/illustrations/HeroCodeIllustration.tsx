const BLUE = "hsl(217,90%,40%)";

interface Props {
  className?: string;
}

export default function HeroCodeIllustration({ className }: Props) {
  return (
    <svg
      viewBox="0 0 520 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Code editor with deployment terminal"
    >
      {/* Editor window shadow */}
      <rect x="30" y="40" width="430" height="290" rx="12" fill="white" stroke="#111" strokeWidth="2.5"/>

      {/* Title bar */}
      <rect x="30" y="40" width="430" height="32" rx="12" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="30" y="60" width="430" height="12" fill="white"/>
      {/* Traffic-light dots */}
      <circle cx="50" cy="56" r="5" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="68" cy="56" r="5" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="86" cy="56" r="5" fill="white" stroke="#111" strokeWidth="1.5"/>
      {/* File tab */}
      <rect x="120" y="48" width="90" height="20" rx="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="128" y="55" width="60" height="6" rx="2" fill="#111"/>
      <rect x="220" y="48" width="70" height="20" rx="4" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="228" y="55" width="44" height="5" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>

      {/* Line numbers gutter */}
      <line x1="76" y1="80" x2="76" y2="320" stroke="#111" strokeWidth="1"/>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <rect key={`ln-${i}`} x="48" y={92 + i * 20} width="20" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      ))}

      {/* Active line highlight - blue */}
      <rect x="76" y="148" width="384" height="20" fill={BLUE} fillOpacity="0.1"/>
      <rect x="76" y="148" width="3" height="20" fill={BLUE}/>

      {/* Code lines as coloured/outlined bars */}
      {/* Line 1 */}
      <rect x="90" y="92" width="40" height="6" rx="2" fill="#111"/>
      <rect x="136" y="92" width="60" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="202" y="92" width="30" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      {/* Line 2 (indented) */}
      <rect x="106" y="112" width="50" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="162" y="112" width="80" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="248" y="112" width="40" height="6" rx="2" fill={BLUE}/>
      {/* Line 3 */}
      <rect x="106" y="132" width="36" height="6" rx="2" fill="#111"/>
      <rect x="148" y="132" width="100" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      {/* Line 4 (active) */}
      <rect x="122" y="152" width="48" height="6" rx="2" fill={BLUE}/>
      <rect x="176" y="152" width="60" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="242" y="152" width="80" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="328" y="152" width="40" height="6" rx="2" fill="#111"/>
      {/* Line 5 */}
      <rect x="122" y="172" width="40" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="168" y="172" width="70" height="6" rx="2" fill={BLUE}/>
      <rect x="244" y="172" width="50" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      {/* Line 6 */}
      <rect x="106" y="192" width="20" height="6" rx="2" fill="#111"/>
      {/* Line 7 (blank-ish) */}
      <rect x="90" y="212" width="60" height="6" rx="2" fill="#111"/>
      <rect x="156" y="212" width="100" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      {/* Line 8 */}
      <rect x="106" y="232" width="44" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="156" y="232" width="80" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="242" y="232" width="60" height="6" rx="2" fill={BLUE}/>
      {/* Line 9 */}
      <rect x="106" y="252" width="36" height="6" rx="2" fill="#111"/>
      <rect x="148" y="252" width="120" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      {/* Line 10 */}
      <rect x="90" y="272" width="20" height="6" rx="2" fill="#111"/>
      {/* Line 11 */}
      <rect x="90" y="292" width="50" height="6" rx="2" fill="#111"/>
      <rect x="146" y="292" width="80" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>

      {/* Status bar */}
      <line x1="30" y1="306" x2="460" y2="306" stroke="#111" strokeWidth="1"/>
      <circle cx="48" cy="318" r="3" fill={BLUE}/>
      <rect x="58" y="315" width="60" height="5" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="128" y="315" width="40" height="5" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="400" y="315" width="50" height="5" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>

      {/* Floating terminal / deploy panel */}
      <rect x="260" y="240" width="230" height="130" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
      {/* Terminal title bar */}
      <rect x="260" y="240" width="230" height="26" rx="10" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="260" y="256" width="230" height="10" fill="white"/>
      <circle cx="276" cy="253" r="4" fill="white" stroke="#111" strokeWidth="1.2"/>
      <circle cx="290" cy="253" r="4" fill="white" stroke="#111" strokeWidth="1.2"/>
      <circle cx="304" cy="253" r="4" fill="white" stroke="#111" strokeWidth="1.2"/>
      <rect x="340" y="248" width="60" height="8" rx="2" fill="#111"/>

      {/* Terminal lines */}
      <rect x="272" y="278" width="10" height="5" rx="1.5" fill={BLUE}/>
      <rect x="288" y="278" width="120" height="5" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="272" y="290" width="10" height="5" rx="1.5" fill={BLUE}/>
      <rect x="288" y="290" width="80" height="5" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="374" y="290" width="60" height="5" rx="1.5" fill="#111"/>
      <rect x="272" y="302" width="10" height="5" rx="1.5" fill={BLUE}/>
      <rect x="288" y="302" width="100" height="5" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="272" y="314" width="60" height="5" rx="1.5" fill="#111"/>
      <rect x="338" y="314" width="80" height="5" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>

      {/* Deploy button - blue */}
      <rect x="288" y="334" width="90" height="24" rx="6" fill={BLUE} stroke="#111" strokeWidth="2"/>
      <rect x="302" y="343" width="48" height="6" rx="2" fill="white"/>
      <polyline points="358,346 363,343 358,340" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Status check */}
      <circle cx="400" cy="346" r="9" fill="white" stroke="#111" strokeWidth="1.5"/>
      <polyline points="395,346 399,350 405,341" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Floating spark accents */}
      <circle cx="490" cy="60" r="4" fill={BLUE}/>
      <circle cx="478" cy="78" r="2.5" fill="#111"/>
      <circle cx="22" cy="350" r="3" fill={BLUE}/>
      <circle cx="38" cy="372" r="2" fill="#111"/>
    </svg>
  );
}
