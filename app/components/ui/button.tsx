interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 