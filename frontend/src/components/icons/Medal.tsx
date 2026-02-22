export const Medal = ({ className, size = 24 }: { className?: string; size?: number }) => (
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
    <path d="M7.8 6.9c-.5.3-.9.9-1.3L12 3l5.5 2.6c.4.4.8.8 1.3 1.3" />
    <path d="M14.5 7.5a6 6 0 1 0-11 0" />
    <circle cx="12" cy="12" r="2" />
    <path d="m22 17-8.3-4.1" />
    <path d="m2 17 8.3-4.1" />
  </svg>
);
