#!/usr/bin/env python3
"""
Extract specific pages or page ranges from PDF
Usage: python3 scripts/extract_pdf_pages.py <pdf_file> <page_range> [output_file]
Examples:
  python3 scripts/extract_pdf_pages.py doc.pdf 1-5
  python3 scripts/extract_pdf_pages.py doc.pdf 1,3,5 output.txt
  python3 scripts/extract_pdf_pages.py doc.pdf 10-20 pages_10_20.txt
"""

import pypdf
import sys
import os

def parse_page_range(range_str, max_pages):
    """Parse page range string like '1-5' or '1,3,5' into list of page numbers."""
    pages = []

    for part in range_str.split(','):
        if '-' in part:
            start, end = part.split('-')
            start = int(start.strip())
            end = int(end.strip())
            pages.extend(range(start, end + 1))
        else:
            pages.append(int(part.strip()))

    # Convert to 0-indexed and filter invalid pages
    pages = [p - 1 for p in pages if 1 <= p <= max_pages]
    return sorted(set(pages))

def extract_pages_text(pdf_path, page_range, output_file=None):
    """Extract text from specific pages of PDF."""
    reader = pypdf.PdfReader(pdf_path)
    total_pages = len(reader.pages)

    print(f"PDF: {pdf_path}")
    print(f"Total pages: {total_pages}\n")

    # Parse page range
    pages_to_extract = parse_page_range(page_range, total_pages)

    if not pages_to_extract:
        print("Error: No valid pages in range")
        sys.exit(1)

    print(f"Extracting pages: {', '.join(str(p + 1) for p in pages_to_extract)}\n")
    print("=" * 80)

    output_lines = []

    for page_num in pages_to_extract:
        page = reader.pages[page_num]
        text = page.extract_text()

        # Count words
        words = [w for w in text.split() if len(w) > 1]
        word_count = len(words)

        header = f"\n--- PAGE {page_num + 1} ---"
        content = f"Word Count: {word_count}\n\nContent:\n{text}"

        output_lines.append(header)
        output_lines.append(content)
        output_lines.append("=" * 80)

        print(header)
        print(content)
        print("=" * 80)

    # Save to file if specified
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(output_lines))
        print(f"\n✅ Saved to: {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 scripts/extract_pdf_pages.py <pdf_file> <page_range> [output_file]")
        print("\nExamples:")
        print("  python3 scripts/extract_pdf_pages.py doc.pdf 1-5")
        print("  python3 scripts/extract_pdf_pages.py doc.pdf 1,3,5 output.txt")
        print("  python3 scripts/extract_pdf_pages.py doc.pdf 10-20 pages_10_20.txt")
        sys.exit(1)

    pdf_file = sys.argv[1]
    page_range = sys.argv[2]
    output_file = sys.argv[3] if len(sys.argv) > 3 else None

    if not os.path.exists(pdf_file):
        print(f"Error: PDF file '{pdf_file}' not found")
        sys.exit(1)

    extract_pages_text(pdf_file, page_range, output_file)
