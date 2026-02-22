export const TrendingUp = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="23 6 13.5 6 13.5 15" />
    <polyline points="16 6 20 10 10" />
    <path d="M20.5 13.5a6 6 0 0 1-6 6" />
  </svg>
);
