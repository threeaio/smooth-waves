import { cn } from '@/lib/utils';

// docked chrome, Figma-UI3 style — opaque panels with hairline borders; the canvas
// area between them stays completely clear (handles must never hide under UI)
export const panelCls = 'border-ed-hairline bg-ed-panel text-ed-text';

/** A docked side panel between toolbar and bottom edge — hidden below lg. */
export function Panel({ side, children }: { side: 'left' | 'right'; children: React.ReactNode }) {
    return (
        <aside
            data-lenis-prevent
            className={cn(
                'fixed bottom-0 top-ed-toolbar z-40 hidden overflow-hidden lg:block',
                panelCls,
                side === 'left' ? 'left-0 w-ed-left border-r' : 'right-0 w-ed-right border-l',
            )}
        >
            {children}
        </aside>
    );
}

/** One inspector group: quiet lowercase title, hairline below. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-2.5 border-b border-ed-hairline px-3 py-3">
            <h3 className="text-3xs font-medium text-ed-text-muted">{title}</h3>
            {children}
        </section>
    );
}

/** Panel top row: quiet title on the left, optional actions on the right. */
export function PanelHeader({ title, actions }: { title: React.ReactNode; actions?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between border-b border-ed-hairline px-3 py-2">
            <span className="text-3xs font-medium text-ed-text-muted">{title}</span>
            {actions}
        </div>
    );
}
