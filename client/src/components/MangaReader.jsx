import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { saveProgress } from "../services/api";
import "./MangaReader.css";

// ── Lazy image with Intersection Observer ────────────────────────
// This avoids loading ALL images at once on chapter load.
// Each image only requests from the network once it scrolls near the viewport.
const LazyImage = memo(({ src, index, alt }) => {
    const imgRef = useRef(null);
    const [visible, setVisible] = useState(index < 3); // pre-load first 3

    useEffect(() => {
        if (visible) return; // Already loaded, skip observer

        const el = imgRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: "300px 0px", // Start loading 300px before visible
                threshold: 0,
            }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [visible]);

    return (
        <div ref={imgRef} className="manga-image-container">
            {visible ? (
                <img
                    src={src}
                    alt={alt}
                    className="manga-image-block"
                    decoding="async"
                    onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling?.classList.remove("manga-img-error--hidden");
                    }}
                />
            ) : (
                <div className="manga-image-placeholder" aria-label="Loading image..." />
            )}
            <div className="manga-img-error manga-img-error--hidden">
                ⚠️ Image failed to load
            </div>
        </div>
    );
});
LazyImage.displayName = "LazyImage";

// ── Main MangaReader Component ───────────────────────────────────
function MangaReader({ data, initialPage, bookId, currentChapter, chaptersList, onNavigate, onBack }) {
    const chapter = data?.chapter;
    const nav = data?.navigation;
    const pages = chapter?.pages || [];

    const [isDistractionFree, setIsDistractionFree] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    const [currentPage, setCurrentPage] = useState(initialPage || 0);
    const [showToolbar, setShowToolbar] = useState(true);

    const containerRef = useRef(null);
    const saveTimerRef = useRef(null);
    const toolbarTimerRef = useRef(null);
    const lastScrollY = useRef(0);

    // ── Restore initial page on load ───────────────────────────────
    useEffect(() => {
        if (initialPage > 0) {
            // Give time for images to at least start rendering
            setTimeout(() => {
                const pageEl = document.getElementById(`manga-page-${initialPage}`);
                if (pageEl) {
                    pageEl.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 500);
        }
    }, [initialPage]);

    // ── Scroll-driven progress + auto-hide toolbar ───────────────
    const handleScroll = useCallback(() => {
        const h = document.documentElement;
        const scrolled = (h.scrollTop + h.clientHeight) / h.scrollHeight;
        setReadingProgress(Math.min(100, Math.max(0, scrolled * 100)));

        // Track current page based on scroll
        const pageElements = document.querySelectorAll(".manga-image-container");
        let activePage = 0;
        for (let i = 0; i < pageElements.length; i++) {
            const rect = pageElements[i].getBoundingClientRect();
            if (rect.top < window.innerHeight / 2) {
                activePage = i;
            } else {
                break;
            }
        }
        if (activePage !== currentPage) {
            setCurrentPage(activePage);
            // Debounced save
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                saveProgress(bookId, {
                    lastChapterNumber: currentChapter,
                    chapterId: chapter?._id || null,
                    position: { page: activePage }
                });
            }, 2000);
        }

        // Auto-hide toolbar when scrolling down quickly
        const currentY = h.scrollTop;
        if (currentY > lastScrollY.current + 30) {
            setShowToolbar(false);
        } else if (currentY < lastScrollY.current - 10) {
            setShowToolbar(true);
        }
        lastScrollY.current = currentY;

        // Debounced auto-reveal toolbar after scroll stops
        if (toolbarTimerRef.current) clearTimeout(toolbarTimerRef.current);
        toolbarTimerRef.current = setTimeout(() => setShowToolbar(true), 1200);
    }, [currentPage, bookId, currentChapter, chapter?._id]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (toolbarTimerRef.current) clearTimeout(toolbarTimerRef.current);
        };
    }, [handleScroll]);

    // ── Cleanup timers ───────────────────────────────────────────
    useEffect(() => () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        if (toolbarTimerRef.current) clearTimeout(toolbarTimerRef.current);
    }, []);

    const toggleFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen?.();
        }
    }, []);

    const handleNext = useCallback(() => {
        if (nav?.next) onNavigate(`/read/${bookId}/${nav.next.chapterNumber}`);
    }, [nav, bookId, onNavigate]);

    const handlePrev = useCallback(() => {
        if (nav?.prev) onNavigate(`/read/${bookId}/${nav.prev.chapterNumber}`);
    }, [nav, bookId, onNavigate]);

    // ── Touch swipe for chapter navigation ──────────────────────
    const touchStartY = useRef(null);

    const handleTouchStart = useCallback((e) => {
        touchStartY.current = e.touches[0].clientY;
    }, []);

    const handleTouchEnd = useCallback((e) => {
        if (touchStartY.current === null) return;
        const dy = e.changedTouches[0].clientY - touchStartY.current;
        // Only detect very long swipes at top/bottom to avoid conflicting with scroll
        const atTop = document.documentElement.scrollTop < 30;
        const atBottom = (document.documentElement.scrollTop + window.innerHeight) >= document.documentElement.scrollHeight - 30;

        if (dy > 120 && atTop) handlePrev();
        if (dy < -120 && atBottom) handleNext();
        touchStartY.current = null;
    }, [handlePrev, handleNext]);

    return (
        <div
            className={`manga-reader-container ${isDistractionFree ? 'manga-distraction-free' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* ── Top Toolbar ── */}
            <div className={`manga-toolbar ${showToolbar ? 'manga-toolbar--visible' : 'manga-toolbar--hidden'}`}>
                <div className="manga-toolbar-left">
                    <button className="btn-manga-back" onClick={onBack} aria-label="Back">← Back</button>

                    {chaptersList?.length > 0 && (
                        <select
                            className="chapter-jump-dropdown dark"
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

                <div className="manga-toolbar-right">
                    <span className="manga-page-count">{pages.length} pages</span>
                    <button className="btn-manga-icon" onClick={toggleFullScreen} title="Fullscreen">⛶</button>
                    <button
                        className="btn-manga-icon"
                        onClick={() => setIsDistractionFree(d => !d)}
                        title={isDistractionFree ? "Show UI" : "Focus Mode"}
                    >
                        {isDistractionFree ? "👁" : "⧆"}
                    </button>
                    <div className="manga-nav-small">
                        <button disabled={!nav?.prev} onClick={handlePrev} aria-label="Previous chapter">Prev</button>
                        <button disabled={!nav?.next} onClick={handleNext} aria-label="Next chapter">Next</button>
                    </div>
                </div>
            </div>

            {/* ── Vertical Image Stream ── */}
            <div className="manga-scroll-content">
                {pages.length > 0 ? (
                    pages.map((url, idx) => (
                        <div key={`${currentChapter}-${idx}`} id={`manga-page-${idx}`} className="manga-page-anchor">
                            <LazyImage
                                src={url}
                                index={idx}
                                alt={`Page ${idx + 1}`}
                            />
                        </div>
                    ))
                ) : (
                    <div className="manga-empty">
                        <span>📭</span>
                        <p>No pages found for this chapter.</p>
                    </div>
                )}
            </div>

            {/* ── Footer Nav ── */}
            <div className="manga-footer">
                <button
                    className="btn-manga-large"
                    disabled={!nav?.prev}
                    onClick={handlePrev}
                    aria-label="Previous chapter"
                >
                    ← Previous Chapter
                </button>
                <span className="manga-chapter-label">Ch. {currentChapter}</span>
                <button
                    className="btn-manga-large primary"
                    disabled={!nav?.next}
                    onClick={handleNext}
                    aria-label="Next chapter"
                >
                    Next Chapter →
                </button>
            </div>

            {/* ── Scroll progress bar ── */}
            <div className="manga-progress-bar" role="progressbar" aria-valuenow={Math.round(readingProgress)}>
                <div className="manga-progress-fill" style={{ width: `${readingProgress}%` }} />
            </div>
        </div>
    );
}

export default memo(MangaReader);
