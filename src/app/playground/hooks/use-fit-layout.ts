import { useMemo } from 'react';
import { MOCK_WIDTH } from '../defaults';
import { PANEL } from '../layout-constants';

export interface FitLayoutInput {
    viewport: { w: number; h: number };
    /** Editor chrome visible (false in fullscreen preview). */
    chrome: boolean;
    sectionPx: number;
    bleedX: number;
    spaceBefore: boolean;
    spaceAfter: boolean;
}

export interface FitLayout {
    leftW: number;
    rightW: number;
    topH: number;
    bottomH: number;
    margin: number;
    mockScale: number;
    mockOffsetX: number;
    mockOffsetY: number;
    mockContentH: number;
    scrollW: number;
    scrollOffsetX: number;
}

/**
 * The canvas is the clear rect between the docked chrome (nothing floats over it).
 * In fit view the page is laid out at MOCK_WIDTH and scaled so the whole section
 * INCLUDING its bleed overscan fits that rect — curve handles live at the bleed
 * edges and must stay visible and reachable next to the artboard, Figma-style.
 */
export function computeFitLayout({
    viewport,
    chrome,
    sectionPx,
    bleedX,
    spaceBefore,
    spaceAfter,
}: FitLayoutInput): FitLayout {
    const lg = viewport.w >= 1024;
    const leftW = chrome && lg ? PANEL.leftW : 0;
    const rightW = chrome && lg ? PANEL.rightW : 0;
    const topH = chrome ? PANEL.toolbarH : 0;
    const bottomH = chrome ? PANEL.timelineH : 0;
    const availW = viewport.w - leftW - rightW;
    const availH = viewport.h - topH - bottomH;
    const margin = chrome ? PANEL.margin : 12;
    // reserve room for the bleed only while editing — fullscreen is a clean preview
    const bleedFactor = chrome ? 1 + (2 * bleedX) / 100 : 1;
    const mockScale = Math.min(
        (availW - 2 * margin) / (MOCK_WIDTH * bleedFactor),
        (availH - 2 * margin) / sectionPx,
        1,
    );
    const mockOffsetX = leftW + Math.max(0, (availW - MOCK_WIDTH * mockScale) / 2);
    const mockContentH = ((spaceBefore ? 0.8 : 0) + (spaceAfter ? 0.8 : 0)) * viewport.h + sectionPx;
    const mockOffsetY = topH + Math.max(chrome ? margin : 0, (availH - mockContentH * mockScale) / 2);
    // 100% view: the real-scroll preview also stays inside the clear canvas area
    // (bleed included), so even here "100%" is a bit less than the full window
    const scrollW = chrome ? Math.max(320, (availW - 2 * margin) / bleedFactor) : viewport.w;
    const scrollOffsetX = chrome ? leftW + Math.max(0, (availW - scrollW) / 2) : 0;
    return {
        leftW,
        rightW,
        topH,
        bottomH,
        margin,
        mockScale,
        mockOffsetX,
        mockOffsetY,
        mockContentH,
        scrollW,
        scrollOffsetX,
    };
}

export function useFitLayout(input: FitLayoutInput): FitLayout {
    const { viewport, chrome, sectionPx, bleedX, spaceBefore, spaceAfter } = input;
    return useMemo(
        () => computeFitLayout({ viewport, chrome, sectionPx, bleedX, spaceBefore, spaceAfter }),
        [viewport, chrome, sectionPx, bleedX, spaceBefore, spaceAfter],
    );
}
