"use client";

import { type ReactNode } from "react";

/**
 * Simple markdown parser for chat messages.
 * Handles: headings, bold, italic, inline code, lists, horizontal rules, blockquotes, line breaks.
 */

// Parse inline formatting: bold, italic, code, links
function parseInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-blue-100/60 px-1.5 py-0.5 text-[12px] font-mono text-blue-700"
        >
          {match[4]}
        </code>
      );
    } else if (match[5] && match[6]) {
      parts.push(
        <a
          key={key++}
          href={match[6]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline decoration-blue-300 hover:decoration-blue-500"
        >
          {match[5]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

// Parse a paragraph's text into ReactNodes, preserving single \n as <br>
function parseParagraphContent(text: string): ReactNode[] {
  const lines = text.split("\n");
  const result: ReactNode[] = [];

  lines.forEach((line, i) => {
    // Parse inline formatting for each line
    const inlineParts = parseInline(line);
    result.push(...inlineParts);

    // Add <br> after each line except the last
    if (i < lines.length - 1) {
      result.push(<br key={`br-${i}`} />);
    }
  });

  return result;
}

interface MarkdownBlock {
  type: "heading" | "paragraph" | "ul" | "ol" | "hr" | "blockquote";
  level?: number;
  content?: string;
  items?: string[];
}

// Parse markdown into blocks
function parseBlocks(text: string): MarkdownBlock[] {
  const lines = text.split("\n");
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Horizontal rule: --- or *** or ___
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Heading: ### / ## / #
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
      i++;
      continue;
    }

    // Blockquote: >
    if (line.trim().startsWith(">")) {
      const quoteContent = line.replace(/^>\s*/, "");
      blocks.push({ type: "blockquote", content: quoteContent });
      i++;
      continue;
    }

    // Unordered list: - or *
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list: 1. 2. etc.
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Empty line — skip
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph: consecutive non-empty lines (preserve line breaks within)
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim()) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith(">")
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    if (paragraphLines.length > 0) {
      // Join with \n to preserve line breaks
      blocks.push({ type: "paragraph", content: paragraphLines.join("\n") });
    }
  }

  return blocks;
}

// Render a single block
function renderBlock(block: MarkdownBlock, key: number): ReactNode {
  switch (block.type) {
    case "heading": {
      const sizes: Record<number, string> = {
        1: "text-xl font-bold text-gray-900 mt-4 mb-2 pb-2 border-b border-blue-100",
        2: "text-lg font-bold text-gray-800 mt-3.5 mb-1.5",
        3: "text-base font-semibold text-gray-800 mt-3 mb-1",
      };
      const level = block.level || 3;
      const Tag = `h${level}` as "h1";
      return (
        <Tag key={key} className={sizes[level]}>
          {parseParagraphContent(block.content || "")}
        </Tag>
      );
    }

    case "hr":
      return <hr key={key} className="border-blue-200/60 my-2" />;

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-3 border-blue-300 pl-3 py-1 text-gray-500 italic text-[12px] my-1"
        >
          {parseParagraphContent(block.content || "")}
        </blockquote>
      );

    case "ul":
      return (
        <ul key={key} className="list-none space-y-0.5 my-1 pl-1">
          {block.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[13px]">
              <span className="text-blue-400 mt-px shrink-0">•</span>
              <span>{parseParagraphContent(item)}</span>
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol
          key={key}
          className="list-none space-y-0.5 my-1 pl-1"
        >
          {block.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[13px]">
              <span className="text-blue-500 font-medium mt-px shrink-0 text-[12px]">
                {i + 1}.
              </span>
              <span>{parseParagraphContent(item)}</span>
            </li>
          ))}
        </ol>
      );

    case "paragraph":
    default:
      return (
        <p key={key} className="text-[13px] leading-relaxed my-0.5">
          {parseParagraphContent(block.content || "")}
        </p>
      );
  }
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const blocks = parseBlocks(content);
  return <>{blocks.map((block, i) => renderBlock(block, i))}</>;
}
