import React from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white p-0.5 border border-gray-200/80 shadow-xs">
                <AppLogoIcon className="size-full object-contain" />
            </div>
            <div className="ml-1.5 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-gray-900">
                    PRAJA – BPA Tel-U
                </span>
                <span className="truncate text-[10px] text-gray-500 font-medium">
                    Integrated Portal
                </span>
            </div>
        </>
    );
}
