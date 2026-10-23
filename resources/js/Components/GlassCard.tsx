import React, { HTMLAttributes, PropsWithChildren } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    blurAmount?: number;
    opacity?: number;
}


export default function GlassCard({
    children,
    className = '',
    style,
    ...props
}: PropsWithChildren<GlassCardProps>) {
    return (
        <div
            {...props}
            style={{
                background: 'rgba(255, 255, 255, 0.28)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.14)',
                ...style,
            }}
            className={`rounded-[28px] transition-all duration-300 ${className}`}
        >
            {children}
        </div>
    );
}
