'use client';

import { useActiveLayer } from '../../composer-context';
import { LayerInspector } from './layer-inspector';
import { PageInspector } from './page-inspector';

/** The right panel's content: header + the active target's inspector. */
export function Inspector() {
    const active = useActiveLayer();
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-ed-hairline px-3 py-2">
                <span className="text-2xs font-medium text-ed-text-strong">{active ? active.name : 'page'}</span>
                {active && (
                    <span className="rounded border border-ed-border px-1 text-3xs text-ed-text-muted">
                        {active.mode}
                    </span>
                )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
                {active ? <LayerInspector layer={active} /> : <PageInspector />}
            </div>
        </div>
    );
}
