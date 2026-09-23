import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-xl border border-transparent bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(220,38,38,0.28)] transition duration-150 ease-in-out hover:bg-red-500 focus:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 active:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 dark:focus:bg-red-500 ${
                    disabled && 'cursor-not-allowed opacity-50'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
