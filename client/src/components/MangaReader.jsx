import React, { useEffect, useState, useRef } from "react";
import { saveProgress } from "../services/api";
import "./MangaReader.css";

function MangaReader({ data, bookId, currentChapter, chaptersList, onNavigate, onBack }) {
    const chapter = data?.chapter;
    const nav = data?.navigation;
    const pages = chapter?.pages || [];

    const [isDistractionFree, setIsDistractionFree] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);

    // Track scroll for active progress bar matching pages read vs total height
    const scrollMonitor = () => {
        const h = document.documentElement;
        // height scrolled / total available scroll space
        const scrolled = (h.scrollTop + h.clientHeight) / h.scrollHeight;
        setReadingProgress(Math.min(100, Math.max(0, scrolled * 100)));
    };

    useEffect(() => {
        window.addEventListener("scroll", scrollMonitor);
        return () => window.removeEventListener("scroll", scrollMonitor);
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    // Save progress aggressively initially
    useEffect(() => {
        saveProgress(bookId, {
            lastChapterNumber: currentChapter,
            chapterId: chapter?._id || null,
        }).catch(() => { });
    }, [bookId, currentChapter, chapter]);

    const handleNext = () => { if (nav?.next) onNavigate(`/read/${bookId}/${nav.next.chapterNumber}`); };
    const handlePrev = () => { if (nav?.prev) onNavigate(`/read/${bookId}/${nav.prev.chapterNumber}`); };

    return (
        <div className={`manga-reader-container ${isDistractionFree ? 'manga-distraction-free' : ''}`}>

            {/* Top Toolbar */}
            <div className="manga-toolbar">
                <div className="manga-toolbar-left">
                    <button className="btn-manga-back" onClick={onBack}>← Back</button>
                    {chaptersList?.length > 0 && (
                        <select
                            className="chapter-jump-dropdown dark"
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

                <div className="manga-toolbar-right">
                    <button className="btn-manga-icon" onClick={toggleFullScreen} title="Fullscreen">🔲</button>
                    <button className="btn-manga-icon" onClick={() => setIsDistractionFree(!isDistractionFree)} title="Focus Mode">
                        {isDistractionFree ? "👀" : "🙈"}
                    </button>
                    <div className="manga-nav-small">
                        <button disabled={!nav?.prev} onClick={handlePrev}>Prev</button>
                        <button disabled={!nav?.next} onClick={handleNext}>Next</button>
                    </div>
                </div>
            </div>

            {/* Vertical Flow Images */}
            {/* Tap center to toggle distraction free */}
            <div className="manga-scroll-content" onClick={() => setIsDistractionFree(!isDistractionFree)}>
                {pages.map((url, idx) => (
                    <img
                        key={idx}
                        src={url}
                        alt={`Page ${idx + 1}`}
                        loading="lazy"
                        className="manga-image-block"
                    />
                ))}
            </div>

            <div className="manga-footer">
                <button className="btn-manga-large" disabled={!nav?.prev} onClick={handlePrev}>
                    ← Previous Chapter
                </button>
                <button className="btn-manga-large primary" disabled={!nav?.next} onClick={handleNext}>
                    Next Chapter →
                </button>
            </div>

            {/* Fixed Progress Bar overlaying the bottom screen */}
            <div className="manga-progress-bar">
                <div className="manga-progress-fill" style={{ width: `${readingProgress}%` }}></div>
            </div>
        </div>
    );
}

export default MangaReader;
