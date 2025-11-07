import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = `inline-flex items-center justify-center gap-2 font-medium transition-colors
       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400
       disabled:pointer-events-none disabled:opacity-50 rounded-md`;

    const variantStyles = {
      primary: 'bg-zinc-100 text-zinc-950 hover:bg-white',
      secondary: 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600',
      ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50',
      destructive: 'bg-transparent text-red-400 hover:text-red-300 hover:bg-red-900/20',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      icon: 'p-1.5 text-sm',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
