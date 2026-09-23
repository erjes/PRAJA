import React from 'react';

export default function AppLogoIcon(props: { className?: string; [key: string]: any }) {
    return (
        <img
            src="/logo.png"
            alt="PRAJA Logo Icon"
            {...props}
            className={`object-contain ${props.className || 'size-6'}`}
        />
    );
}
