const BLUE = "hsl(217,90%,40%)";

interface Props {
  className?: string;
}

export default function WebBuildHeroIllustration({ className }: Props) {
  return (
    <svg
      viewBox="0 0 540 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Website being assembled in a browser with mobile preview"
    >
      {/* Browser window */}
      <rect x="30" y="40" width="380" height="280" rx="12" fill="white" stroke="#111" strokeWidth="2.5"/>
      {/* Title bar */}
      <rect x="30" y="40" width="380" height="34" rx="12" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="30" y="60" width="380" height="14" fill="white"/>
      <circle cx="50" cy="57" r="5" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="68" cy="57" r="5" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="86" cy="57" r="5" fill="white" stroke="#111" strokeWidth="1.5"/>
      {/* Address bar */}
      <rect x="110" y="50" width="240" height="16" rx="8" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="120" cy="58" r="3" fill={BLUE}/>
      <rect x="130" y="55" width="120" height="6" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="362" y="52" width="36" height="12" rx="4" fill="white" stroke="#111" strokeWidth="1.2"/>

      {/* Hero band of the site (assembled) */}
      <rect x="46" y="86" width="348" height="74" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="60" y="100" width="160" height="12" rx="3" fill="#111"/>
      <rect x="60" y="118" width="200" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="60" y="128" width="160" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1"/>
      <rect x="60" y="142" width="80" height="14" rx="4" fill={BLUE} stroke="#111" strokeWidth="1.5"/>
      <rect x="70" y="147" width="60" height="4" rx="2" fill="white"/>
      <rect x="148" y="142" width="64" height="14" rx="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="158" y="147" width="44" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      {/* Hero illustration tile within hero band */}
      <rect x="280" y="98" width="100" height="56" rx="5" fill="white" stroke="#111" strokeWidth="1.2"/>
      <circle cx="298" cy="118" r="6" fill={BLUE}/>
      <polyline points="290,150 304,134 318,142 332,124 348,130 372,116" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="372" cy="116" r="3" fill={BLUE}/>

      {/* Three feature blocks - third is being assembled (dashed) */}
      <rect x="46" y="174" width="108" height="76" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="60" y="186" width="20" height="20" rx="4" fill={BLUE}/>
      <polyline points="64,196 68,200 76,192" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="60" y="214" width="70" height="6" rx="2" fill="#111"/>
      <rect x="60" y="226" width="80" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="60" y="234" width="60" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>

      <rect x="166" y="174" width="108" height="76" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="180" y="186" width="20" height="20" rx="4" fill="white" stroke="#111" strokeWidth="1.5"/>
      <circle cx="190" cy="196" r="4" fill={BLUE}/>
      <rect x="180" y="214" width="70" height="6" rx="2" fill="#111"/>
      <rect x="180" y="226" width="80" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="180" y="234" width="60" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>

      <rect x="286" y="174" width="108" height="76" rx="6" fill="white" stroke="#111" strokeWidth="1.5" strokeDasharray="5 4"/>
      <rect x="300" y="186" width="20" height="20" rx="4" fill="white" stroke="#111" strokeWidth="1.5" strokeDasharray="3 2"/>
      <rect x="300" y="214" width="70" height="6" rx="2" fill="white" stroke="#111" strokeWidth="1" strokeDasharray="3 2"/>
      <rect x="300" y="226" width="80" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8" strokeDasharray="3 2"/>
      <rect x="300" y="234" width="60" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8" strokeDasharray="3 2"/>

      {/* Footer band */}
      <rect x="46" y="264" width="348" height="44" rx="6" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="60" y="278" width="60" height="6" rx="2" fill="#111"/>
      <rect x="60" y="290" width="120" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="320" y="278" width="60" height="20" rx="4" fill={BLUE} stroke="#111" strokeWidth="1.5"/>
      <rect x="332" y="285" width="36" height="6" rx="2" fill="white"/>

      {/* Cursor pointing into third tile */}
      <path d="M 340 220 L 354 232 L 348 234 L 350 244 L 346 245 L 344 235 L 338 238 Z" fill="white" stroke="#111" strokeWidth="1.5" strokeLinejoin="round"/>

      {/* Floating mobile preview frame */}
      <rect x="420" y="100" width="98" height="200" rx="14" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="420" y="100" width="98" height="20" rx="14" fill="white" stroke="#111" strokeWidth="2.5"/>
      <rect x="420" y="112" width="98" height="8" fill="white"/>
      <rect x="448" y="106" width="42" height="6" rx="3" fill="white" stroke="#111" strokeWidth="1"/>
      {/* Mobile content */}
      <rect x="430" y="128" width="78" height="36" rx="4" fill={BLUE}/>
      <rect x="438" y="138" width="48" height="4" rx="2" fill="white"/>
      <rect x="438" y="146" width="40" height="4" rx="2" fill="white"/>
      <rect x="438" y="155" width="32" height="4" rx="2" fill="white"/>
      <rect x="430" y="172" width="78" height="6" rx="2" fill="#111"/>
      <rect x="430" y="184" width="68" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="430" y="192" width="72" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="430" y="200" width="58" height="4" rx="2" fill="white" stroke="#111" strokeWidth="0.8"/>
      {/* mini cards */}
      <rect x="430" y="214" width="36" height="38" rx="4" fill="white" stroke="#111" strokeWidth="1.2"/>
      <rect x="436" y="220" width="14" height="14" rx="3" fill={BLUE}/>
      <rect x="436" y="240" width="24" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="436" y="246" width="20" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="472" y="214" width="36" height="38" rx="4" fill="white" stroke="#111" strokeWidth="1.2"/>
      <rect x="478" y="220" width="14" height="14" rx="3" fill="white" stroke="#111" strokeWidth="1.2"/>
      <rect x="478" y="240" width="24" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      <rect x="478" y="246" width="20" height="3" rx="1.5" fill="white" stroke="#111" strokeWidth="0.8"/>
      {/* CTA button */}
      <rect x="430" y="262" width="78" height="22" rx="5" fill="white" stroke="#111" strokeWidth="1.5"/>
      <rect x="446" y="269" width="46" height="6" rx="2" fill="#111"/>
      {/* Home indicator */}
      <rect x="454" y="290" width="30" height="3" rx="1.5" fill="#111"/>

      {/* Sync connector dotted between desktop and mobile */}
      <path d="M 410 200 Q 416 200 420 200" stroke="#111" strokeWidth="1.5" strokeDasharray="4 3" fill="none"/>
      <circle cx="412" cy="200" r="3" fill={BLUE}/>

      {/* Floating accent dots */}
      <circle cx="22" cy="22" r="3.5" fill={BLUE}/>
      <circle cx="40" cy="36" r="2" fill="#111"/>
      <circle cx="528" cy="92" r="3" fill={BLUE}/>
      <circle cx="514" cy="78" r="2" fill="#111"/>
      <circle cx="20" cy="368" r="3" fill={BLUE}/>
      <circle cx="40" cy="384" r="2" fill="#111"/>
      <circle cx="524" cy="320" r="3" fill={BLUE}/>
    </svg>
  );
}
