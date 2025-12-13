# PDF Utilities for SIMISAI

Permanent utilities to extract text and images from PDF files, allowing Claude Code to indirectly read PDF content.

## Why These Utilities?

Claude Code cannot directly read PDF files, but it can read text and images. These utilities extract PDF content into formats Claude Code can analyze:
- Text extraction for content analysis
- Image extraction for visual analysis
- Page-specific extraction for focused analysis

---

## Available Utilities

### 1. Extract All PDF Content (`extract_pdf_content.py`)

Extracts all text from PDF with page-by-page breakdown and analysis.

**Usage:**
```bash
python3 scripts/extract_pdf_content.py <pdf_file>
```

**Examples:**
```bash
# Extract all content from presentation
python3 scripts/extract_pdf_content.py docs/investor/SIMIS-presentation.pdf

# Output includes:
# - Page numbers
# - Word counts per page
# - Text density (LOW/MEDIUM/HIGH)
# - Full text content
```

**Output:** Prints to console with page breaks and metadata

---

### 2. Extract PDF Images (`extract_pdf_images.py`)

Extracts all images from PDF and saves them to a directory for Claude Code to analyze.

**Usage:**
```bash
python3 scripts/extract_pdf_images.py <pdf_file> [output_dir]
```

**Examples:**
```bash
# Extract images to default directory (pdf_images/)
python3 scripts/extract_pdf_images.py docs/investor/pitch-deck.pdf

# Extract images to custom directory
python3 scripts/extract_pdf_images.py docs/investor/pitch-deck.pdf investor_images/

# Output: PNG files named page1_img1.png, page2_img1.png, etc.
```

**Output:** Image files saved to directory, can be read by Claude Code

---

### 3. Extract Specific Pages (`extract_pdf_pages.py`)

Extracts text from specific pages or page ranges.

**Usage:**
```bash
python3 scripts/extract_pdf_pages.py <pdf_file> <page_range> [output_file]
```

**Page Range Formats:**
- Single pages: `1,3,5`
- Page ranges: `1-5` or `10-20`
- Combined: `1,3,5-10,15`

**Examples:**
```bash
# Extract pages 1-5 to console
python3 scripts/extract_pdf_pages.py doc.pdf 1-5

# Extract specific pages and save to file
python3 scripts/extract_pdf_pages.py doc.pdf 1,3,5 output.txt

# Extract page range and save
python3 scripts/extract_pdf_pages.py doc.pdf 41-60 s42_pages_41_60.txt
```

**Output:** Text to console and/or file

---

## Common Workflows

### Analyze Entire PDF
```bash
# Step 1: Extract all text
python3 scripts/extract_pdf_content.py presentation.pdf > presentation_text.txt

# Step 2: Claude Code reads the text file
# Now you can ask Claude to analyze the content
```

### Analyze Specific Sections
```bash
# Extract only slides 5-10
python3 scripts/extract_pdf_pages.py pitch-deck.pdf 5-10 slides_5_10.txt

# Claude Code analyzes slides_5_10.txt
```

### Analyze PDF Images
```bash
# Extract images
python3 scripts/extract_pdf_images.py presentation.pdf pres_images/

# Claude Code uses Read tool to view each image
# Can analyze charts, diagrams, screenshots, etc.
```

### Complex Analysis
```bash
# 1. Extract all text
python3 scripts/extract_pdf_content.py doc.pdf > full_text.txt

# 2. Extract images
python3 scripts/extract_pdf_images.py doc.pdf doc_images/

# 3. Claude Code analyzes both text and images for comprehensive review
```

---

## Requirements

**Python Packages:**
```bash
pip install pypdf
pip install Pillow  # Optional, for better image extraction
```

**Already Installed:**
- ✅ pypdf (for PDF reading)
- ✅ Pillow (for image processing)

---

## Tips for Using with Claude Code

### For Text Analysis
```bash
# Extract and save to file
python3 scripts/extract_pdf_content.py doc.pdf > doc_analysis.txt

# Ask Claude Code:
# "Can you read doc_analysis.txt and summarize the key points?"
```

### For Image Analysis
```bash
# Extract images
python3 scripts/extract_pdf_images.py presentation.pdf pres_images/

# Ask Claude Code:
# "Can you read the images in pres_images/ and describe the charts?"
```

### For Focused Analysis
```bash
# Extract specific section
python3 scripts/extract_pdf_pages.py report.pdf 10-20 section2.txt

# Ask Claude Code:
# "Review section2.txt and provide feedback on the technical approach"
```

---

## Troubleshooting

**Error: "pypdf not found"**
```bash
pip install pypdf
```

**Error: "PDF file not found"**
- Check file path is correct
- Use relative paths from project root

**Images not extracting properly**
```bash
# Install Pillow for better image support
pip install Pillow
```

**Large PDFs taking too long**
```bash
# Extract specific pages instead of full PDF
python3 scripts/extract_pdf_pages.py large.pdf 1-10
```

---

## Integration with SIMISAI Workflow

### Investor Pitch Reviews
```bash
# Extract pitch deck
python3 scripts/extract_pdf_content.py docs/investor/pitch-deck.pdf > pitch_text.txt
python3 scripts/extract_pdf_images.py docs/investor/pitch-deck.pdf pitch_images/

# Claude Code reviews content and suggests improvements
```

### Research Document Analysis
```bash
# Extract research paper
python3 scripts/extract_pdf_pages.py pharma-documents/research.pdf 1-50 research_text.txt

# Claude Code extracts key findings
```

### Compliance Document Review
```bash
# Extract regulatory docs
python3 scripts/extract_pdf_content.py compliance_report.pdf > compliance.txt

# Claude Code checks against requirements
```

---

## File Locations

- **Scripts:** `scripts/extract_pdf_*.py`
- **Documentation:** `scripts/README-pdf-utils.md`
- **Output:** User-specified directories (default: `pdf_images/`)

---

## Notes

- These are **permanent utilities** - no need to recreate for each PDF
- **Not temporary scripts** - they're part of the SIMISAI toolkit
- Optimized for Claude Code workflow (text + image extraction)
- Safe to commit to repository
- Used for investor materials, research docs, compliance reviews

---

**Last Updated:** December 13, 2025
**Maintained By:** SIMISAI Development Team
