import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import HTMLFlipBook from "react-pageflip";
import { saveProgress } from "../services/api";
import "../pages/Reader.css";

const FONT_SIZES = [14, 16, 18, 20, 22, 24, 26, 28];
const LINE_SPACINGS = [1.4, 1.6, 1.8, 2.0, 2.2];
const THEMES = [
    { id: "dark", icon: "🌙", label: "Dark" },
    { id: "light", icon: "☀️", label: "Light" },
    { id: "sepia", icon: "📜", label: "Sepia" },
];

// ── Web Audio API flip sound (no external files needed) ──────────
const playFlipSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(800, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
        g.gain.setValueAtTime(0.12, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + 0.13);
    } catch (_) { /* AudioContext not available in some environments */ }
};

// ── Individual Page Component ────────────────────────────────────
const Page = React.forwardRef((props, ref) => {
    return (
        <div className={`book-page book-page--${props.theme || 'dark'}`} ref={ref} data-density="soft">
            {/* Paper grain texture overlay */}
            <div className="page-grain" aria-hidden="true" />

            {/* Inner spine shadow */}
            <div className={`page-spine-shadow page-spine-shadow--${props.side || 'right'}`} aria-hidden="true" />

            <div className="page-content">{props.children}</div>

            <div className="page-footer">
                <span className="page-footer-chapter">{props.chapterLabel}</span>
                <span className="page-footer-num">{props.number}</span>
            </div>
        </div>
    );
});
Page.displayName = "Page";

