import React from 'react';

export interface BlogHeading {
    text: string;
    id: string;
    level: number;
}

export interface ContentPart {
    type: 'html' | 'product';
    content?: string;
    product?: any;
}

export function parseBlogContent(htmlContent: string, injectedProducts: any[] = []) {
    if (!htmlContent) return { parts: [], headings: [] };

    const headings: BlogHeading[] = [];
    let headingIndex = 0;

    // 1. Parse headings and inject unique IDs for anchors
    let processedHtml = htmlContent.replace(
        /<h([23])(.*?)>(.*?)<\/h\1>/g,
        (match, level, attrs, text) => {
            const cleanText = text.replace(/<[^>]*>/g, '').trim();
            const id = `heading-${headingIndex++}-${cleanText
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')}`;
            
            headings.push({
                text: cleanText,
                id: id,
                level: parseInt(level)
            });

            // Retain original attributes if any, adding the ID
            if (attrs.includes('id=')) {
                return match; // skip if ID already exists
            }
            return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
        }
    );

    // 2. Split content by product shortcodes
    // Matches: [product id="X"] with optional wrapping paragraph tags
    const regex = /(\s*<p>\s*)?\[product\s+id=["'](\d+)["']\](\s*<\/p>\s*)?/gi;
    const parts: ContentPart[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(processedHtml)) !== null) {
        const index = match.index;
        const productId = parseInt(match[2]);

        // Add the HTML content before the match
        if (index > lastIndex) {
            parts.push({
                type: 'html',
                content: processedHtml.substring(lastIndex, index)
            });
        }

        // Find product detail
        const product = injectedProducts.find((p: any) => p.id === productId);
        if (product) {
            parts.push({
                type: 'product',
                product: product
            });
        } else {
            // Keep the raw shortcode text if no product details are provided
            parts.push({
                type: 'html',
                content: match[0]
            });
        }

        lastIndex = regex.lastIndex;
    }

    // Add trailing HTML content
    if (lastIndex < processedHtml.length) {
        parts.push({
            type: 'html',
            content: processedHtml.substring(lastIndex)
        });
    }

    return { parts, headings };
}
