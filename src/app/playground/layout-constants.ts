import type { CSSProperties } from 'react';

/** Single source of truth for the composer panel geometry — the fit-scale algebra needs these
 *  as numbers before paint, the chrome consumes them as CSS vars (w-ed-left, h-ed-toolbar, …). */
export const PANEL = {
    leftW: 224,
    rightW: 288,
    toolbarH: 44,
    timelineH: 40,
    margin: 24,
} as const;

export const panelCssVars = {
    '--ed-left-w': `${PANEL.leftW}px`,
    '--ed-right-w': `${PANEL.rightW}px`,
    '--ed-toolbar-h': `${PANEL.toolbarH}px`,
    '--ed-timeline-h': `${PANEL.timelineH}px`,
} as CSSProperties;
