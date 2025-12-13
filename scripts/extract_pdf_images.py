#!/usr/bin/env python3
"""
Extract images from PDF files for Claude Code analysis
Usage: python3 scripts/extract_pdf_images.py <pdf_file> [output_dir]
"""

import pypdf
import sys
import os
from pathlib import Path

def extract_images_from_pdf(pdf_path, output_dir="pdf_images"):
    """Extract all images from PDF and save to directory."""
    # Create output directory if it doesn't exist
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    reader = pypdf.PdfReader(pdf_path)
    total_pages = len(reader.pages)
    total_images = 0

    print(f"Extracting images from {pdf_path}")
    print(f"Total pages: {total_pages}")
    print(f"Output directory: {output_dir}\n")

    for page_num in range(total_pages):
        page = reader.pages[page_num]

        # Extract images from page
        if '/XObject' in page['/Resources']:
            xObject = page['/Resources']['/XObject'].get_object()

            for obj in xObject:
                if xObject[obj]['/Subtype'] == '/Image':
                    try:
                        size = (xObject[obj]['/Width'], xObject[obj]['/Height'])
                        data = xObject[obj].get_data()

                        # Determine image format
                        if xObject[obj]['/ColorSpace'] == '/DeviceRGB':
                            mode = "RGB"
                        else:
                            mode = "P"

                        # Save image
                        image_name = f"page{page_num + 1}_{obj[1:]}.png"
                        image_path = os.path.join(output_dir, image_name)

                        # Try to save using PIL if available
                        try:
                            from PIL import Image
                            img = Image.frombytes(mode, size, data)
                            img.save(image_path)
                            total_images += 1
                            print(f"✅ Extracted: {image_name} ({size[0]}x{size[1]})")
                        except ImportError:
                            # Save as raw data if PIL not available
                            with open(image_path + ".raw", 'wb') as img_file:
                                img_file.write(data)
                            total_images += 1
                            print(f"✅ Extracted (raw): {image_name}.raw ({size[0]}x{size[1]})")
                    except Exception as e:
                        print(f"⚠️  Error extracting image from page {page_num + 1}: {e}")

    print(f"\n✅ Extraction complete: {total_images} images saved to {output_dir}/")
    return total_images

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/extract_pdf_images.py <pdf_file> [output_dir]")
        print("Example: python3 scripts/extract_pdf_images.py docs/investor/presentation.pdf")
        sys.exit(1)

    pdf_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "pdf_images"

    if not os.path.exists(pdf_file):
        print(f"Error: PDF file '{pdf_file}' not found")
        sys.exit(1)

    extract_images_from_pdf(pdf_file, output_dir)
