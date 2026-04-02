import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchChapter, saveProgress, fetchBookmarkByBook, fetchChaptersByBook } from "../services/api";
import NovelReader from "../components/NovelReader";
import MangaReader from "../components/MangaReader";
import "./Reader.css";

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

function Reader() {
    const { bookId, chapterNumber } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [chaptersList, setChaptersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [initialPage, setInitialPage] = useState(0);

    const currentChapter = parseFloat(chapterNumber) || 1;

    const loadChapterAndProgress = useCallback(async () => {
        setLoading(true);
        try {
            const [result, chList] = await Promise.all([
                fetchChapter(bookId, currentChapter),
                fetchChaptersByBook(bookId).catch(() => []) // Silent fallback
            ]);
            setData(result);
            setChaptersList(chList);

            let initPage = 0;
            // Fetch bookmark to see if we should resume from a specific page
            try {
                const bkmk = await fetchBookmarkByBook(bookId);
                // If the bookmark is on the *current* chapter, resume its exact page
                if (bkmk && bkmk.lastChapterNumber === result.chapter.chapterNumber && bkmk.position?.page) {
                    initPage = bkmk.position.page;
                }
            } catch {
                // Ignore if bookmark doesn't exist
            }

            setInitialPage(initPage);

            // Save initial view silently
            try {
                await saveProgress(bookId, {
                    lastChapterNumber: result.chapter.chapterNumber,
                    chapterId: result.chapter._id || null,
                    position: { page: initPage }
                });
            } catch {
                // Ignore silent save error
            }

        } catch {
            setData(FALLBACK);
        } finally {
            setLoading(false);
        }
    }, [bookId, currentChapter]);

    useEffect(() => {
        loadChapterAndProgress();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [loadChapterAndProgress]);

    if (loading) {
        return (
            <div className={`reader-page reader-dark`}>
                <div className="reader-loading" style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div className="reader-spinner" />
                    <p style={{ marginTop: "1rem" }}>Loading chapter...</p>
                </div>
            </div>
        );
    }

    const isNovel = !!data?.chapter?.content;

    // Smartly dispatch to the correct independent reader component
    if (isNovel) {
        return (
            <NovelReader
                data={data}
                initialPage={initialPage}
                bookId={bookId}
                currentChapter={currentChapter}
                chaptersList={chaptersList}
                onNavigate={(path) => navigate(path)}
                onBack={() => navigate(-1)}
            />
        );
    } else {
        return (
            <MangaReader
                data={data}
                initialPage={initialPage}
                bookId={bookId}
                currentChapter={currentChapter}
                chaptersList={chaptersList}
                onNavigate={(path) => navigate(path)}
                onBack={() => navigate(-1)}
            />
        );
    }
}

export default Reader;
