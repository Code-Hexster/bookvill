import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
        wordCount: 0,
    },
    navigation: { prev: null, next: null },
};

function Reader() {
    const { bookId, chapterNumber } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(true);
    const [fontSizeIdx, setFontSizeIdx] = useState(2);
    const [saved, setSaved] = useState(false);

    const fontSize = FONT_SIZES[fontSizeIdx];
    const currentChapter = parseInt(chapterNumber) || 1;

    const load = useCallback(async () => {
        setLoading(true);
        setSaved(false);
        try {
            const result = await fetchChapter(bookId, currentChapter);
            setData(result);

            // Auto-save progress to backend
            try {
                await saveProgress(bookId, {
                    lastChapterNumber: result.chapter.chapterNumber,
                    chapterId: result.chapter._id || null,
                });
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            } catch {
                // Silently fail — progress save is non-critical
            }
        } catch {
            setData(FALLBACK);
        } finally {
            setLoading(false);
        }
    }, [bookId, currentChapter]);

    useEffect(() => {
        load();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [load]);

    const goToChapter = (num) => {
        navigate(`/read/${bookId}/${num}`);
    };

    const chapter = data?.chapter;
    const nav = data?.navigation;

    return (
        <div className={`reader-page ${isDark ? "reader-dark" : "reader-light"}`}>
            {/* Toolbar */}
            <div className="reader-toolbar">
                <button className="reader-back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>

                <div className="reader-controls">
                    {/* Saved indicator */}
                    {saved && <span className="saved-indicator">✓ Progress saved</span>}

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
                        <p className="reader-book-label">Chapter {chapter?.chapterNumber}</p>
                        <h1 className="reader-chapter-title">{chapter?.title}</h1>
                        {chapter?.wordCount > 0 && (
                            <p className="reader-meta">
                                {chapter.wordCount.toLocaleString()} words ·{" "}
                                ~{Math.ceil(chapter.wordCount / 200)} min read
                            </p>
                        )}
                        <div className="reader-divider" />

                        <div
                            className="reader-content"
                            style={{ fontSize: `${fontSize}px`, lineHeight: fontSize < 18 ? "1.75" : "1.9" }}
                        >
                            {chapter?.content
                                ? chapter.content.split("\n\n").map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))
                                : chapter?.pages?.map((url, i) => (
                                    <img key={i} src={url} alt={`Page ${i + 1}`} className="reader-page-img" />
                                ))}
                        </div>

                        {/* Chapter Navigation */}
                        <div className="reader-nav">
                            <button
                                className="reader-nav-btn"
                                disabled={!nav?.prev}
                                onClick={() => nav?.prev && goToChapter(nav.prev.chapterNumber)}
                            >
                                ← {nav?.prev ? `Ch. ${nav.prev.chapterNumber}` : "No Previous"}
                            </button>

                            <span className="reader-chapter-badge">Ch. {chapter?.chapterNumber}</span>

                            <button
                                className="reader-nav-btn"
                                disabled={!nav?.next}
                                onClick={() => nav?.next && goToChapter(nav.next.chapterNumber)}
                            >
                                {nav?.next ? `Ch. ${nav.next.chapterNumber}` : "No Next"} →
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Reader;
