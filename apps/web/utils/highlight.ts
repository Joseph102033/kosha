/**
 * Text Highlighting Utilities
 * Functions for highlighting matched keywords and regex patterns in law text
 */

export interface HighlightSegment {
  text: string;
  isHighlighted: boolean;
  matchType?: 'keyword' | 'regex';
  pattern?: string;
}

/**
 * Highlight multiple patterns in text with deterministic ordering
 * @param text - The text to highlight
 * @param patterns - Array of patterns to highlight (keywords or regex strings)
 * @param isRegex - Whether patterns are regular expressions
 * @returns Array of text segments with highlight information
 */
export function highlightText(
  text: string,
  patterns: string[],
  isRegex: boolean = false
): HighlightSegment[] {
  if (!text || patterns.length === 0) {
    return [{ text, isHighlighted: false }];
  }

  // Find all matches with their positions
  interface Match {
    start: number;
    end: number;
    matchedText: string;
    pattern: string;
    matchType: 'keyword' | 'regex';
  }

  const matches: Match[] = [];

  for (const pattern of patterns) {
    try {
      if (isRegex) {
        // Regex pattern matching
        const regex = new RegExp(pattern, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            matchedText: match[0],
            pattern: pattern,
            matchType: 'regex',
          });
        }
      } else {
        // Simple keyword matching (case-insensitive)
        const regex = new RegExp(escapeRegex(pattern), 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            matchedText: match[0],
            pattern: pattern,
            matchType: 'keyword',
          });
        }
      }
    } catch (e) {
      // Invalid regex, skip
      console.warn(`Invalid pattern: ${pattern}`, e);
    }
  }

  if (matches.length === 0) {
    return [{ text, isHighlighted: false }];
  }

  // Sort matches by start position for deterministic ordering
  matches.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    // If same start position, longer match first
    return b.end - b.start - (a.end - a.start);
  });

  // Merge overlapping matches
  const mergedMatches: Match[] = [];
  let currentMatch = matches[0];

  for (let i = 1; i < matches.length; i++) {
    const nextMatch = matches[i];

    if (nextMatch.start <= currentMatch.end) {
      // Overlapping or adjacent - extend current match
      currentMatch = {
        start: currentMatch.start,
        end: Math.max(currentMatch.end, nextMatch.end),
        matchedText: text.substring(currentMatch.start, Math.max(currentMatch.end, nextMatch.end)),
        pattern: currentMatch.pattern, // Keep first pattern
        matchType: currentMatch.matchType,
      };
    } else {
      // Non-overlapping - push current and start new
      mergedMatches.push(currentMatch);
      currentMatch = nextMatch;
    }
  }
  mergedMatches.push(currentMatch);

  // Build segments from merged matches
  const segments: HighlightSegment[] = [];
  let lastEnd = 0;

  for (const match of mergedMatches) {
    // Add non-highlighted text before this match
    if (match.start > lastEnd) {
      segments.push({
        text: text.substring(lastEnd, match.start),
        isHighlighted: false,
      });
    }

    // Add highlighted match
    segments.push({
      text: match.matchedText,
      isHighlighted: true,
      matchType: match.matchType,
      pattern: match.pattern,
    });

    lastEnd = match.end;
  }

  // Add remaining non-highlighted text
  if (lastEnd < text.length) {
    segments.push({
      text: text.substring(lastEnd),
      isHighlighted: false,
    });
  }

  return segments;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlight multiple types of patterns (keywords + regex) in text
 * @param text - The text to highlight
 * @param keywords - Array of keyword strings
 * @param regexPatterns - Array of regex pattern strings
 * @returns Array of text segments with highlight information
 */
export function highlightMultipleTypes(
  text: string,
  keywords: string[],
  regexPatterns: string[]
): HighlightSegment[] {
  // Combine both keyword and regex matches
  const allPatterns: Array<{ pattern: string; isRegex: boolean }> = [
    ...keywords.map((k) => ({ pattern: k, isRegex: false })),
    ...regexPatterns.map((r) => ({ pattern: r, isRegex: true })),
  ];

  if (allPatterns.length === 0) {
    return [{ text, isHighlighted: false }];
  }

  // Find all matches with their positions
  interface Match {
    start: number;
    end: number;
    matchedText: string;
    pattern: string;
    matchType: 'keyword' | 'regex';
  }

  const matches: Match[] = [];

  for (const { pattern, isRegex } of allPatterns) {
    try {
      const regex = isRegex ? new RegExp(pattern, 'gi') : new RegExp(escapeRegex(pattern), 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          matchedText: match[0],
          pattern: pattern,
          matchType: isRegex ? 'regex' : 'keyword',
        });
      }
    } catch (e) {
      console.warn(`Invalid pattern: ${pattern}`, e);
    }
  }

  if (matches.length === 0) {
    return [{ text, isHighlighted: false }];
  }

  // Sort and merge matches (same logic as above)
  matches.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return b.end - b.start - (a.end - a.start);
  });

  const mergedMatches: Match[] = [];
  let currentMatch = matches[0];

  for (let i = 1; i < matches.length; i++) {
    const nextMatch = matches[i];

    if (nextMatch.start <= currentMatch.end) {
      currentMatch = {
        start: currentMatch.start,
        end: Math.max(currentMatch.end, nextMatch.end),
        matchedText: text.substring(currentMatch.start, Math.max(currentMatch.end, nextMatch.end)),
        pattern: currentMatch.pattern,
        matchType: currentMatch.matchType,
      };
    } else {
      mergedMatches.push(currentMatch);
      currentMatch = nextMatch;
    }
  }
  mergedMatches.push(currentMatch);

  // Build segments
  const segments: HighlightSegment[] = [];
  let lastEnd = 0;

  for (const match of mergedMatches) {
    if (match.start > lastEnd) {
      segments.push({
        text: text.substring(lastEnd, match.start),
        isHighlighted: false,
      });
    }

    segments.push({
      text: match.matchedText,
      isHighlighted: true,
      matchType: match.matchType,
      pattern: match.pattern,
    });

    lastEnd = match.end;
  }

  if (lastEnd < text.length) {
    segments.push({
      text: text.substring(lastEnd),
      isHighlighted: false,
    });
  }

  return segments;
}

/**
 * Get a summary of all matched patterns in text
 * @param text - The text to search
 * @param keywords - Array of keyword strings
 * @param regexPatterns - Array of regex pattern strings
 * @returns Array of matched pattern summaries
 */
export function getMatchedPatterns(
  text: string,
  keywords: string[],
  regexPatterns: string[]
): Array<{ pattern: string; matchType: 'keyword' | 'regex'; count: number }> {
  const results: Array<{ pattern: string; matchType: 'keyword' | 'regex'; count: number }> = [];

  // Check keywords
  for (const keyword of keywords) {
    try {
      const regex = new RegExp(escapeRegex(keyword), 'gi');
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        results.push({
          pattern: keyword,
          matchType: 'keyword',
          count: matches.length,
        });
      }
    } catch (e) {
      console.warn(`Invalid keyword: ${keyword}`, e);
    }
  }

  // Check regex patterns
  for (const pattern of regexPatterns) {
    try {
      const regex = new RegExp(pattern, 'gi');
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        results.push({
          pattern: pattern,
          matchType: 'regex',
          count: matches.length,
        });
      }
    } catch (e) {
      console.warn(`Invalid regex: ${pattern}`, e);
    }
  }

  return results;
}
