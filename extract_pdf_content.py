#!/usr/bin/env python3
"""Extract text content from PDF presentation for analysis."""

import pypdf
import sys
import re

def extract_pdf_text(pdf_path):
    """Extract text from PDF with page-by-page breakdown."""
    reader = pypdf.PdfReader(pdf_path)
    total_pages = len(reader.pages)

    print(f"PDF Analysis: {total_pages} pages total\n")
    print("=" * 80)

    for page_num in range(total_pages):
        page = reader.pages[page_num]
        text = page.extract_text()

        # Count words (excluding very short words like bullet points)
        words = [w for w in text.split() if len(w) > 1]
        word_count = len(words)

        # Estimate text density
        if word_count < 30:
            density = "LOW"
        elif word_count < 70:
            density = "MEDIUM"
        else:
            density = "HIGH"

        print(f"\n--- SLIDE {page_num + 1} ---")
        print(f"Word Count: {word_count}")
        print(f"Text Density: {density}")
        print(f"\nContent:")
        print(text)
        print("\n" + "=" * 80)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 extract_pdf_content.py <pdf_file>")
        sys.exit(1)

    extract_pdf_text(sys.argv[1])
