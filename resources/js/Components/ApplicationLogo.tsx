import React from 'react';

export default function ApplicationLogo(props: { className?: string; [key: string]: any }) {
    return (
        <img
            src="/logo.png"
            alt="PRAJA Logo"
            {...props}
            className={`object-contain ${props.className || 'h-10 w-auto'}`}
        />
    );
}
