# HSA Generic Drug Compliance Agent - Quick Start Guide

**Get started with pharmaceutical document review in 30 minutes**

---

## What This Agent Does

Reviews pharmaceutical generic drug submissions for Singapore HSA compliance:
- **ACTD format**: Modules 1-5 for generic therapeutic drugs
- **Bioequivalence studies**: Validates 90% CI within 80.00-125.00%
- **CMC documentation**: Chemistry, Manufacturing, Controls (Module 3)
- **Gap analysis**: Identifies missing docs before HSA submission

**NOT for medical devices** - This is for pharmaceutical drug products like tablets, capsules, and injections.

---

## 30-Minute Setup

### Step 1: Create Directory Structure (5 min)

```bash
cd /home/runner/workspace
mkdir -p compliance_agent/pharma/{document_processing,knowledge_base,agent,vector_store}
mkdir -p compliance_agent/pharma/data/{hsa_guidance,test_submissions}
mkdir -p compliance_agent/pharma/output
```

### Step 2: Install Dependencies (10 min)

```bash
# Use existing venv or create new one
cd /home/runner/workspace
source venv/bin/activate

# Install pharmaceutical document processing tools
pip install PyMuPDF pdfplumber camelot-py[cv] pandas openpyxl
pip install anthropic  # If not already installed

# Verify installations
python -c "import fitz, pdfplumber, camelot, pandas; print('✅ All dependencies installed')"
```

### Step 3: Create Basic Document Parser (10 min)

```python
# File: compliance_agent/pharma/document_processing/be_parser.py

import PyMuPDF as fitz
import camelot
import re

class BioequivalenceStudyParser:
    """Parse bioequivalence study reports."""

    def parse_be_report(self, pdf_path):
        """Extract BE study data from PDF."""

        # Extract text
        doc = fitz.open(pdf_path)
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        doc.close()

        # Extract confidence intervals
        auc_ci = self.extract_auc_ci(full_text)
        cmax_ci = self.extract_cmax_ci(full_text)

        # Extract tables (PK parameters)
        tables = camelot.read_pdf(pdf_path, pages='all', flavor='lattice')
        pk_tables = []
        for table in tables:
            df = table.df
            # Check if table has PK parameters
            if any(col.lower().contains('auc') or col.lower().contains('cmax')
                   for col in df.columns.astype(str)):
                pk_tables.append(df)

        return {
            'auc_90ci': auc_ci,
            'cmax_90ci': cmax_ci,
            'pk_tables': pk_tables,
            'full_text': full_text
        }

    def extract_auc_ci(self, text):
        """Extract 90% CI for AUC."""
        # Look for patterns like "90% CI: 85.23 - 112.45"
        pattern = r'AUC.*?90%.*?CI.*?(\d+\.\d+)\s*[-–]\s*(\d+\.\d+)'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return {
                'lower': float(match.group(1)),
                'upper': float(match.group(2))
            }
        return None

    def extract_cmax_ci(self, text):
        """Extract 90% CI for Cmax."""
        pattern = r'Cmax.*?90%.*?CI.*?(\d+\.\d+)\s*[-–]\s*(\d+\.\d+)'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return {
                'lower': float(match.group(1)),
                'upper': float(match.group(2))
            }
        return None

# Quick test
if __name__ == "__main__":
    parser = BioequivalenceStudyParser()
    # Test with your BE study PDF
    # result = parser.parse_be_report("path/to/be_study.pdf")
    # print(result)
    print("✅ BE parser ready")
```

Save this file and test:
```bash
cd /home/runner/workspace/compliance_agent/pharma
python document_processing/be_parser.py
```

### Step 4: Create Validation Logic (5 min)

