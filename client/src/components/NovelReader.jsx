import React, { useState, useEffect, useCallback, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { saveProgress } from "../services/api";
import "../pages/Reader.css"; // Reuse existing css

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

function NovelReader({ data, initialPage, bookId, currentChapter, onNavigate, onBack }) {
    const chapter = data?.chapter;
    const nav = data?.navigation;

    const [saved, setSaved] = useState(false);

    // Reading Preferences State
    const [theme, setTheme] = useState("dark");
    const [fontSizeIdx, setFontSizeIdx] = useState(2);
    const [lineSpacingIdx, setLineSpacingIdx] = useState(2);
    const [showSettings, setShowSettings] = useState(false);

    // Mode & Position State
    const [readMode, setReadMode] = useState("paged"); // Default to paged for novels
    const [pageIndex, setPageIndex] = useState(initialPage || 0);

    const flipBookRef = useRef(null);

    const fontSize = FONT_SIZES[fontSizeIdx];
    const lineSpacing = LINE_SPACINGS[lineSpacingIdx];

    // Force turn to the correct page when loading finishes or mode toggles
    useEffect(() => {
        if (readMode === "paged" && flipBookRef.current?.pageFlip()) {
            try {
                flipBookRef.current.pageFlip().turnToPage(pageIndex);
            } catch (e) {
                // ignore initialization errors
            }
        }
    }, [readMode]); // eslint-disable-line

    const parasPerPage = 6;
    let paragraphs = [];
    let totalPages = 1;

    if (chapter?.content) {
        paragraphs = chapter.content.split("\n\n").filter(p => p.trim() !== "");
        totalPages = Math.ceil(paragraphs.length / parasPerPage);
    }

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
        if (readMode === "paged") {
            if (flipBookRef.current?.pageFlip()) {
                flipBookRef.current.pageFlip().flipNext();
            }
        } else if (nav?.next) {
            onNavigate(`/read/${bookId}/${nav.next.chapterNumber}`);
        }
    };

    const handlePrev = () => {
        if (readMode === "paged") {
            if (flipBookRef.current?.pageFlip()) {
                flipBookRef.current.pageFlip().flipPrev();
            }
        } else if (nav?.prev) {
            onNavigate(`/read/${bookId}/${nav.prev.chapterNumber}`);
        }
    };

    return (
        <div className={`reader-page reader-${theme}`}>
            {/* Toolbar */}
            <div className="reader-toolbar">
                <button className="reader-back-btn" onClick={onBack}>
                    ← Back
                </button>

                <div className="reader-controls">
                    {saved && <span className="saved-indicator">✓ Saved</span>}

                    <button
                        className="mode-toggle"
                        onClick={() => setReadMode(m => m === "scroll" ? "paged" : "scroll")}
                    >
                        {readMode === "scroll" ? "↕️ Scroll Mode" : "📖 Paged Mode"}
                    </button>

                    <div className="settings-wrapper">
                        <button
                            className="theme-toggle"
                            onClick={() => setShowSettings(!showSettings)}
                        >
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
                                                title={`${t.id} mode`}
                                            >
                                                {t.icon}
                                            </button>
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
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="reader-container" onClick={() => showSettings && setShowSettings(false)}>
                <div className="reader-header">
                    <p className="reader-book-label">Chapter {chapter?.chapterNumber}</p>
                    <h1 className="reader-chapter-title">{chapter?.title || `Chapter ${chapter?.chapterNumber}`}</h1>
                    {chapter?.wordCount > 0 && (
                        <p className="reader-meta">
                            {chapter.wordCount.toLocaleString()} words ·{" "}
                            ~{Math.ceil(chapter.wordCount / 200)} min read
                        </p>
                    )}
                    <div className="reader-divider" />
                </div>

                <div
                    className={`reader-content mode-${readMode}`}
                    style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing }}
                >
                    {readMode === "scroll" ? (
                        paragraphs.map((para, i) => <p key={i}>{para}</p>)
                    ) : (
                        <div className="flipbook-wrapper">
                            <HTMLFlipBook
                                width={350}
                                height={500}
                                size="stretch"
                                minWidth={315}
                                maxWidth={1000}
                                minHeight={400}
                                maxHeight={800}
                                maxShadowOpacity={0.5}
                                showCover={false}
                                mobileScrollSupport={true}
                                className="novel-flipbook"
                                ref={flipBookRef}
                                onFlip={onFlip}
                                usePortrait={true}
                                startPage={initialPage}
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

                {/* Chapter Navigation */}
                <div className="reader-nav">
                    <button
                        className="reader-nav-btn"
                        disabled={!nav?.prev && (readMode === "scroll" || pageIndex === 0)}
                        onClick={handlePrev}
                    >
                        ← {readMode === "paged" && pageIndex > 0 ? "Prev Page" : (nav?.prev ? `Ch. ${nav.prev.chapterNumber}` : "No Previous")}
                    </button>

                    <span className="reader-chapter-badge">Ch. {chapter?.chapterNumber}</span>

                    <button
                        className="reader-nav-btn"
                        disabled={!nav?.next && (readMode === "scroll" || pageIndex >= totalPages - 1)}
                        onClick={handleNext}
                    >
                        {readMode === "paged" && pageIndex < totalPages - 1 ? "Next Page" : (nav?.next ? `Ch. ${nav.next.chapterNumber}` : "No Next")} →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NovelReader;
