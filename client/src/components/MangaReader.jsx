import React, { useEffect } from "react";
import { saveProgress } from "../services/api";
import "./MangaReader.css";

function MangaReader({ data, bookId, currentChapter, onNavigate, onBack }) {
    const chapter = data?.chapter;
    const nav = data?.navigation;
    const pages = chapter?.pages || [];

    // Save reading progress when chapter is mounted (vertical reading tracks chapters)
    useEffect(() => {
        saveProgress(bookId, {
            lastChapterNumber: currentChapter,
            chapterId: chapter?._id || null,
        }).catch(() => { });
    }, [bookId, currentChapter, chapter]);

    const handleNext = () => {
        if (nav?.next) onNavigate(`/read/${bookId}/${nav.next.chapterNumber}`);
    };

    const handlePrev = () => {
        if (nav?.prev) onNavigate(`/read/${bookId}/${nav.prev.chapterNumber}`);
    };

    return (
        <div className="manga-reader-container">
            {/* Minimalist Top Toolbar */}
            <div className="manga-toolbar">
                <button className="btn-manga-back" onClick={onBack}>← Back</button>
                <div className="manga-chapter-info">
                    <span className="manga-title">{chapter?.title || `Chapter ${chapter?.chapterNumber}`}</span>
                </div>
                <div className="manga-nav-small">
                    <button disabled={!nav?.prev} onClick={handlePrev}>Prev</button>
                    <button disabled={!nav?.next} onClick={handleNext}>Next</button>
                </div>
            </div>

            {/* Vertical Image Scroll */}
            <div className="manga-scroll-content">
                {pages.map((url, idx) => (
                    <img
                        key={idx}
                        src={url}
                        alt={`Page ${idx + 1}`}
                        loading="lazy" /* CRITICAL: Lazy load images */
                        className="manga-image-block"
                    />
                ))}
            </div>

            {/* Bottom Navigation for end of chapter */}
            <div className="manga-footer">
                <button
                    className="btn-manga-large"
                    disabled={!nav?.prev}
                    onClick={handlePrev}
                >
                    ← Previous Chapter
                </button>
                <button
                    className="btn-manga-large primary"
                    disabled={!nav?.next}
                    onClick={handleNext}
                >
                    Next Chapter →
                </button>
            </div>
        </div>
    );
}

export default MangaReader;
