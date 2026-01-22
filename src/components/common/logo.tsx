export function Logo() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary-foreground"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          d="M12 21C16.4183 21 20 17.4183 20 13C20 8.58172 16.4183 5 12 5C7.58172 5 4 8.58172 4 13C4 17.4183 7.58172 21 12 21Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 5V3M12 21V23"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 13C8.5 15.5 9 17 12 17C15 17 15.5 15.5 14.5 13C13.5 10.5 12 7 12 7C12 7 10.5 10.5 9.5 13Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 9C17 9.5 18 10.5 18.5 12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 9C7 9.5 6 10.5 5.5 12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