// ── Main NovelReader Component ───────────────────────────────────
function NovelReader({ data, initialPage, bookId, currentChapter, chaptersList, onNavigate, onBack }) {
    const chapter = data?.chapter;
    const nav = data?.navigation;

    const [saved, setSaved] = useState(false);
    const [theme, setTheme] = useState("dark");
    const [fontSizeIdx, setFontSizeIdx] = useState(2);
    const [lineSpacingIdx, setLineSpacingIdx] = useState(2);
    const [showSettings, setShowSettings] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [readMode, setReadMode] = useState("paged");
    const [pageIndex, setPageIndex] = useState(initialPage || 0);
    const [isDistractionFree, setIsDistractionFree] = useState(false);
    const [isFlipping, setIsFlipping] = useState(false);

    const flipBookRef = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const saveTimerRef = useRef(null);

    const fontSize = FONT_SIZES[fontSizeIdx];
    const lineSpacing = LINE_SPACINGS[lineSpacingIdx];

    // ── Computed pages ───────────────────────────────────────────
    const { paragraphs, totalPages, parasPerPage } = useMemo(() => {
        if (!chapter?.content) return { paragraphs: [], totalPages: 1, parasPerPage: 6 };
        const paras = chapter.content.split("\n\n").filter(p => p.trim() !== "");
        return {
            paragraphs: paras,
            totalPages: Math.max(1, Math.ceil(paras.length / 6)),
            parasPerPage: 6,
        };
    }, [chapter?.content]);

    const progressPercentage = readMode === "paged"
        ? ((pageIndex + 1) / totalPages) * 100
        : 100;

    // ── Restore page on mode switch ──────────────────────────────
    useEffect(() => {
        if (readMode === "paged" && flipBookRef.current?.pageFlip()) {
            try { flipBookRef.current.pageFlip().turnToPage(pageIndex); } catch (_) { }
        }
    }, [readMode]); // eslint-disable-line

    // ── Debounced progress save ──────────────────────────────────
    const debouncedSave = useCallback((page) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveProgress(bookId, {
                lastChapterNumber: currentChapter,
                chapterId: chapter?._id || null,
                position: { page },
            }).then(() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }).catch(() => { });
        }, 600);
    }, [bookId, currentChapter, chapter]);

    // Cleanup timer on unmount
    useEffect(() => () => saveTimerRef.current && clearTimeout(saveTimerRef.current), []);

    // ── Flip callbacks ───────────────────────────────────────────
    const onFlip = useCallback((e) => {
        const newPage = e.data;
        setPageIndex(newPage);
        setIsFlipping(false);
        if (soundEnabled) playFlipSound();
        debouncedSave(newPage);
    }, [soundEnabled, debouncedSave]);

    const onFlipStart = useCallback(() => setIsFlipping(true), []);

    // ── Navigation ───────────────────────────────────────────────
    const handleNext = useCallback(() => {
        if (readMode === "paged" && pageIndex < totalPages - 1) {
            flipBookRef.current?.pageFlip()?.flipNext();
        } else if (nav?.next) {
            onNavigate(`/read/${bookId}/${nav.next.chapterNumber}`);
        }
    }, [readMode, pageIndex, totalPages, nav, bookId, onNavigate]);

    const handlePrev = useCallback(() => {
        if (readMode === "paged" && pageIndex > 0) {
            flipBookRef.current?.pageFlip()?.flipPrev();
        } else if (nav?.prev) {
            onNavigate(`/read/${bookId}/${nav.prev.chapterNumber}`);
        }
    }, [readMode, pageIndex, nav, bookId, onNavigate]);

    const jumpToPage = useCallback((targetPage) => {
        const p = Math.max(0, Math.min(totalPages - 1, Number(targetPage) - 1));
        if (readMode === "paged" && flipBookRef.current?.pageFlip()) {
            flipBookRef.current.pageFlip().turnToPage(p);
            setPageIndex(p);
        }
    }, [readMode, totalPages]);

    // ── Touch swipe handling ─────────────────────────────────────
    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchEnd = useCallback((e) => {
        if (touchStartX.current === null || readMode !== "paged") return;

        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;

        // Only register horizontal swipes (not scrolls)
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            if (dx < 0) handleNext();
            else handlePrev();
        }

        touchStartX.current = null;
        touchStartY.current = null;
    }, [readMode, handleNext, handlePrev]);

    // ── Fullscreen ──────────────────────────────────────────────
    const toggleFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen?.();
        }
    }, []);

    const chapterLabel = `Ch. ${chapter?.chapterNumber}`;

    return (
        <div
            className={`reader-page reader-${theme} ${isDistractionFree ? 'distraction-free' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* ── Toolbar ── */}
            <div className="reader-toolbar">
                <div className="reader-toolbar-left">
                    <button className="reader-back-btn" onClick={onBack}>← Back</button>

                    {chaptersList?.length > 0 && (
                        <select
                            className="chapter-jump-dropdown"
                            value={currentChapter}
                            onChange={(e) => onNavigate(`/read/${bookId}/${e.target.value}`)}
                            aria-label="Jump to chapter"
                        >
                            {chaptersList.map(ch => (
                                <option key={ch.chapterNumber} value={ch.chapterNumber}>
                                    Ch. {ch.chapterNumber}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="reader-controls">
                    {saved && <span className="saved-indicator" aria-live="polite">✓ Saved</span>}

                    <button
                        className={`mode-toggle hide-mobile sound-toggle ${soundEnabled ? 'sound-on' : ''}`}
                        onClick={() => setSoundEnabled(s => !s)}
                        title={soundEnabled ? "Sound On" : "Sound Off"}
                    >
                        {soundEnabled ? "🔊" : "🔇"}
                    </button>

                    <button className="mode-toggle hide-mobile" onClick={toggleFullScreen} title="Toggle Fullscreen">
                        ⛶
                    </button>

                    <button
                        className="mode-toggle hide-mobile"
                        onClick={() => setIsDistractionFree(d => !d)}
                        title="Focus Mode"
                    >
                        {isDistractionFree ? "👁" : "⧆"}
                    </button>

                    <button
                        className="mode-toggle"
                        onClick={() => setReadMode(m => m === "scroll" ? "paged" : "scroll")}
                    >
                        {readMode === "scroll" ? "↕ Scroll" : "📖 Book"}
                    </button>

                    <div className="settings-wrapper">
                        <button className="theme-toggle" onClick={() => setShowSettings(s => !s)} aria-label="Settings">
                            Aa
                        </button>

                        {showSettings && (
                            <div className="reader-settings-panel" onClick={e => e.stopPropagation()}>
                                <div className="settings-row">
                                    <span>Theme</span>
                                    <div className="theme-options">
                                        {THEMES.map(t => (
                                            <button
                                                key={t.id}
                                                className={`theme-btn ${theme === t.id ? "active" : ""}`}
                                                onClick={() => setTheme(t.id)}
                                                title={t.label}
                                            >{t.icon}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="settings-row">
                                    <span>Text</span>
                                    <div className="spin-control">
                                        <button onClick={() => setFontSizeIdx(i => Math.max(0, i - 1))}>−</button>
                                        <span>{fontSize}px</span>
                                        <button onClick={() => setFontSizeIdx(i => Math.min(FONT_SIZES.length - 1, i + 1))}>+</button>
                                    </div>
                                </div>
                                <div className="settings-row">
                                    <span>Spacing</span>
                                    <div className="spin-control">
                                        <button onClick={() => setLineSpacingIdx(i => Math.max(0, i - 1))}>−</button>
                                        <span>{lineSpacing}</span>
                                        <button onClick={() => setLineSpacingIdx(i => Math.min(LINE_SPACINGS.length - 1, i + 1))}>+</button>
                                    </div>
                                </div>
                                {readMode === "paged" && (
                                    <div className="settings-row jump-row">
                                        <span>Go to page</span>
                                        <div className="jump-input">
                                            <input
                                                type="number"
                                                min="1"
                                                max={totalPages}
                                                defaultValue={pageIndex + 1}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        jumpToPage(e.target.value);
                                                        setShowSettings(false);
                                                    }
                                                }}
                                                aria-label="Jump to page number"
                                            />
                                            <span className="total-pages">/ {totalPages}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Reader area ── */}
            <div
                className="reader-container"
                onClick={() => {
                    if (showSettings) setShowSettings(false);
                    if (isDistractionFree) setIsDistractionFree(false);
                }}
            >
                <div className="reader-header">
                    <p className="reader-book-label">{chapterLabel}</p>
                    <h1 className="reader-chapter-title">{chapter?.title || chapterLabel}</h1>
                    <div className="reader-divider" />
                </div>

                <div
                    className={`reader-content mode-${readMode} ${isFlipping ? 'is-flipping' : ''}`}
                    style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing }}
                >
                    {readMode === "scroll" ? (
                        <div className="scroll-content">
                            {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
                        </div>
                    ) : (
                        <div className="flipbook-wrapper">
                            <HTMLFlipBook
                                width={340}
                                height={490}
                                size="stretch"
                                minWidth={280}
                                maxWidth={900}
                                minHeight={380}
                                maxHeight={750}
                                maxShadowOpacity={0.6}
                                showCover={false}
                                mobileScrollSupport={false}
                                swipeDistance={30}
                                clickEventForward={false}
                                className="novel-flipbook"
                                ref={flipBookRef}
                                onFlip={onFlip}
                                onFlipStart={onFlipStart}
                                usePortrait={true}
                                startPage={initialPage}
                                drawShadow={true}
                                flippingTime={600}
                            >
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <Page
                                        number={i + 1}
                                        key={i}
                                        theme={theme}
                                        side={i % 2 === 0 ? "right" : "left"}
                                        chapterLabel={chapterLabel}
                                    >
                                        {paragraphs
                                            .slice(i * parasPerPage, (i + 1) * parasPerPage)
                                            .map((para, idx) => <p key={idx}>{para}</p>)
                                        }
                                    </Page>
                                ))}
                            </HTMLFlipBook>
                        </div>
                    )}
                </div>

                <div className="reader-nav">
                    <button
                        className="reader-nav-btn"
                        disabled={pageIndex === 0 && !nav?.prev}
                        onClick={handlePrev}
                        aria-label="Previous page or chapter"
                    >
                        ← {readMode === "paged" && pageIndex > 0
                            ? "Prev"
                            : nav?.prev ? `Ch.${nav.prev.chapterNumber}` : "Start"}
                    </button>

                    <span className="reader-chapter-badge">
                        {readMode === "paged"
                            ? `${pageIndex + 1} / ${totalPages}`
                            : chapterLabel}
                    </span>

                    <button
                        className="reader-nav-btn"
                        disabled={pageIndex >= totalPages - 1 && !nav?.next}
                        onClick={handleNext}
                        aria-label="Next page or chapter"
                    >
                        {readMode === "paged" && pageIndex < totalPages - 1
                            ? "Next"
                            : nav?.next ? `Ch.${nav.next.chapterNumber}` : "End"} →
                    </button>
                </div>
            </div>

            {/* ── Progress bar ── */}
            {readMode === "paged" && (
                <div className="reader-progress-bar-container" role="progressbar" aria-valuenow={Math.round(progressPercentage)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="reader-progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
                </div>
            )}
        </div>
    );
}

export default NovelReader;
