export function Logo() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary-foreground"
        >
            <path d="M9 8C10.6569 8 12 6.65685 12 5C12 3.34315 10.6569 2 9 2C7.34315 2 6 3.34315 6 5C6 6.65685 7.34315 8 9 8Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 8V15C9 15.5304 9.21071 16.0391 9.58579 16.4142C9.96086 16.7893 10.4696 17 11 17H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22C13.6569 22 15 20.6569 15 19C15 17.3431 13.6569 16 12 16C10.3431 16 9 17.3431 9 19C9 20.6569 10.3431 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M15 19H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 16V10.5C12 9.96957 12.2107 9.46086 12.5858 9.08579C12.9609 8.71071 13.4696 8.5 14 8.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M18 8.5L16 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M18 8.5L16 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    </div>
  );
}
