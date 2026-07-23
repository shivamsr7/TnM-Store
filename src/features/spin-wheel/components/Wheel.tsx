import { rewards } from "../data/rewards";

const SIZE = 250;
const RADIUS = 110;
const CENTER = SIZE / 2;

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number
) {
  const rad = ((angle - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(rad),
    y: centerY + radius * Math.sin(rad),
  };
}

export default function Wheel({
  onSpin,
}: {
  onSpin?: () => void;
}) {
  const angle = 360 / rewards.length;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="drop-shadow-2xl"
    >
        <defs>
  {/* Gold Rim */}
  <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#FFF7CC" />
    <stop offset="35%" stopColor="#F4D35E" />
    <stop offset="70%" stopColor="#D4AF37" />
    <stop offset="100%" stopColor="#A67C00" />
  </linearGradient>

  {/* Cream */}
  <linearGradient id="seg1" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#FFFDF8" />
    <stop offset="100%" stopColor="#F8EFD8" />
  </linearGradient>

  {/* Pink */}
  <linearGradient id="seg2" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#FFEAF2" />
    <stop offset="100%" stopColor="#FBCFE8" />
  </linearGradient>

  {/* Blue */}
  <linearGradient id="seg3" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#EEF6FF" />
    <stop offset="100%" stopColor="#BFDBFE" />
  </linearGradient>

  {/* Mint */}
  <linearGradient id="seg4" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#F1FFF6" />
    <stop offset="100%" stopColor="#BBF7D0" />
  </linearGradient>

  {/* Peach */}
  <linearGradient id="seg5" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#FFF3E8" />
    <stop offset="100%" stopColor="#FED7AA" />
  </linearGradient>

  {/* Lavender */}
  <linearGradient id="seg6" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#F8F2FF" />
    <stop offset="100%" stopColor="#DDD6FE" />
  </linearGradient>

  {/* Gold Highlight */}
  <linearGradient id="seg7" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#FFF5D6" />
    <stop offset="100%" stopColor="#FDE68A" />
  </linearGradient>

  {/* Rose */}
  <linearGradient id="seg8" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#FFF1F2" />
    <stop offset="100%" stopColor="#FECDD3" />
  </linearGradient>
</defs>
      {/* Outer Gold Ring */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS + 12}
        fill="url(#goldRing)"
      />

      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS + 9}
        fill="none"
        stroke="#FFF6D5"
        strokeWidth="2"
      />

      {/* Inner Ring */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS + 4}
        fill="#FCFBF7"
      />

      {rewards.map((reward, index) => {
        const start = index * angle;
        const end = start + angle;

        const startPoint = polarToCartesian(
          CENTER,
          CENTER,
          RADIUS,
          end
        );

        const endPoint = polarToCartesian(
          CENTER,
          CENTER,
          RADIUS,
          start
        );

        const path = `
          M ${CENTER} ${CENTER}
          L ${startPoint.x} ${startPoint.y}
          A ${RADIUS} ${RADIUS} 0 0 0 ${endPoint.x} ${endPoint.y}
          Z
        `;

        const textPos = polarToCartesian(
          CENTER,
          CENTER,
          RADIUS * 0.62,
          start + angle / 2
        );

        const words = reward.label.split(" ");

        let line1 = reward.label;
        let line2 = "";

        if (words.length > 1) {
          line1 = words[0];
          line2 = words.slice(1).join(" ");
        }

        return (
          <g key={reward.id}>
            <path
              d={path}
              fill={`url(#seg${(index % 8) + 1})`}
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
                        <text
              x={textPos.x}
              y={textPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#222222"
              fontFamily="Inter, sans-serif"
              fontWeight="700"
              fontSize="11"
            >
              <tspan
                x={textPos.x}
                dy={line2 ? "-5" : "0"}
              >
                {line1}
              </tspan>

              {line2 && (
                <tspan
                  x={textPos.x}
                  dy="12"
                  fontSize="10"
                  fontWeight="600"
                  fill="#444444"
                >
                  {line2}
                </tspan>
              )}
            </text>
          </g>
        );
      })}
            {/* ================= Center Button ================= */}

      <g
        onClick={onSpin}
        className="cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {/* Shadow */}
        <circle
          cx={CENTER}
          cy={CENTER + 4}
          r="43"
          fill="rgba(0,0,0,0.12)"
        />

        {/* Outer Gold Ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r="43"
          fill="#D4AF37"
        />

        {/* Highlight Ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r="40"
          fill="none"
          stroke="#FFF4C7"
          strokeWidth="2"
        />

        {/* White Center */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r="36"
          fill="#FFFFFF"
        />

        {/* Small Inner Ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r="33"
          fill="none"
          stroke="#EFE2C6"
          strokeWidth="1.5"
        />

        <text
          x={CENTER}
          y={CENTER - 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="17"
          fontWeight="800"
          fill="#111827"
          letterSpacing="1"
        >
          SPIN
        </text>

        <text
          x={CENTER}
          y={CENTER + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fontWeight="600"
          fill="#B68D2A"
          letterSpacing="1"
        >
          TAP HERE
        </text>
      </g>

    </svg>
  );
}