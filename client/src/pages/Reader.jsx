import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import { fetchChapter, saveProgress } from "../services/api";
import "./Reader.css";

const FONT_SIZES = [14, 16, 18, 20, 22, 24];

const FALLBACK = {
    chapter: {
        title: "Chapter 1 — The Weakest Hunter",
        chapterNumber: 1,
        content: `Ten years ago, a mysterious phenomenon called "The Gate" appeared, connecting the real world with a realm full of monsters. Since then, humans who possess the ability to enter these dungeons — known as "Hunters" — have emerged.

Sung Jin-Woo is ranked at the very bottom of the hunter hierarchy: an E-rank hunter. Frail, weak, and barely capable of completing the simplest dungeons, he is mocked by those around him. Yet, he can't afford to quit — he needs the money to pay for his mother's hospital bills and to support his little sister.

One fateful day, Jin-Woo joins a group of hunters on a seemingly routine D-rank dungeon raid. The dungeon, however, hides a terrifying secret — a hidden double dungeon.

On the brink of death, a blue system window appears before his eyes — only visible to him.

[You have been selected as the Player.]

The game has just begun. And for the first time in his life, Sung Jin-Woo smiles.`,
        wordCount: 154,
    },
    navigation: { prev: null, next: null },
};

// Single page component required by HTMLFlipBook
const Page = React.forwardRef((props, ref) => {
    return (
        <div className="book-page" ref={ref} data-density="soft">
            <div className="page-content">{props.children}</div>
            <div className="page-footer">Page {props.number}</div>
        </div>
    );
});
Page.displayName = "Page";