```python
# File: compliance_agent/pharma/agent/be_validator.py

class BEValidator:
    """Validate bioequivalence study results."""

    ACCEPTANCE_LOWER = 80.00
    ACCEPTANCE_UPPER = 125.00

    def validate_confidence_intervals(self, auc_ci, cmax_ci):
        """Check if CIs meet HSA acceptance criteria."""

        issues = []

        # Validate AUC
        if auc_ci:
            if auc_ci['lower'] < self.ACCEPTANCE_LOWER:
                issues.append({
                    'parameter': 'AUC',
                    'type': 'CRITICAL',
                    'issue': f"Lower CI ({auc_ci['lower']:.2f}) below {self.ACCEPTANCE_LOWER}",
                    'status': 'FAIL',
                    'remediation': 'Bioequivalence NOT demonstrated. Study must be repeated.'
                })
            if auc_ci['upper'] > self.ACCEPTANCE_UPPER:
                issues.append({
                    'parameter': 'AUC',
                    'type': 'CRITICAL',
                    'issue': f"Upper CI ({auc_ci['upper']:.2f}) above {self.ACCEPTANCE_UPPER}",
                    'status': 'FAIL',
                    'remediation': 'Bioequivalence NOT demonstrated. Study must be repeated.'
                })
            if not issues and len([i for i in issues if i['parameter'] == 'AUC']) == 0:
                issues.append({
                    'parameter': 'AUC',
                    'type': 'INFO',
                    'issue': f"90% CI ({auc_ci['lower']:.2f} - {auc_ci['upper']:.2f}) within acceptance range",
                    'status': 'PASS'
                })

        # Validate Cmax (same logic)
        if cmax_ci:
            if cmax_ci['lower'] < self.ACCEPTANCE_LOWER:
                issues.append({
                    'parameter': 'Cmax',
                    'type': 'CRITICAL',
                    'issue': f"Lower CI ({cmax_ci['lower']:.2f}) below {self.ACCEPTANCE_LOWER}",
                    'status': 'FAIL',
                    'remediation': 'Bioequivalence NOT demonstrated. Study must be repeated.'
                })
            if cmax_ci['upper'] > self.ACCEPTANCE_UPPER:
                issues.append({
                    'parameter': 'Cmax',
                    'type': 'CRITICAL',
                    'issue': f"Upper CI ({cmax_ci['upper']:.2f}) above {self.ACCEPTANCE_UPPER}",
                    'status': 'FAIL',
                    'remediation': 'Bioequivalence NOT demonstrated. Study must be repeated.'
                })
            if not [i for i in issues if i['parameter'] == 'Cmax']:
                issues.append({
                    'parameter': 'Cmax',
                    'type': 'INFO',
                    'issue': f"90% CI ({cmax_ci['lower']:.2f} - {cmax_ci['upper']:.2f}) within acceptance range",
                    'status': 'PASS'
                })

        return {
            'bioequivalent': all(i['status'] != 'FAIL' for i in issues),
            'issues': issues
        }

# Test
if __name__ == "__main__":
    validator = BEValidator()

    # Test passing case
    result_pass = validator.validate_confidence_intervals(
        auc_ci={'lower': 85.23, 'upper': 112.45},
        cmax_ci={'lower': 88.12, 'upper': 108.67}
    )
    print("Pass case:", result_pass['bioequivalent'])

    # Test failing case
    result_fail = validator.validate_confidence_intervals(
        auc_ci={'lower': 78.50, 'upper': 127.83},
        cmax_ci={'lower': 82.15, 'upper': 119.42}
    )
    print("Fail case:", result_fail['bioequivalent'])
    for issue in result_fail['issues']:
        if issue['status'] == 'FAIL':
            print(f"  - {issue['issue']}")

    print("✅ BE validator ready")
```

---

## Usage from Claude Code

### Invoke the Agent

In Claude Code chat:
```
User: "I need to review a bioequivalence study for generic metformin.
The BE report shows AUC 90% CI of 83.5-118.2 and Cmax 90% CI of 86.3-115.7.
Does this meet HSA requirements?"

Claude Code: *Invokes hsa-generic-drug-specialist agent*

Agent: "I'll analyze your bioequivalence study results for generic metformin.

**Bioequivalence Analysis Results:**

✅ **AUC 90% Confidence Interval: 83.5% - 118.2%**
- Lower limit: 83.5% (PASS - above 80.00%)
- Upper limit: 118.2% (PASS - below 125.00%)
- Status: WITHIN ACCEPTANCE RANGE

✅ **Cmax 90% Confidence Interval: 86.3% - 115.7%**
- Lower limit: 86.3% (PASS - above 80.00%)
- Upper limit: 115.7% (PASS - below 125.00%)
- Status: WITHIN ACCEPTANCE RANGE

**Conclusion: BIOEQUIVALENCE DEMONSTRATED** ✅

Your generic metformin meets HSA bioequivalence acceptance criteria
(80.00-125.00% for both AUC and Cmax 90% confidence intervals).

**Next Steps:**
1. Ensure complete BE study report includes:
   - Study protocol and amendments
   - Ethical approval letters (IRB/IEC)
   - Bioanalytical method validation report
   - Individual subject PK data
   - Statistical analysis methodology
2. Verify Singapore Reference Product (SRP) was used
3. Include this BE study as core evidence in ACTD Module 5"
```

---

## Common Use Cases

### 1. Quick BE Study Check

