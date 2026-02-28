import { useState } from "react";
import "./Reader.css";

const MOCK_CHAPTER = {
    bookTitle: "Solo Leveling",
    chapterTitle: "Chapter 1 — The Weakest Hunter",
    content: `
Ten years ago, a mysterious phenomenon called "The Gate" appeared, connecting the real world with a realm full of monsters. Since then, humans who possess the ability to enter these dungeons — known as "Hunters" — have emerged. Hunters must clear these dungeons before the monsters inside invade the real world.

Sung Jin-Woo is ranked at the very bottom of the hunter hierarchy: an E-rank hunter. Frail, weak, and barely capable of completing the simplest dungeons, he is mocked by those around him. Yet, he can't afford to quit — he needs the money to pay for his mother's hospital bills and to support his little sister.

One fateful day, Jin-Woo joins a group of hunters on a seemingly routine D-rank dungeon raid. The dungeon, however, hides a terrifying secret — a hidden double dungeon. The surviving hunters are dragged into an ancient, deadly chamber filled with traps and riddles left by gods of a forgotten era.

The chamber demands absolute devotion. Those who break the rules are killed. With no way out and hunters dying around him, Jin-Woo throws himself in front of a deadly blow to protect the remaining survivors.

On the brink of death, a blue system window appears before his eyes — only visible to him.

[You have been selected as the Player.]

The game has just begun. And for the first time in his life, Sung Jin-Woo smiles.

He doesn't know what the system wants from him. He doesn't know why he was chosen. But one thing is certain — he is no longer alone in this fight. And this time, he will not stop growing.

The stone floor beneath him is cold. Blood pools around his fingers. The countdown timer on the system interface reads 5 seconds. Jin-Woo closes his eyes.

When he opens them, the dungeon is gone. He is lying in a hospital bed, sunlight streaming through white curtains. His body feels... different. Heavier. Stronger. A familiar blue window hovers at the edge of his vision:

[Daily Quest: 100 push-ups, 100 sit-ups, 100 squats, 10 km run.]

He sits up, cracks his knuckles, and gets to work.
    `.trim(),
};

const FONT_SIZES = [14, 16, 18, 20, 22, 24];

function Reader() {
    const [isDark, setIsDark] = useState(true);
    const [fontSizeIdx, setFontSizeIdx] = useState(2); // default 18px

    const fontSize = FONT_SIZES[fontSizeIdx];

    return (
        <div className={`reader-page ${isDark ? "reader-dark" : "reader-light"}`}>
            {/* Top Toolbar */}
            <div className="reader-toolbar">
                <button className="reader-back-btn" onClick={() => window.history.back()}>
                    ← Back
                </button>

                <div className="reader-controls">
                    {/* Font size control */}
                    <div className="font-control">
                        <button
                            className="font-btn"
                            onClick={() => setFontSizeIdx((i) => Math.max(0, i - 1))}
                            disabled={fontSizeIdx === 0}
                            title="Decrease font size"
                        >
                            A−
                        </button>
                        <span className="font-size-label">{fontSize}px</span>
                        <button
                            className="font-btn"
                            onClick={() => setFontSizeIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
                            disabled={fontSizeIdx === FONT_SIZES.length - 1}
                            title="Increase font size"
                        >
                            A+
                        </button>
                    </div>

                    {/* Dark / Light toggle */}
                    <button
                        className="theme-toggle"
                        onClick={() => setIsDark((d) => !d)}
                        title="Toggle theme"
                    >
                        {isDark ? "☀️ Light" : "🌙 Dark"}
                    </button>
                </div>
            </div>

            {/* Reading Area */}
            <div className="reader-container">
                <p className="reader-book-title">{MOCK_CHAPTER.bookTitle}</p>
                <h1 className="reader-chapter-title">{MOCK_CHAPTER.chapterTitle}</h1>
                <div className="reader-divider" />
                <div
                    className="reader-content"
                    style={{ fontSize: `${fontSize}px`, lineHeight: fontSize < 18 ? "1.75" : "1.9" }}
                >
                    {MOCK_CHAPTER.content.split("\n\n").map((para, i) => (
                        <p key={i}>{para}</p>
                    ))}
                </div>

                {/* Chapter Navigation */}
                <div className="reader-nav">
                    <button className="reader-nav-btn" disabled>← Prev Chapter</button>
                    <button className="reader-nav-btn">Next Chapter →</button>
                </div>
            </div>
        </div>
    );
}

export default Reader;
