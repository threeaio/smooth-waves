'use client';

import { useEffect } from 'react';
import { ComposerProvider, useComposer, useComposerDispatch } from './composer-context';
import { CanvasStage } from './components/canvas-stage';
import { FullscreenOverlay } from './components/fullscreen-overlay';
import { Inspector } from './components/inspector';
import { LayersPanel } from './components/layers-panel';
import { Timeline } from './components/timeline';
import { Toolbar } from './components/toolbar';
import { initialLayers } from './defaults';
import { panelCssVars } from './layout-constants';
import { Panel } from './ui';
import { useView, ViewProvider } from './view-context';

/**
 * The Wave Composer: a Figma-UI3-like editor for scroll-animated wave
 * compositions. Document state lives in the composer reducer, view state in
 * the view context — this file only assembles the chrome around the canvas.
 */
export default function Playground() {
    return (
        <ComposerProvider>
            <ViewProvider>
                <ComposerShell />
            </ViewProvider>
        </ComposerProvider>
    );
}

function ComposerShell() {
    const { pageBg } = useComposer();
    const dispatch = useComposerDispatch();
    const { mockWide, chrome, fullscreen } = useView();

    // Allow deep links like /playground?mode=band — activates the first layer of that type.
    useEffect(() => {
        const mode = new URLSearchParams(window.location.search).get('mode');
        if (mode === 'band' || mode === 'wave') {
            const target = initialLayers.find((l) => l.mode === mode);
            if (target) dispatch({ type: 'select', id: target.id });
        }
    }, [dispatch]);

    const deselectToPage = (e: React.MouseEvent<HTMLElement>) => {
        if (e.target === e.currentTarget) dispatch({ type: 'select', id: 'page' });
    };

    return (
        <div
            onClick={deselectToPage}
            className="ed-chrome relative min-h-screen max-w-full overflow-x-hidden font-mono text-ed-text"
            // in fit view the page bg lives INSIDE the frame — around it: neutral editor canvas
            style={{ ...panelCssVars, backgroundColor: mockWide || chrome ? 'rgb(var(--ed-canvas))' : pageBg }}
        >
            <CanvasStage />
            {chrome && (
                <>
                    <Toolbar />
                    <Panel side="left">
                        <LayersPanel />
                    </Panel>
                    <Panel side="right">
                        <Inspector />
                    </Panel>
                    <Timeline />
                </>
            )}
            {fullscreen && <FullscreenOverlay />}
        </div>
    );
}
