"use client";

interface Props {
  avg30: number;
  avg7:  number;
  avg1:  number;
  positive: boolean;
}

export default function DashboardSparkline({ avg30, avg7, avg1, positive }: Props) {
  const color = positive ? '#22C55E' : '#EE1515';
  const glow  = positive ? 'rgba(34,197,94,0.3)' : 'rgba(238,21,21,0.3)';

  // 3 data points: 30d ago, 7d ago, today
  // Normalize to 0–40 range for SVG height
  const values = [avg30, avg7, avg1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => ({
    x: i * 110 + 10, // 10, 120, 230
    y: 40 - ((v - min) / range) * 36, // invert Y, 4px padding
  }));

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

  // Area fill path
  const areaD = `${pathD} L ${points[points.length - 1].x} 44 L ${points[0].x} 44 Z`;

  const labels = ['30T', '7T', 'Heute'];

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox="0 0 250 50"
        width="100%"
        height="52"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area */}
        <path d={areaD} fill={`url(#sg-${positive})`} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === 2 ? 4 : 3}
            fill={i === 2 ? color : 'rgba(255,255,255,0.15)'}
            stroke={color}
            strokeWidth="1.5"
            style={{ filter: i === 2 ? `drop-shadow(0 0 6px ${glow})` : 'none' }}
          />
        ))}

        {/* Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={48}
            textAnchor="middle"
            fontSize="8"
            fill="rgba(255,255,255,0.25)"
            fontFamily="Inter, sans-serif"
            fontWeight="600"
          >
            {labels[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}
