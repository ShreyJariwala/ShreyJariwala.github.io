function ChakraSpokes() {
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = i * 15;
    return (
      <line
        key={i}
        x1="0"
        y1="0"
        x2="0"
        y2="-3.2"
        transform={`rotate(${angle})`}
      />
    );
  });
  return <>{spokes}</>;
}

export default function IndianFlag({ className = "w-5 h-auto" }) {
  return (
    <svg
      viewBox="0 0 36 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Flag of India"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
    >
      <rect x="0" y="0" width="36" height="8" fill="#FF671F" />
      <rect x="0" y="8" width="36" height="8" fill="#ffffff" />
      <rect x="0" y="16" width="36" height="8" fill="#046A38" />
      <rect x="0" y="0" width="36" height="24" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="0.4" />
      <g transform="translate(18 12)" stroke="#06038D" strokeWidth="0.32" fill="none">
        <circle r="3.35" />
        <circle r="0.6" fill="#06038D" stroke="none" />
        <ChakraSpokes />
      </g>
    </svg>
  );
}
