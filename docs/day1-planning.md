# 📝 Day 1 — Idea Clarity & Feature Planning

**Date**: February 24, 2026  
**Status**: ✅ Complete

---

## 🔍 Problem Statement

### The Core Problem
Readers who enjoy multiple formats (novels, manga, manhwa, manhua) have no single platform to manage all their reading. They are forced to:
1. Use 4–6 different apps simultaneously
2. Create multiple accounts across platforms
3. Track reading progress manually across apps
4. Miss out on cross-format content recommendations

### The Opportunity
Build a **unified reading platform** that handles all content formats with format-appropriate reading experiences, under one account.

---

## 🎯 Target Audience

### Primary User — The Multi-Format Reader
- Age: 16–28
- Reads at least 2 different formats (e.g., novels + manhwa)
- Frustrated by app fragmentation
- Wants a "Netflix for books" experience

### Secondary User — The New Reader
- Age: 13–20
- Just getting into manga/manhwa
- Wants a guided, beginner-friendly experience
- Benefits from cross-format discovery

### User Pain Points
| Pain Point | Severity |
|------------|----------|
| Too many apps to manage | 🔴 High |
| Losing reading progress across devices | 🔴 High |
| No cross-format recommendations | 🟡 Medium |
| Inconsistent UI/UX across platforms | 🟡 Medium |
| Subscription costs on each platform | 🟡 Medium |

---

## ⚔️ Competitive Analysis

### vs. Kindle
- Kindle: Paid books only, no manga/manhwa support, no community
- BookVill: Multi-format, free community content + premium, social reading

### vs. Webtoon
- Webtoon: Only vertical manhwa/webtoon format, limited catalog type
- BookVill: All formats, novels + manga + manhwa + manhua

### vs. MangaDex
- MangaDex: Manga only, fan-translation focused, poor UI
- BookVill: All formats, clean modern UI, official + community content

### Our Unique Angle
> **Cross-format discovery + unified reading experience + one library**

---

## ✅ Core Feature Definitions (v1.0)

### Feature 1: User Authentication
**Goal**: Secure, simple sign-in across devices

**Scope**:
- Email/password registration + login
- Google OAuth sign-in
- Password reset via email
- JWT-based session management
- User profile page (avatar, username, bio, reading stats)

**Out of scope (v1)**: Discord OAuth, 2FA

---

### Feature 2: Book Library
**Goal**: Browseable catalog of all available titles

**Scope**:
- Grid/list view of all books
- Book card: cover, title, author, rating, chapter count, format tag
- Homepage sections: Trending, New Arrivals, Top Rated, Continue Reading
- Filter by format type

**Out of scope (v1)**: User-uploaded books, advanced sorting

---

### Feature 3: Reader
**Goal**: Native, comfortable reading experience for each format

**Scope**:
- **Novel/Light Novel**: Scrollable text with font/size controls
- **Manga**: Horizontal page-by-page (RTL), panel zoom
- **Manhwa/Webtoon**: Infinite vertical scroll
- Dark/Light/Sepia theme
- Auto-save reading position
- Chapter navigation (Previous / Next / Chapter List)

**Out of scope (v1)**: Offline reading, audio narration

---

### Feature 4: Bookmark & Progress Tracking
**Goal**: Never lose your place across any device

**Scope**:
- Auto-save: last read chapter + page/scroll position
- Manual bookmarks with optional notes
- Reading status per book: `Reading` / `Completed` / `Plan to Read` / `Dropped`
- Reading history timeline

**Out of scope (v1)**: Reading streak gamification, social sharing of progress

---

### Feature 5: Categories & Discovery
**Goal**: Help readers find new content they'll love

**Scope**:
- Genre tags: Fantasy, Romance, Action, Horror, Mystery, Sci-Fi, Slice of Life, etc.
- Format filter: Novel / Manga / Manhwa / Manhua / Comics
- Status filter: Ongoing / Completed
- Discovery sections: Trending this week, Editor's picks
- Tag-based browsing

**Out of scope (v1)**: AI-powered recommendations, user-curated lists

---

### Feature 6: Search
**Goal**: Find any book instantly

**Scope**:
- Search by: title, author, genre tags
- Autocomplete dropdown suggestions
- Filter results by: format, status, rating
- Recent searches history

**Out of scope (v1)**: Full-text content search, voice search

---

## 📊 Feature Priority Matrix

| Feature | Priority | Complexity | Week |
|---------|----------|------------|------|
| User Auth | 🔴 Must Have | Medium | Week 1 |
| Book Library | 🔴 Must Have | Medium | Week 1 |
| Reader (basic) | 🔴 Must Have | High | Week 1–2 |
| Bookmarks | 🔴 Must Have | Low | Week 2 |
| Categories | 🟡 Should Have | Low | Week 2 |
| Search | 🟡 Should Have | Medium | Week 2 |

---

## 🔮 Future Features (v2+)

- 💬 Comments and discussions per chapter
- ⭐ Ratings and reviews
- 📱 Mobile app (React Native)
- 🔔 Update notifications (new chapter alerts)
- 🤝 Social: Follow users, see what friends read
- 📤 Content creator portal (upload your own story/manga)
- 🌐 Multi-language support

---

## 📌 Day 1 Checklist

- [x] Define the core problem
- [x] Define target audience
- [x] Competitive analysis (vs Kindle, Webtoon, MangaDex)
- [x] List core features with scope boundaries
- [x] Create priority matrix
- [x] Write README.md
- [x] Initialize Git repository
- [x] Push to GitHub
