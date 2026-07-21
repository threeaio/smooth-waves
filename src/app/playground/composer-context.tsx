'use client';

import { createContext, useCallback, useContext, useReducer, type Dispatch } from 'react';
import type { LayerState } from './defaults';
import { composerReducer, initialComposerState, type ComposerAction, type ComposerState } from './composer-reducer';

/**
 * Two contexts on purpose: dispatch-only consumers (toolbar buttons, layer rows)
 * don't re-render when the document changes.
 */
const StateContext = createContext<ComposerState | null>(null);
const DispatchContext = createContext<Dispatch<ComposerAction> | null>(null);

export function ComposerProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(composerReducer, initialComposerState);
    return (
        <StateContext.Provider value={state}>
            <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
        </StateContext.Provider>
    );
}

export function useComposer(): ComposerState {
    const state = useContext(StateContext);
    if (!state) throw new Error('useComposer must be used inside <ComposerProvider>');
    return state;
}

export function useComposerDispatch(): Dispatch<ComposerAction> {
    const dispatch = useContext(DispatchContext);
    if (!dispatch) throw new Error('useComposerDispatch must be used inside <ComposerProvider>');
    return dispatch;
}

/** The active layer, or undefined while the page node is selected. */
export function useActiveLayer(): LayerState | undefined {
    const { layers, activeId } = useComposer();
    return layers.find((l) => l.id === activeId);
}

/** Replace the whole composition with a seeded random one; returns the seed for feedback. */
export function useRandomize(): () => number {
    const dispatch = useComposerDispatch();
    return useCallback(() => {
        const seed = (Math.random() * 0xffffffff) >>> 0;
        dispatch({ type: 'randomize', seed });
        return seed;
    }, [dispatch]);
}
