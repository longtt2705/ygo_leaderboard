"use client";

import * as React from "react"

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    className?: string;
}

export function Tooltip({ children, content, className = "" }: TooltipProps) {
    const [isVisible, setIsVisible] = React.useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className={`absolute z-50 px-2 py-1 text-xs text-white bg-slate-900 border border-slate-700 rounded shadow-lg whitespace-nowrap -top-8 left-1/2 transform -translate-x-1/2 ${className}`}>
                    {content}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                </div>
            )}
        </div>
    );
} 