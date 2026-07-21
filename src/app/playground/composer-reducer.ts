import type { WaveConfig } from '@threeaio/smooth-waves';
import type { Selection } from './components/curve-overlay';
import {
    createLayer,
    initialLayers,
    palettePresets,
    remapPaletteColor,
    sage,
    type EdgeState,
    type LayerState,
    type Mode,
} from './defaults';
import { generateArtwork } from './generate';

/**
 * The composer's document state — everything randomize/export/palette touch,
 * held in one pure reducer so multi-field transitions (randomize, palette
 * remap) stay atomic. View state (zoom, playback, fullscreen) lives elsewhere.
 */
export interface ComposerState {
    layers: LayerState[];
    /** Canvas/list selection: 'page' (composition settings) or a layer id. */
    activeId: string;
    /** Pinned keyframe of the active layer. */
    selection: Selection | null;
    /** Working palette — offered as quick swatches in every color field. */
    palette: string[];
    pageBg: string;
    /** The wave section's height in px — the main driver of the page's total height. */
    sectionPx: number;
    /** Horizontal overscan per layer in % (e4: -inset-x-[14%]). */
    bleedX: number;
    grainOn: boolean;
    spaceBefore: boolean;
    spaceAfter: boolean;
    /** Monotonic id source for new layers. */
    counter: number;
}

export type PagePatch = Partial<
    Pick<ComposerState, 'pageBg' | 'sectionPx' | 'bleedX' | 'grainOn' | 'spaceBefore' | 'spaceAfter'>
>;

export type ComposerAction =
    | { type: 'layer/add'; mode: Mode }
    | { type: 'layer/remove'; id: string }
    | { type: 'layer/move'; id: string; dir: 1 | -1 }
    | { type: 'layer/toggle-visible'; id: string }
    | { type: 'layer/rename'; id: string; name: string }
    | { type: 'layer/patch'; partial: Partial<LayerState> }
    | { type: 'layer/patch-edge'; edge: 'top' | 'bottom'; partial: Partial<EdgeState> }
    | { type: 'keyframe/update'; edge: Selection['edge']; index: number; config: WaveConfig }
    | { type: 'select'; id: string }
    | { type: 'selection/set'; selection: Selection | null }
    | { type: 'palette/apply'; palette: string[] }
    | { type: 'page/patch'; partial: PagePatch }
    | { type: 'randomize'; seed: number };

export const initialComposerState: ComposerState = {
    layers: initialLayers,
    activeId: 'page',
    selection: null,
    palette: [...palettePresets[0].colors],
    // the composition should read as a real page — its background is part of the design
    pageBg: sage,
    sectionPx: 4000,
    bleedX: 14,
    // e4 lays its grain over the whole page — part of the mood, so on by default
    grainOn: true,
    // pages may start or end with the waves themselves — the surrounding scroll room is optional
    spaceBefore: false,
    spaceAfter: false,
    counter: initialLayers.length + 1,
};

const patchActive = (state: ComposerState, apply: (layer: LayerState) => LayerState): ComposerState => ({
    ...state,
    layers: state.layers.map((l) => (l.id === state.activeId ? apply(l) : l)),
});

export function composerReducer(state: ComposerState, action: ComposerAction): ComposerState {
    switch (action.type) {
        case 'layer/add': {
            const layer = createLayer(action.mode, state.counter);
            return {
                ...state,
                layers: [...state.layers, layer],
                counter: state.counter + 1,
                selection: null,
                activeId: layer.id,
            };
        }
        case 'layer/remove': {
            if (state.layers.length <= 1) return state;
            const layers = state.layers.filter((l) => l.id !== action.id);
            if (action.id !== state.activeId) return { ...state, layers };
            return { ...state, layers, selection: null, activeId: layers[layers.length - 1].id };
        }
        case 'layer/move': {
            const i = state.layers.findIndex((l) => l.id === action.id);
            const j = i + action.dir;
            if (i < 0 || j < 0 || j >= state.layers.length) return state;
            const layers = [...state.layers];
            [layers[i], layers[j]] = [layers[j], layers[i]];
            return { ...state, layers };
        }
        case 'layer/toggle-visible':
            return {
                ...state,
                layers: state.layers.map((l) => (l.id === action.id ? { ...l, visible: !l.visible } : l)),
            };
        case 'layer/rename':
            return {
                ...state,
                layers: state.layers.map((l) => (l.id === action.id ? { ...l, name: action.name } : l)),
            };
        case 'layer/patch':
            return patchActive(state, (l) => ({ ...l, ...action.partial }));
        case 'layer/patch-edge':
            return patchActive(state, (l) => ({ ...l, [action.edge]: { ...l[action.edge], ...action.partial } }));
        case 'keyframe/update':
            return patchActive(state, (l) => {
                if (action.edge === 'wave') {
                    return { ...l, configs: l.configs.map((c, j) => (j === action.index ? action.config : c)) };
                }
                return {
                    ...l,
                    [action.edge]: {
                        ...l[action.edge],
                        configs: l[action.edge].configs.map((c, j) => (j === action.index ? action.config : c)),
                    },
                };
            });
        case 'select':
            // selection always belongs to the active layer
            if (action.id === state.activeId) return state;
            return { ...state, activeId: action.id, selection: null };
        case 'selection/set':
            return { ...state, selection: action.selection };
        case 'palette/apply': {
            // Palette edits recolor every color that was taken from the old palette
            // (fills, strokes, page bg — alpha preserved), so preset switches restyle
            // the whole composition live.
            const remap = (value: string) => remapPaletteColor(value, state.palette, action.palette);
            return {
                ...state,
                layers: state.layers.map((l) => ({
                    ...l,
                    fill: remap(l.fill),
                    strokeStyle: remap(l.strokeStyle),
                    top: { ...l.top, strokeStyle: remap(l.top.strokeStyle) },
                    bottom: { ...l.bottom, strokeStyle: remap(l.bottom.strokeStyle) },
                })),
                pageBg: remap(state.pageBg),
                palette: action.palette,
            };
        }
        case 'page/patch':
            return { ...state, ...action.partial };
        case 'randomize': {
            // replace the whole composition with a seeded random one — palette, layers,
            // page background; view settings (section px, bleed, grain) stay put
            const art = generateArtwork(action.seed, state.sectionPx, state.counter);
            return {
                ...state,
                layers: art.layers,
                palette: art.palette,
                pageBg: art.pageBg,
                counter: state.counter + art.layers.length,
                selection: null,
                activeId: 'page',
            };
        }
    }
}
