'use client';

import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
    type Dispatch,
    type RefObject,
    type SetStateAction,
} from 'react';
import { useComposer, useComposerDispatch } from './composer-context';
import type { LayerState } from './defaults';
import { layerProgress } from './figma-export';
import { useFitLayout, type FitLayout } from './hooks/use-fit-layout';
import { useFullscreen } from './hooks/use-fullscreen';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { usePlayback } from './hooks/use-playback';
import { useViewport } from './hooks/use-viewport';

/**
 * Everything about HOW the composition is shown — zoom, playback, fullscreen,
 * hover — as opposed to WHAT it is (the composer document). Never exported,
 * never randomized.
 */
export interface ViewState {
    /** Fit view: the page laid out at a mocked wide-screen width, scaled down to fit. */
    mockWide: boolean;
    setMockWide: Dispatch<SetStateAction<boolean>>;
    fullscreen: boolean;
    /** Editor chrome visible — the opposite of fullscreen. */
    chrome: boolean;
    enterFullscreen: () => void;
    exitFullscreen: () => void;
    playing: boolean;
    setPlaying: Dispatch<SetStateAction<boolean>>;
    /** Virtual scroll position 0..1 in fit view. */
    scrubT: number;
    scrubTo: (percent: number) => void;
    viewport: { w: number; h: number };
    hoveredLayerId: string | null;
    setHoveredLayerId: (id: string | null) => void;
    onion: boolean;
    setOnion: (v: boolean) => void;
    sectionRef: RefObject<HTMLDivElement | null>;
    /** A layer's progress at the virtual scroll position (fit view). */
    virtualProgress: (layer: Pick<LayerState, 'scrollStart' | 'scrollEnd'>) => number;
    /** A layer's current progress, wherever the preview is (fit view or real scroll). */
    layerT: (layer: LayerState) => number;
    fit: FitLayout;
}

const ViewContext = createContext<ViewState | null>(null);

export function ViewProvider({ children }: { children: React.ReactNode }) {
    const { selection, sectionPx, bleedX, spaceBefore, spaceAfter } = useComposer();
    const dispatch = useComposerDispatch();

    const [onion, setOnion] = useState(false);
    const [mockWide, setMockWide] = useState(true);
    const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);
    const [scrubT, setScrubT] = useState(0);
    const [playing, setPlaying] = useState(false);
    const viewport = useViewport();
    const sectionRef = useRef<HTMLDivElement>(null);

    const clearSelection = useCallback(() => dispatch({ type: 'selection/set', selection: null }), [dispatch]);

    const {
        fullscreen,
        enter: enterFullscreen,
        exit: exitFullscreen,
    } = useFullscreen({ mockWide, setMockWide, onEnter: clearSelection });
    const chrome = !fullscreen;

    const fit = useFitLayout({ viewport, chrome, sectionPx, bleedX, spaceBefore, spaceAfter });

    // The progress a layer would have at the virtual scroll position `scrubT` on the
    // mocked page (as if it were laid out unscaled) — drives the fitted overview.
    const virtualProgress = useCallback(
        (layer: Pick<LayerState, 'scrollStart' | 'scrollEnd'>): number => {
            const totalH = ((spaceBefore ? 0.8 : 0) + (spaceAfter ? 0.8 : 0)) * viewport.h + sectionPx;
            const virtualScrollY = scrubT * Math.max(0, totalH - viewport.h);
            const sectionTop = spaceBefore ? 0.8 * viewport.h : 0;
            return layerProgress(layer.scrollStart, layer.scrollEnd, sectionTop, sectionPx, viewport.h, virtualScrollY);
        },
        [scrubT, viewport.h, spaceBefore, spaceAfter, sectionPx],
    );

    const layerT = useCallback(
        (layer: LayerState): number => {
            if (mockWide) return virtualProgress(layer);
            const el = sectionRef.current;
            if (!el) return 0;
            const rect = el.getBoundingClientRect();
            return layerProgress(
                layer.scrollStart,
                layer.scrollEnd,
                rect.top + window.scrollY,
                rect.height,
                window.innerHeight,
                window.scrollY,
            );
        },
        [mockWide, virtualProgress],
    );

    // Playback: loop the virtual progress — one full pass every 12s.
    usePlayback(playing && mockWide, (dt) => setScrubT((t) => (t + dt / 12) % 1));

    const scrubTo = useCallback(
        (percent: number) => {
            // scrubbing means "show me the animation" — release a pinned keyframe first,
            // otherwise the preview stays static and the slider seems to do nothing
            clearSelection();
            setPlaying(false);
            // fitted overview: no scroll room — drive the virtual scroll position instead
            if (mockWide) {
                setScrubT(percent / 100);
                return;
            }
            const max = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({ top: (percent / 100) * max });
        },
        [mockWide, clearSelection],
    );

    /* ---- global shortcuts ---- */
    const onEscape = useCallback(() => {
        if (fullscreen) exitFullscreen();
        else if (selection) clearSelection();
        else dispatch({ type: 'select', id: 'page' });
    }, [fullscreen, exitFullscreen, selection, clearSelection, dispatch]);
    const onToggleFullscreen = useCallback(
        () => (fullscreen ? exitFullscreen() : enterFullscreen()),
        [fullscreen, exitFullscreen, enterFullscreen],
    );
    const onToggleZoom = useCallback(() => setMockWide((v) => !v), []);
    const onTogglePlay = useCallback(
        (e: KeyboardEvent) => {
            if (!mockWide) return;
            e.preventDefault();
            clearSelection();
            setPlaying((v) => !v);
        },
        [mockWide, clearSelection],
    );
    useKeyboardShortcuts({ onEscape, onToggleFullscreen, onToggleZoom, onTogglePlay });

    const value: ViewState = {
        mockWide,
        setMockWide,
        fullscreen,
        chrome,
        enterFullscreen,
        exitFullscreen,
        playing,
        setPlaying,
        scrubT,
        scrubTo,
        viewport,
        hoveredLayerId,
        setHoveredLayerId,
        onion,
        setOnion,
        sectionRef,
        virtualProgress,
        layerT,
        fit,
    };
    return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

export function useView(): ViewState {
    const view = useContext(ViewContext);
    if (!view) throw new Error('useView must be used inside <ViewProvider>');
    return view;
}
