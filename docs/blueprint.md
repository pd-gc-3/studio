# **App Name**: EchoFlow

## Core Features:

- Chat UI: Clean and intuitive chat interface using Next.js App Router and TailwindCSS.
- Firebase Authentication: Firebase Authentication integration (Google + Email/Password) with signup page, TOS acceptance, and automatic logout on token expiration.
- PostgreSQL Integration: PostgreSQL database for user and thread management using defined schemas.
- Thread Management: Thread list sidebar with 'New Chat' button, thread search, and delete functionality.
- AI Thread Title: AI-powered thread title generation using GroqAPI's llama-3.1-8b-instant upon first message, utilizing its tool use capabilities.
- Edit Last Message: Message editing feature allowing users to edit and resend their last message before a bot reply.
- Chat Sharing: Chat sharing feature to create a shareable URL (/share/[thread_id]) for read-only public access.

## Style Guidelines:

- Primary color: Soft blue (#64B5F6) to evoke a sense of calm and trust, complementing the communication focus.
- Background color: Light gray (#F0F4F8) for a clean, unobtrusive backdrop that highlights the content.
- Accent color: Subtle teal (#4DB6AC) to provide a gentle, accessible contrast and visual interest.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines, and 'Inter' (sans-serif) for body text.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use a set of consistent, modern icons for thread actions (share, delete) and status indicators (loading, error).
- Mobile-optimized responsive design with a collapsible sidebar for smaller screens.