```bash
cd /home/runner/workspace/compliance_agent/pharma

# Create simple script
cat > check_be.py << 'EOF'
from document_processing.be_parser import BioequivalenceStudyParser
from agent.be_validator import BEValidator

# Parse BE study
parser = BioequivalenceStudyParser()
be_data = parser.parse_be_report("data/test_submissions/metformin_be_study.pdf")

# Validate
validator = BEValidator()
result = validator.validate_confidence_intervals(
    be_data['auc_90ci'],
    be_data['cmax_90ci']
)

print("\n=== BIOEQUIVALENCE VALIDATION RESULTS ===\n")
print(f"Bioequivalent: {'YES ✅' if result['bioequivalent'] else 'NO ❌'}\n")

for issue in result['issues']:
    status_icon = '✅' if issue['status'] == 'PASS' else '❌'
    print(f"{status_icon} {issue['parameter']}: {issue['issue']}")
    if issue.get('remediation'):
        print(f"   Remediation: {issue['remediation']}")
EOF

python check_be.py
```

### 2. ACTD Completeness Check

```python
# File: compliance_agent/pharma/agent/actd_checker.py

class ACTDCompletenessChecker:
    """Check if ACTD submission has all required modules."""

    REQUIRED_MODULES = {
        'module_1': [
            'application_form.pdf',
            'cpp_certificate.pdf',
            'gmp_certificates/',
            'reference_product_info.pdf'
        ],
        'module_2': [
            'quality_overall_summary.pdf',
            'clinical_overview.pdf',
            'clinical_summary.pdf'
        ],
        'module_3': [
            'drug_substance_s1_s7.pdf',
            'drug_product_p1_p8.pdf',
            'comparative_dissolution.pdf'
        ],
        'module_5': [
            'bioequivalence_study_report.pdf'
        ]
    }

    def check_submission(self, submission_path):
        """Check if all required files present."""
        import os

        missing = []
        present = []

        for module, files in self.REQUIRED_MODULES.items():
            module_path = os.path.join(submission_path, module)
            for file in files:
                file_path = os.path.join(module_path, file)
                if os.path.exists(file_path):
                    present.append(f"{module}/{file}")
                else:
                    missing.append(f"{module}/{file}")

        return {
            'complete': len(missing) == 0,
            'present': present,
            'missing': missing,
            'completeness_percentage': len(present) / (len(present) + len(missing)) * 100
        }

# Usage
checker = ACTDCompletenessChecker()
result = checker.check_submission("/path/to/actd/submission")

print(f"\nCompleteness: {result['completeness_percentage']:.1f}%")
print(f"Missing: {len(result['missing'])} files")
for file in result['missing']:
    print(f"  - {file}")
```

### 3. Module 3 CMC Quick Check

```python
# Quick check for common CMC gaps

cmc_checklist = {
    'P2_comparative_dissolution': 'CRITICAL - Must have dissolution in pH 1.2, 4.5, 6.8',
    'P2_f2_similarity': 'CRITICAL - Must calculate f2 similarity factor',
    'P8_stability_12months': 'HIGH - Need 12-month stability data for registration',
    'S4_impurity_profile': 'HIGH - All impurities >0.1% must be identified',
    'S7_api_stability': 'HIGH - API stability under ICH conditions',
    'P5_batch_analysis': 'MEDIUM - At least 3 batch analyses required'
}

def check_cmc_documents(module_3_path):
    """Check for common CMC documentation gaps."""
    import os

    gaps = []
    for check, description in cmc_checklist.items():
        # Simple file check (enhance with actual document parsing)
        if not any(check.lower() in f.lower() for f in os.listdir(module_3_path)):
            gaps.append({
                'check': check,
                'description': description,
                'status': 'MISSING'
            })

    return gaps
```

---

## Integration with Existing SIMISAI Infrastructure

### Use Existing Database

```sql
-- Create separate schema for pharmaceutical compliance
CREATE SCHEMA IF NOT EXISTS pharma_compliance;

-- Compliance reports for generic drugs
CREATE TABLE pharma_compliance.actd_reports (
    id SERIAL PRIMARY KEY,
    drug_name VARCHAR(255) NOT NULL,
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    reference_product VARCHAR(255),
    report_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    bioequivalent BOOLEAN,
    overall_compliance_pct DECIMAL(5,2),
    critical_gaps INTEGER,
    report_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Bioequivalence study results
CREATE TABLE pharma_compliance.be_studies (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES pharma_compliance.actd_reports(id),
    auc_ci_lower DECIMAL(6,2),
    auc_ci_upper DECIMAL(6,2),
    cmax_ci_lower DECIMAL(6,2),
    cmax_ci_upper DECIMAL(6,2),
    bioequivalent BOOLEAN,
    study_pdf_path TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Add API Endpoints

```typescript
// File: server/pharma-compliance-routes.ts

import { Router } from 'express';
import { db } from '../shared/db';
import { actdReports, beStudies } from '../shared/pharma-schema';

const router = Router();

