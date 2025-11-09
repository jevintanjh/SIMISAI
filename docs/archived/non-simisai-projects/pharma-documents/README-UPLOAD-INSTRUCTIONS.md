# Pharmaceutical Document Upload Instructions

## ✅ Dependencies Installed

All required libraries are now installed:
- **PyMuPDF 1.26.6** - PDF text extraction and analysis
- **Camelot** - Table extraction from PDFs
- **Pandas 2.3.3** - CSV and data analysis
- **OpenPyXL** - Excel file processing
- **python-docx** - Word document processing
- **OpenCV** - Image processing for scanned documents

## 📦 Uploading ZIP Files

**Yes, you can upload ZIP files!** Here's how:

### Method 1: Direct File Upload (Recommended)
1. In the Replit interface, click the "Files" icon in the left sidebar
2. Navigate to `/home/runner/workspace/pharma-documents/`
3. Click the three-dot menu (⋮) and select "Upload file"
4. Select your ZIP file(s)

### Method 2: Drag and Drop
1. Open the Files pane
2. Navigate to `/home/runner/workspace/pharma-documents/`
3. Drag and drop your ZIP file directly into the folder

## 📂 Directory Structure

Upload your files to:
```
/home/runner/workspace/pharma-documents/
├── [your-submission-name].zip
├── extracted/
│   ├── Module1/
│   ├── Module2/
│   ├── Module3/
│   ├── Module4/
│   └── Module5/
```

## 🔍 What I Can Process

Once uploaded, I can:

### ✅ ZIP Archives
- Extract all contents automatically
- Organize by ACTD module structure
- List all files found

### ✅ PDF Documents
- **Bioequivalence Studies**: Extract PK parameters, 90% CI values
- **CMC Documentation**: Parse drug substance/product specifications
- **Study Reports**: Extract tables, data, and text
- **Certificates**: Read GMP, CPP, and manufacturing licenses

### ✅ CSV/Excel Files
- **Stability Data**: Parse ICH stability study results
- **PK Parameters**: Extract AUC, Cmax, Tmax values
- **Batch Records**: Analyze manufacturing batch data
- **Dissolution Profiles**: Compare test vs. reference product

### ✅ Word Documents (.docx)
- Protocol documents
- Study reports
- Regulatory summaries

## 🚀 Quick Start Commands

After uploading your ZIP file, I can:

### 1. Extract the ZIP
```bash
unzip /home/runner/workspace/pharma-documents/your-file.zip -d /home/runner/workspace/pharma-documents/extracted/
```

### 2. List All Files
```bash
find /home/runner/workspace/pharma-documents/extracted/ -type f
```

### 3. Analyze BE Study
```python
python3 /home/runner/workspace/scripts/be_validator.py --file "extracted/Module5/BE_Study.pdf"
```

### 4. Check ACTD Completeness
```python
python3 /home/runner/workspace/scripts/actd_checker.py --submission-folder "extracted/"
```

## 📋 What to Include in Your ZIP

For optimal analysis, your ZIP should contain:

### Module 1 - Administrative
- Certificate of Pharmaceutical Product (CPP)
- GMP certificates (all manufacturing sites)
- Manufacturing licenses
- Letter of Access for API DMF

### Module 2 - Summaries
- Quality Overall Summary (QOS)
- Clinical/Nonclinical Overviews

### Module 3 - Quality (CMC)
**Drug Substance (S):**
- S.1: General Information
- S.2: Manufacture
- S.3: Characterization
- S.4: Control of Drug Substance
- S.5: Reference Standards
- S.6: Container Closure System
- S.7: Stability

**Drug Product (P):**
- P.1: Description and Composition
- P.2: Pharmaceutical Development (with comparative dissolution)
- P.3: Manufacture
- P.4: Control of Excipients
- P.5: Control of Drug Product
- P.6: Reference Standards
- P.7: Container Closure System
- P.8: Stability

### Module 4 - Nonclinical
- Justification for generic status (if applicable)

### Module 5 - Clinical
- **Bioequivalence Study Report** (CRITICAL)
- Study protocol and amendments
- Ethical approvals
- Bioanalytical method validation
- Individual subject PK data
- Statistical analysis report

## 🔒 Security & Privacy

- Your documents are stored in `/home/runner/workspace/pharma-documents/`
- Files are only accessible within this workspace
- No data is shared externally
- Sensitive information is handled confidentially

## 📊 Analysis Capabilities

Once uploaded, I can:

1. **Gap Analysis**
   - Identify missing ACTD modules
   - Check completeness of each section
   - Prioritize gaps (CRITICAL/HIGH/MEDIUM/LOW)

2. **Bioequivalence Validation**
   - Extract 90% CI values for AUC and Cmax
   - Verify against 80.00-125.00% acceptance criteria
   - Check study design compliance

3. **CMC Review**
   - Verify S1-S7 and P1-P8 presence
   - Check comparative dissolution data
   - Validate stability study design

4. **Data Extraction**
   - Extract PK parameters from BE study tables
   - Parse stability data from CSV/Excel
   - Compile batch analysis results

5. **Compliance Reporting**
   - Generate gap analysis report
   - Module-by-module status
   - Recommendations with timeline impact

## 🎯 Example Upload Scenarios

### Scenario 1: Complete ACTD Submission
**Upload**: `ACTD_Atorvastatin_Generic_20MB.zip`

I will:
1. Extract all files
2. Identify module structure
3. Check completeness
4. Validate BE study
5. Generate compliance report

### Scenario 2: BE Study Only
**Upload**: `BE_Study_Atorvastatin.pdf` (not zipped)

I will:
1. Extract PK parameters
2. Validate 90% CI
3. Check study design
4. Report compliance status

### Scenario 3: Stability Data
**Upload**: `Stability_Data_ICH.csv`

I will:
1. Parse stability results
2. Check ICH condition compliance
3. Validate time points
4. Assess data completeness

## ⚠️ File Size Considerations

- **Recommended**: Keep individual files under 50 MB
- **Large submissions**: Split into multiple ZIPs by module
- **Very large PDFs**: May need to process page-by-page

## 🛠️ Troubleshooting

### "File too large"
- Split ZIP into smaller parts (by module)
- Compress PDFs before zipping

### "Cannot extract"
- Ensure ZIP is not password-protected
- Use standard ZIP format (not RAR, 7z, etc.)

### "PDF parsing failed"
- Check if PDF is scanned (may need OCR)
- Ensure PDF is not password-protected
- Try uploading individual pages

## 📞 Need Help?

Just say:
- "Extract my uploaded ZIP file"
- "Analyze the BE study in Module 5"
- "Check ACTD completeness"
- "Find gaps in my submission"
- "Validate the 90% CI values"

---

**Status**: ✅ Ready to receive your pharmaceutical documents!

**Directory**: `/home/runner/workspace/pharma-documents/`

**Next Step**: Upload your ZIP file(s) and let me know when ready!