function Reader() {
    const { bookId, chapterNumber } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(true);
    const [fontSizeIdx, setFontSizeIdx] = useState(2);
    const [saved, setSaved] = useState(false);

    // Reading Modes State
    const [readMode, setReadMode] = useState("scroll"); // 'scroll' or 'paged'
    const [pageIndex, setPageIndex] = useState(0);

    const flipBookRef = useRef(null);

    const fontSize = FONT_SIZES[fontSizeIdx];
    const currentChapter = parseInt(chapterNumber) || 1;

    const load = useCallback(async () => {
        setLoading(true);
        setSaved(false);
        try {
            const result = await fetchChapter(bookId, currentChapter);
            setData(result);
            try {
                await saveProgress(bookId, {
                    lastChapterNumber: result.chapter.chapterNumber,
                    chapterId: result.chapter._id || null,
                });
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            } catch {
                // Silently fail
            }
        } catch {
            setData(FALLBACK);
        } finally {
            setLoading(false);
        }
    }, [bookId, currentChapter]);

    useEffect(() => {
        load();
        setPageIndex(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [load]);

    // Reset pagination cleanly when mode changes
    useEffect(() => {
        setPageIndex(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (flipBookRef.current?.pageFlip()) {
            try {
                flipBookRef.current.pageFlip().turnToPage(0);
            } catch (e) {
                // ignore initialization errors
            }
        }
    }, [readMode]);

    const chapter = data?.chapter;
    const nav = data?.navigation;

    // Computation for Pages
    const isNovel = !!chapter?.content;
    const parasPerPage = 6;
    let paragraphs = [];
    let totalPages = 1;

    if (chapter) {
        if (isNovel) {
            paragraphs = chapter.content.split("\n\n").filter(p => p.trim() !== "");
            totalPages = Math.ceil(paragraphs.length / parasPerPage);
            // FlipBook needs an even number of pages ideally, but it handles odd gracefully mostly.
        } else {
            totalPages = chapter.pages?.length || 1;
        }
    }

    const onFlip = useCallback((e) => {
        setPageIndex(e.data); // e.data is current page index
    }, []);

    const handleNext = () => {
        if (readMode === "paged") {
            if (isNovel && flipBookRef.current?.pageFlip()) {
                flipBookRef.current.pageFlip().flipNext();
            } else if (!isNovel && pageIndex < totalPages - 1) {
                setPageIndex(p => p + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else if (nav?.next) {
                navigate(`/read/${bookId}/${nav.next.chapterNumber}`);
            }
        } else if (nav?.next) {
            navigate(`/read/${bookId}/${nav.next.chapterNumber}`);
        }
    };

    const handlePrev = () => {
        if (readMode === "paged") {
            if (isNovel && flipBookRef.current?.pageFlip()) {
                flipBookRef.current.pageFlip().flipPrev();
            } else if (!isNovel && pageIndex > 0) {
                setPageIndex(p => p - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else if (nav?.prev) {
                navigate(`/read/${bookId}/${nav.prev.chapterNumber}`);
            }
        } else if (nav?.prev) {
            navigate(`/read/${bookId}/${nav.prev.chapterNumber}`);
        }
    };

    return (
        <div className={`reader-page ${isDark ? "reader-dark" : "reader-light"}`}>
            {/* Toolbar */}
            <div className="reader-toolbar">
                <button className="reader-back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>

                <div className="reader-controls">
                    {saved && <span className="saved-indicator">✓ Progress saved</span>}

                    <button
                        className="mode-toggle"
                        onClick={() => setReadMode(m => m === "scroll" ? "paged" : "scroll")}
                    >
                        {readMode === "scroll" ? "↕️ Scroll Mode" : "📖 Paged Mode"}
                    </button>

                    {isNovel && (
                        <div className="font-control">
                            <button
                                className="font-btn"
                                onClick={() => setFontSizeIdx((i) => Math.max(0, i - 1))}
                                disabled={fontSizeIdx === 0}
                            >A−</button>
                            <span className="font-size-label">{fontSize}px</span>
                            <button
                                className="font-btn"
                                onClick={() => setFontSizeIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
                                disabled={fontSizeIdx === FONT_SIZES.length - 1}
                            >A+</button>
                        </div>
                    )}

                    <button
                        className="theme-toggle"
                        onClick={() => setIsDark((d) => !d)}
                    >
                        {isDark ? "☀️ Light" : "🌙 Dark"}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="reader-container">
                {loading ? (
                    <div className="reader-loading">
                        <div className="reader-spinner" />
                        <p>Loading chapter...</p>
                    </div>
                ) : (
                    <>
                        <div className="reader-header">
                            <p className="reader-book-label">Chapter {chapter?.chapterNumber}</p>
                            <h1 className="reader-chapter-title">{chapter?.title || `Chapter ${chapter?.chapterNumber}`}</h1>
                            {chapter?.wordCount > 0 && (
                                <p className="reader-meta">
                                    {chapter.wordCount.toLocaleString()} words ·{" "}
                                    ~{Math.ceil(chapter.wordCount / 200)} min read
                                </p>
                            )}
                            {readMode === "paged" && !isNovel && (
                                <p className="reader-meta-page">
                                    Page {pageIndex + 1} of {totalPages}
                                </p>
                            )}
                            <div className="reader-divider" />
                        </div>

                        <div
                            className={`reader-content mode-${readMode}`}
                            style={isNovel ? { fontSize: `${fontSize}px`, lineHeight: fontSize < 18 ? "1.75" : "1.9" } : {}}
                        >
                            {isNovel ? (
                                // NOVEL RENDERING
                                readMode === "scroll" ? (
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
                                )
                            ) : (
                                // MANGA RENDERING
                                readMode === "scroll" ? (
                                    chapter?.pages?.map((url, i) => (
                                        <img key={i} src={url} alt={`Page ${i + 1}`} className="reader-page-img" />
                                    ))
                                ) : (
                                    <div key={pageIndex} className="paged-image-container">
                                        <img
                                            src={chapter?.pages?.[pageIndex]}
                                            alt={`Page ${pageIndex + 1}`}
                                            className="reader-page-img-single"
                                        />
                                        <div className="manga-nav-overlay">
                                            <div className="manga-nav-left" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
                                            <div className="manga-nav-right" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
                                        </div>
                                    </div>
                                )
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
                    </>
                )}
            </div>
        </div>
    );
}

export default Reader;