// Get all pharmaceutical compliance reports
router.get('/api/pharma/reports', async (req, res) => {
  try {
    const reports = await db
      .select()
      .from(actdReports)
      .orderBy(desc(actdReports.reportDate))
      .limit(20);

    res.json(reports);
  } catch (error) {
    console.error('Error fetching pharma reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Analyze new ACTD submission
router.post('/api/pharma/analyze', async (req, res) => {
  try {
    const { submission_path } = req.body;

    // Trigger Python pharmaceutical compliance agent
    const { spawn } = await import('child_process');
    const pythonProcess = spawn('python3', [
      '/home/runner/workspace/compliance_agent/pharma/agent/analyze_actd.py',
      '--submission', submission_path
    ]);

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        res.json({ message: 'Analysis completed', output });
      } else {
        res.status(500).json({ error: 'Analysis failed' });
      }
    });
  } catch (error) {
    console.error('Error analyzing ACTD:', error);
    res.status(500).json({ error: 'Failed to analyze ACTD' });
  }
});

export default router;
```

---

## Next Steps

### Immediate (This Week)
1. ✅ Agent descriptor created (`.claude/agents/hsa-generic-drug-specialist.md`)
2. ✅ Basic BE parser and validator created
3. ⬜ Test with sample BE study PDF
4. ⬜ Enhance parser to extract more data

### Short-Term (Next 2 Weeks)
1. ⬜ Implement CMC document parser
2. ⬜ Create ACTD checklist validator
3. ⬜ Build complete gap analysis logic
4. ⬜ Test with real generic drug submission

### Long-Term (Next Month)
1. ⬜ Integrate with Claude API for advanced reasoning
2. ⬜ Build vector database of HSA guidance documents
3. ⬜ Create pharmaceutical compliance dashboard
4. ⬜ Deploy as production service

---

## Testing Checklist

### Parser Testing
- [ ] BE study PDF text extraction works
- [ ] Table extraction captures PK parameters
- [ ] 90% CI extraction accurate
- [ ] Handles scanned PDFs (OCR)

### Validator Testing
- [ ] Correctly identifies BE pass cases
- [ ] Correctly identifies BE fail cases
- [ ] Handles missing data gracefully
- [ ] Provides clear remediation steps

### Agent Testing
- [ ] Agent responds to pharmaceutical queries
- [ ] Correctly invokes parsing tools
- [ ] Generates accurate compliance reports
- [ ] Differentiates pharma vs. medical device

---

## Troubleshooting

### Parser Issues

**Problem**: Tables not extracted from PDF
```bash
# Try different Camelot flavor
tables = camelot.read_pdf(pdf_path, flavor='stream')  # Instead of 'lattice'

# Or use pdfplumber
import pdfplumber
with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
```

**Problem**: Scanned PDF not readable
```bash
# Install Tesseract OCR
sudo apt-get install tesseract-ocr

# Use pytesseract
from PIL import Image
import pytesseract
text = pytesseract.image_to_string(Image.open('scanned_page.png'))
```

### CI Extraction Issues

**Problem**: 90% CI not found in text
```python
# Try alternative regex patterns
patterns = [
    r'90%.*?CI.*?(\d+\.\d+)\s*[-–]\s*(\d+\.\d+)',
    r'CI.*?90%.*?(\d+\.\d+)\s*[-–]\s*(\d+\.\d+)',
    r'(\d+\.\d+)\s*[-–]\s*(\d+\.\d+).*?90%',
]

for pattern in patterns:
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        return match.groups()
```

---

## Cost Estimate

### Development
- Setup time: 30 minutes (this guide)
- Parser development: 2-3 days
- Validator logic: 1-2 days
- Testing: 1-2 days
- **Total: 4-7 days**

### Per-Review Cost
- Claude API: ~$0.10-0.50 per document
- Processing time: 2-5 minutes per ACTD module
- **Total: <$5 per complete ACTD review**

### ROI
- Traditional consultant: $5,000-15,000 per submission
- Agent cost: ~$10 per review
- **Savings: 99%+**

---

## Resources

### HSA Official
- https://www.hsa.gov.sg/therapeutic-products
- Generic Drug Application Guidance
- ACTD Format Guidelines

### Technical Documentation
- Full research: `/docs/development/hsa-generic-drug-compliance-research.md`
- Agent descriptor: `/.claude/agents/hsa-generic-drug-specialist.md`
- SIMISAI agents registry: `/docs/development/claude-agents-registry.md`

### Support
- Internal: SIMISAI Engineering Team
- Regulatory: Pharmaceutical regulatory affairs consultant
- HSA: https://www.hsa.gov.sg/contact-us

---

**Document Version**: 1.0
**Last Updated**: 2025-12-02
**Status**: Ready for Implementation
**Estimated Setup Time**: 30 minutes
**Project Type**: NEW - Pharmaceutical Generic Drugs
