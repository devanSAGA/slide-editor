import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', className = '', children, ...props }, ref) => {
    const baseStyles = `inline-flex items-center justify-center font-medium text-sm transition-colors
       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400
       disabled:pointer-events-none disabled:opacity-50 rounded-md`;

    const variantStyles = {
      primary: 'bg-zinc-100 text-zinc-950 hover:bg-white',
      secondary: 'bg-zinc-800/50 text-zinc-200 hover:bg-zinc-800 border border-zinc-700/50',
      outline: 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} p-1.5 text-sm ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
