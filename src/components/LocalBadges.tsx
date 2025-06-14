'use client';

import { Tooltip } from "@/components/ui/tooltip";

interface LocalBadgesProps {
    localIds: string[];
    localMap: { [key: string]: string };
    className?: string;
}

export function LocalBadges({ localIds, localMap, className = "" }: LocalBadgesProps) {
    if (!localIds || localIds.length === 0) {
        return <span className={`text-slate-400 ${className}`}>No locals</span>;
    }

    // Get local names, fallback to ID if name not found
    const localNames = localIds.map(id => localMap[id] || id);

    // For display, show first 2 locals and indicate if there are more
    const displayNames = localNames.slice(0, 2);
    const hasMore = localNames.length > 2;

    return (
        <Tooltip content={`Locals: ${localNames.join(', ')}`}>
            <div className={`flex items-center gap-1 flex-wrap ${className}`}>
                {displayNames.map((name, index) => (
                    <span
                        key={localIds[index]}
                        className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30 whitespace-nowrap"
                    >
                        {name}
                    </span>
                ))}
                {hasMore && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-500/20 text-slate-400 text-xs font-medium border border-slate-500/30">
                        +{localNames.length - 2}
                    </span>
                )}
            </div>
        </Tooltip>
    );
} 