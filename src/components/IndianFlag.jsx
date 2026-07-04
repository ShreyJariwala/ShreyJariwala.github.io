function ChakraSpokes({ cx, cy, r }) {
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    return (
      <line
        key={i}
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - r}
        stroke="#0b3d91"
        strokeWidth={r * 0.09}
        transform={`rotate(${angle} ${cx} ${cy})`}
      />
    );
  });
  return <>{spokes}</>;
}

export default function IndianFlag({ className = "w-5 h-auto" }) {
  const w = 30;
  const h = 20;
  const cx = w / 2;
  const cy = h / 2;
  const r = h * 0.28;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Flag of India"
    >
      <rect x="0" y="0" width={w} height={h / 3} fill="#FF9933" />
      <rect x="0" y={h / 3} width={w} height={h / 3} fill="#FFFFFF" />
      <rect x="0" y={(2 * h) / 3} width={w} height={h / 3} fill="#138808" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0b3d91" strokeWidth={r * 0.12} />
      <ChakraSpokes cx={cx} cy={cy} r={r} />
      <circle cx={cx} cy={cy} r={r * 0.12} fill="#0b3d91" />
    </svg>
  );
}
