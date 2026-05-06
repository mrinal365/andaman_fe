import React from 'react';
import Link from 'next/link';

export const renderTextWithTags = (text: string) => {
    if (!text) return null;

    // Combine matching for @[...]() and #hashtags
    // Regex matches @[username](userId) OR #hashtag
    const combinedRegex = /(@\[([^\]]+)\]\(([^)]+)\))|(#\w+)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        const fullMatch = match[0];

        if (fullMatch.startsWith('@[')) {
            // Mention
            const username = match[2];
            const userId = match[3];
            parts.push(
                <Link 
                    key={`${userId}-${match.index}`} 
                    href={`/u/${username}`}
                    className="text-[var(--color-primary)] font-semibold hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    @{username}
                </Link>
            );
        } else if (fullMatch.startsWith('#')) {
            // Hashtag
            parts.push(
                <span key={`hash-${match.index}`} className="text-[var(--color-primary)] font-semibold">
                    {fullMatch}
                </span>
            );
        }

        lastIndex = match.index + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
};
