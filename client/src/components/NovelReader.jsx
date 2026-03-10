import React, { useState, useEffect, useCallback, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { saveProgress } from "../services/api";
import "../pages/Reader.css";

const FONT_SIZES = [14, 16, 18, 20, 22, 24, 26, 28];
const LINE_SPACINGS = [1.4, 1.6, 1.8, 2.0, 2.2];
const THEMES = [
    { id: "dark", icon: "🌙" },
    { id: "light", icon: "☀️" },
    { id: "sepia", icon: "📜" },
];

const Page = React.forwardRef((props, ref) => {
    return (
        <div className="book-page" ref={ref} data-density="soft">
            <div className="page-content">{props.children}</div>
            <div className="page-footer">Page {props.number}</div>
        </div>
    );
});
Page.displayName = "Page";

function NovelReader({ data, initialPage, bookId, currentChapter, chaptersList, onNavigate, onBack }) {
    const chapter = data?.chapter;
    const nav = data?.navigation;

    const [saved, setSaved] = useState(false);

    // Preferences State
    const [theme, setTheme] = useState("dark");
    const [fontSizeIdx, setFontSizeIdx] = useState(2);
    const [lineSpacingIdx, setLineSpacingIdx] = useState(2);
    const [showSettings, setShowSettings] = useState(false);

    // Mode, Position, View State
    const [readMode, setReadMode] = useState("paged");
    const [pageIndex, setPageIndex] = useState(initialPage || 0);
    const [isDistractionFree, setIsDistractionFree] = useState(false);

    const flipBookRef = useRef(null);
    const fontSize = FONT_SIZES[fontSizeIdx];
    const lineSpacing = LINE_SPACINGS[lineSpacingIdx];

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    useEffect(() => {
        if (readMode === "paged" && flipBookRef.current?.pageFlip()) {
            try {
                flipBookRef.current.pageFlip().turnToPage(pageIndex);
            } catch (e) { }
        }
    }, [readMode]); // eslint-disable-line

    const parasPerPage = 6;
    let paragraphs = [];
    let totalPages = 1;

    if (chapter?.content) {
        paragraphs = chapter.content.split("\n\n").filter(p => p.trim() !== "");
        totalPages = Math.ceil(paragraphs.length / parasPerPage);
    }

    // Scroll progress extraction
    const handleScroll = () => {
        if (readMode === "scroll") {
            const el = document.documentElement;
            const scrolled = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
            // set logic here if needed, but simple CSS progress works too
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [readMode]);

    const onFlip = useCallback((e) => {
        const newPage = e.data;
        setPageIndex(newPage);
        saveProgress(bookId, {
            lastChapterNumber: currentChapter,
            chapterId: chapter?._id || null,
            position: { page: newPage }
        }).then(() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }).catch(() => { });
    }, [bookId, currentChapter, chapter]);

    const handleNext = () => {
        if (readMode === "paged" && pageIndex < totalPages - 1) {
            if (flipBookRef.current?.pageFlip()) flipBookRef.current.pageFlip().flipNext();
        } else if (nav?.next) {
            onNavigate(`/read/${bookId}/${nav.next.chapterNumber}`);
        }
    };

    const handlePrev = () => {
        if (readMode === "paged" && pageIndex > 0) {
            if (flipBookRef.current?.pageFlip()) flipBookRef.current.pageFlip().flipPrev();
        } else if (nav?.prev) {
            onNavigate(`/read/${bookId}/${nav.prev.chapterNumber}`);
        }
    };

    const jumpToPage = (targetPage) => {
        const p = Math.max(0, Math.min(totalPages - 1, targetPage - 1));
        if (readMode === "paged" && flipBookRef.current?.pageFlip()) {
            flipBookRef.current.pageFlip().turnToPage(p);
            setPageIndex(p);
        }
    };

    const progressPercentage = readMode === "paged"
        ? ((pageIndex + 1) / totalPages) * 100
        : 100; // Scroll handles its own if desired, sticking to page logic here

    return (
        <div className={`reader-page reader-${theme} ${isDistractionFree ? 'distraction-free' : ''}`}>

            <div className="reader-toolbar">
                <div className="reader-toolbar-left">
                    <button className="reader-back-btn" onClick={onBack}>← Back</button>
                    {chaptersList?.length > 0 && (
                        <select
                            className="chapter-jump-dropdown"
                            value={currentChapter}
                            onChange={(e) => onNavigate(`/read/${bookId}/${e.target.value}`)}
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
                    {saved && <span className="saved-indicator">✓ Saved</span>}

                    <button className="mode-toggle hide-mobile" onClick={toggleFullScreen}>
                        🔲 Fullscreen
                    </button>

                    <button className="mode-toggle hide-mobile" onClick={() => setIsDistractionFree(!isDistractionFree)}>
                        {isDistractionFree ? "👀 Show UI" : "🙈 Focus Mode"}
                    </button>

                    <button
                        className="mode-toggle"
                        onClick={() => setReadMode(m => m === "scroll" ? "paged" : "scroll")}
                    >
                        {readMode === "scroll" ? "↕️ Scroll" : "📖 Paged"}
                    </button>

                    <div className="settings-wrapper">
                        <button className="theme-toggle" onClick={() => setShowSettings(!showSettings)}>
                            ⚙️ Aa
                        </button>

                        {showSettings && (
                            <div className="reader-settings-panel">
                                <div className="settings-row">
                                    <span>Theme</span>
                                    <div className="theme-options">
                                        {THEMES.map(t => (
                                            <button
                                                key={t.id}
                                                className={`theme-btn ${theme === t.id ? "active" : ""}`}
                                                onClick={() => setTheme(t.id)}
                                            >{t.icon}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="settings-row">
                                    <span>Size</span>
                                    <div className="spin-control">
                                        <button onClick={() => setFontSizeIdx(Math.max(0, fontSizeIdx - 1))}>−</button>
                                        <span>{fontSize}</span>
                                        <button onClick={() => setFontSizeIdx(Math.min(FONT_SIZES.length - 1, fontSizeIdx + 1))}>+</button>
                                    </div>
                                </div>
                                <div className="settings-row">
                                    <span>Spacing</span>
                                    <div className="spin-control">
                                        <button onClick={() => setLineSpacingIdx(Math.max(0, lineSpacingIdx - 1))}>−</button>
                                        <span>{lineSpacing}</span>
                                        <button onClick={() => setLineSpacingIdx(Math.min(LINE_SPACINGS.length - 1, lineSpacingIdx + 1))}>+</button>
                                    </div>
                                </div>
                                {readMode === "paged" && (
                                    <div className="settings-row jump-row">
                                        <span>Jump to Page</span>
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

            <div className="reader-container" onClick={() => {
                if (showSettings) setShowSettings(false);
                if (isDistractionFree) setIsDistractionFree(false); // tapping screen exits focus mode temporarily
            }}>
                <div className="reader-header">
                    <p className="reader-book-label">Chapter {chapter?.chapterNumber}</p>
                    <h1 className="reader-chapter-title">{chapter?.title || `Chapter ${chapter?.chapterNumber}`}</h1>
                    <div className="reader-divider" />
                </div>

                <div className={`reader-content mode-${readMode}`} style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing }}>
                    {readMode === "scroll" ? (
                        paragraphs.map((para, i) => <p key={i}>{para}</p>)
                    ) : (
                        <div className="flipbook-wrapper">
                            <HTMLFlipBook
                                width={350} height={500} size="stretch"
                                minWidth={315} maxWidth={1000} minHeight={400} maxHeight={800}
                                maxShadowOpacity={0.5} showCover={false} mobileScrollSupport={true}
                                className="novel-flipbook" ref={flipBookRef} onFlip={onFlip}
                                usePortrait={true} startPage={initialPage}
                            >
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <Page number={i + 1} key={i}>
                                        {paragraphs.slice(i * parasPerPage, (i + 1) * parasPerPage).map((para, idx) => (
                                            <p key={idx}>{para}</p>
                                        ))}
                                    </Page>
                                ))}
                            </HTMLFlipBook>
                        </div>
                    )}
                </div>

                <div className="reader-nav">
                    <button className="reader-nav-btn" disabled={!nav?.prev && (readMode === "scroll" || pageIndex === 0)} onClick={handlePrev}>
                        ← {readMode === "paged" && pageIndex > 0 ? "Prev Page" : (nav?.prev ? `Ch. ${nav.prev.chapterNumber}` : "No Previous")}
                    </button>
                    <span className="reader-chapter-badge">Ch. {chapter?.chapterNumber}</span>
                    <button className="reader-nav-btn" disabled={!nav?.next && (readMode === "scroll" || pageIndex >= totalPages - 1)} onClick={handleNext}>
                        {readMode === "paged" && pageIndex < totalPages - 1 ? "Next Page" : (nav?.next ? `Ch. ${nav.next.chapterNumber}` : "No Next")} →
                    </button>
                </div>
            </div>

            {/* Bottom Progress Bar */}
            {readMode === "paged" && (
                <div className="reader-progress-bar-container">
                    <div className="reader-progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            )}
        </div>
    );
}

export default NovelReader;
