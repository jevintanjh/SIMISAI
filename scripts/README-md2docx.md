# Markdown to DOCX Converter

Permanent solution for converting markdown files to Microsoft Word .docx format in the SIMISAI project.

## Quick Usage

### Method 1: Using npm script (Recommended)
```bash
# Convert with auto-generated output filename
pnpm md2docx docs/investor/ai-singapore-case-study.md

# Convert with custom output filename
pnpm md2docx docs/investor/ai-singapore-case-study.md output/my-document.docx
```

### Method 2: Direct Python script
```bash
# Convert with auto-generated output filename
python3 scripts/md2docx.py docs/investor/ai-singapore-case-study.md

# Convert with custom output filename
python3 scripts/md2docx.py docs/investor/ai-singapore-case-study.md output/my-document.docx
```

## Features

- **Preserves formatting**: Headers (H1-H6), bold, italic, lists
- **Auto-output naming**: If no output specified, creates `.docx` with same name as input
- **Bullet and numbered lists**: Properly formatted in Word
- **Links**: Converted to plain text (shows link text only)
- **Universal**: Works with any markdown file in the project

## Examples

```bash
# Convert AI Singapore case study
pnpm md2docx docs/investor/ai-singapore-case-study.md

# Convert B2B research report
pnpm md2docx docs/development/SIMISAI-B2B-PARTNERSHIP-RESEARCH.md

# Convert with custom output location
pnpm md2docx docs/investor/pitch-deck.md ~/Desktop/SIMISAI-Pitch.docx
```

## Output Format

- Microsoft Word .docx (compatible with Word 2007+)
- Proper heading hierarchy (H1-H6 → Word Heading 1-6)
- Formatted bullet and numbered lists
- Bold and italic text preserved
- Professional document structure

## Requirements

- Python 3.x (✅ installed)
- python-docx package (✅ installed)

## Location

- Script: `scripts/md2docx.py`
- npm script: `pnpm md2docx`
- Documentation: `scripts/README-md2docx.md`

## Troubleshooting

**Error: "Input file not found"**
- Check the file path is correct
- Use relative paths from project root

**Error: "python-docx not installed"**
```bash
pip install python-docx
```

## Notes

- This is a permanent solution - no need to create temporary scripts
- Archived temporary conversion scripts are in `docs/archived/temp-scripts/`
- For advanced conversion needs (tables, images, complex formatting), consider using pandoc
