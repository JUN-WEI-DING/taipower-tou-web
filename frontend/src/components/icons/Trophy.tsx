export const Trophy = ({ className, size = 24 }: { className?: string; size?: number }) => (
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
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H2" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.1C8.47 18.78 7 20.5 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.1c1.56 1.68 3 3.4 3 5" />
    <path d="M6 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
    <path d="M15 22a6 6 0 0 0-6 0" />
  </svg>
);
