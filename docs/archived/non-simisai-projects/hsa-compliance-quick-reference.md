# HSA Regulatory Compliance Agent - Quick Reference

**One-page guide for rapid implementation**

---

## What Is This?

An AI-powered regulatory compliance agent that automatically checks SIMISAI platform documentation against Singapore Health Sciences Authority (HSA) requirements for Software as a Medical Device (SaMD) registration.

**Benefits:**
- Automates weeks of manual compliance work into hours
- Identifies documentation gaps before HSA submission
- Provides actionable remediation steps
- Reduces regulatory consultant costs by 30-50%
- Accelerates time to market

---

## Quick Start (30 Minutes)

### 1. Setup Environment (10 min)

```bash
cd /home/runner/workspace
mkdir -p compliance_agent/{ingestion,vector_store,agent,data,output}
python3 -m venv venv
source venv/bin/activate
pip install anthropic llama-index PyMuPDF pdfplumber camelot-py[cv] sentence-transformers pgvector psycopg2-binary
```

### 2. Configure API Keys (5 min)

```bash
cat > compliance_agent/.env << EOF
ANTHROPIC_API_KEY=your-claude-api-key
DATABASE_URL=your-postgresql-connection-string
EOF
```

### 3. Download HSA Documents (10 min)

Visit https://www.hsa.gov.sg/medical-devices and download:
- GN-13: Risk Classification Guide
- SaMD Regulatory Guidelines
- ASEAN CSDT Template

Save to: `/home/runner/workspace/compliance_agent/data/hsa_documents/`

### 4. Run First Analysis (5 min)

```bash
cd /home/runner/workspace/compliance_agent
source ../venv/bin/activate
python tests/test_compliance_agent.py
```

---

## System Architecture (30 Seconds)

```
HSA PDFs + SIMISAI Docs → Vector Database (pgvector)
                          ↓
                    Claude Agent analyzes
                          ↓
               Gap Analysis Report (JSON/PDF)
                          ↓
            React Dashboard in SIMISAI UI
```

**Key Technologies:**
- **LlamaIndex**: Document processing and RAG pipeline
- **Claude 3 Sonnet**: Compliance analysis and reasoning
- **pgvector**: Vector database (uses existing SIMISAI PostgreSQL)
- **Express.js**: Backend API endpoints
- **React**: Compliance dashboard UI

---

## SIMISAI Classification

**Device Type**: Software as a Medical Device (SaMD)
**Intended Use**: AI-powered medical device usage guidance (non-diagnostic)
**Risk Class**: Likely **Class B (Low-Medium Risk)**

**Why Class B?**
- Provides guidance but does NOT diagnose
- Uses AI/ML for device detection and chat
- Does NOT control medical devices directly
- Does NOT make clinical decisions

**Registration Requirements:**
- Clinical Evaluation Report (CER)
- Risk Analysis (ISO 14971)
- Software Validation Report
- Cybersecurity Documentation
- AI Model Validation Report
- QMS Certificate (ISO 13485)

---

## Key HSA Requirements (2025)

### Class B SaMD Documentation

1. **Executive Summary**: Platform overview
2. **Essential Principles Checklist**: Safety compliance
3. **Declaration of Conformity**: Formal compliance statement
4. **Device Description**: Full technical architecture
5. **Design Verification**: CV accuracy, AI chat validation
6. **Clinical Evaluation Report**: User studies, safety evidence
7. **Risk Management**: ISO 14971 compliant analysis
8. **QMS Certificate**: ISO 13485 certification
9. **Software Documentation**: Versioning, V&V reports, cybersecurity
10. **AI Transparency**: Training data, validation, bias testing

### Recent 2025 Updates

- **SaMD/CDSS Guidelines (July 2025)**: Clarified AI-powered vs. rule-based CDSS
- **Change Management Program (Early 2025)**: Streamlined ML model updates
- **In-House AI-SaMD Exemptions (Mid-2025)**: Not applicable to commercial platforms like SIMISAI

---

## Compliance Agent Workflow

### Automated Process

1. **Ingestion**: Load HSA PDFs and SIMISAI markdown docs
2. **Chunking**: Break documents into semantic paragraphs
3. **Embedding**: Convert text to vectors (384-dim sentence-transformers)
4. **Indexing**: Store in pgvector database
5. **Query**: For each HSA requirement, search SIMISAI docs
6. **Analysis**: Claude evaluates compliance status
7. **Report**: Generate gap analysis with remediation steps

### Compliance Status Classification

- **Compliant**: Requirement fully addressed, sufficient evidence
- **Partial**: Partially addressed, minor gaps
- **Non-Compliant**: Not addressed, significant work required

### Priority Levels

- **Critical**: Blocks registration, patient safety
- **High**: Required for Class B, significant risk
- **Medium**: Important but not blocking
- **Low**: Nice-to-have improvements

---

## Cost Breakdown

### MVP (First 2 Months)
- Claude API: $20/month
- PostgreSQL (pgvector): $0 (using existing DB)
- AWS Lambda: $5/month
- **Total: $25/month**

### Production (Ongoing)
- Claude API: $50/month
- Pinecone (optional): $70/month
- AWS Lambda: $10/month
- **Total: $60-130/month**

### ROI
- Regulatory consultant savings: $5,000-10,000/year
- Faster time to market: $20,000-50,000 value
- **ROI: 22x - 300x**

---

## Implementation Timeline

### Week 1: Setup
- Environment setup (2 days)
- HSA document collection (2 days)
- SIMISAI documentation audit (1 day)

### Weeks 2-4: MVP Development
- Document ingestion pipeline (Week 2)
- Vector database setup (Week 3)
- Claude agent implementation (Week 4)

### Weeks 5-6: Integration
- Backend API endpoints (Week 5)
- React compliance dashboard (Week 6)

### Weeks 7-8: Production
- AWS Lambda deployment (Week 7)
- Testing and documentation (Week 8)

**Total Time: 8 weeks**

---

## Critical Gaps to Address

Based on initial analysis, SIMISAI likely has these gaps:

1. **Clinical Evaluation Report (CER)** - CRITICAL
   - Need user studies demonstrating safety improvements
   - Literature review on similar platforms
   - Evidence of reduced user errors

2. **Risk Analysis Report (ISO 14971)** - CRITICAL
   - Identify all potential risks (misidentification, incorrect guidance)
   - Mitigation measures (accuracy thresholds, disclaimers)
   - Risk acceptability criteria

3. **Software Validation Report** - HIGH
   - CV model validation (accuracy, precision, recall)
   - AI chat response validation (safety, appropriateness)
   - Accessibility testing (WCAG 2.2)

4. **Cybersecurity Documentation** - HIGH
   - Data encryption (at rest/transit)
   - Authentication mechanisms
   - Vulnerability management

5. **AI Model Documentation** - HIGH
   - Training data sources (medical device images)
   - Model validation metrics
   - Bias and fairness testing

6. **QMS Certificate** - CRITICAL
   - ISO 13485 certification required
   - Must include software development scope

---

## File Structure

```
/home/runner/workspace/
├── compliance_agent/
│   ├── ingestion/
│   │   └── hsa_document_loader.py       # Load HSA PDFs
│   ├── vector_store/
│   │   └── pgvector_store.py            # Vector DB manager
│   ├── agent/
│   │   └── hsa_compliance_agent.py      # Claude compliance agent
│   ├── data/
│   │   ├── hsa_documents/               # HSA PDFs
│   │   └── simisai_docs/                # SIMISAI docs (symlink to /docs)
│   ├── output/
│   │   └── compliance_reports/          # Generated reports
│   ├── tests/
│   │   ├── test_document_loader.py
│   │   └── test_compliance_agent.py
│   └── requirements.txt
│
├── docs/
│   └── development/
│       ├── hsa-regulatory-compliance-agent.md       # Full guide
│       ├── hsa-compliance-implementation-roadmap.md # Implementation plan
│       └── hsa-compliance-quick-reference.md        # This document
│
├── server/
│   └── compliance-routes.ts             # Backend API endpoints
│
└── src/
    └── components/
        └── pages/
            └── ComplianceDashboard.tsx  # Frontend dashboard
```

---

## Commands Cheat Sheet

### Development

```bash
# Setup
cd /home/runner/workspace
python3 -m venv venv
source venv/bin/activate
pip install -r compliance_agent/requirements.txt

# Load documents
python compliance_agent/vector_store/pgvector_store.py

# Run analysis
python compliance_agent/agent/hsa_compliance_agent.py

# Test components
python compliance_agent/tests/test_document_loader.py
python compliance_agent/tests/test_compliance_agent.py

# Start SIMISAI with compliance dashboard
pnpm run dev:full
# Navigate to: http://localhost:5000/compliance
```

### Database

```bash
# Setup pgvector extension
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Apply compliance tables migration
psql $DATABASE_URL -f compliance_agent/migrations/001_create_compliance_tables.sql

# Check vector count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM document_vectors;"

# Check latest report
psql $DATABASE_URL -c "SELECT * FROM compliance_reports ORDER BY report_date DESC LIMIT 1;"
```

### API

```bash
# Get latest compliance report
curl http://localhost:3001/api/compliance/report/latest

# Trigger new analysis
curl -X POST http://localhost:3001/api/compliance/analyze

# Mark gap as resolved
curl -X PATCH http://localhost:3001/api/compliance/gaps/123/resolve \
  -H "Content-Type: application/json" \
  -d '{"resolved_by": "jevin@simisai.com", "resolution_notes": "CER completed"}'
```

---

## Troubleshooting

### Vector search returns no results
```bash
# Check if documents are indexed
psql $DATABASE_URL -c "SELECT COUNT(*) FROM document_vectors;"

# Re-index if needed
python compliance_agent/vector_store/pgvector_store.py
```

### Claude API rate limits
- Use Sonnet (cheaper) instead of Opus for routine checks
- Batch requirements together
- Implement exponential backoff

### PDF parsing failures
- Check if PDF is scanned (requires OCR with pytesseract)
- Try alternative parser (pdfplumber vs PyMuPDF)
- Manual extraction for critical documents

### Database connection errors
- Verify `DATABASE_URL` in `.env`
- Check pgvector extension: `psql $DATABASE_URL -c "SELECT * FROM pg_extension WHERE extname='vector';"`
- Test connection: `psql $DATABASE_URL -c "SELECT 1;"`

---

## Key Resources

### HSA Official Resources
- **Website**: https://www.hsa.gov.sg/medical-devices
- **Registration Guide**: https://www.hsa.gov.sg/medical-devices/how-to-register
- **GN-13**: Search "GN-13 Risk Classification"
- **SaMD Guidelines**: Search "Software Medical Device Guidelines"

### Technical Documentation
- **LlamaIndex**: https://docs.llamaindex.ai/
- **Claude API**: https://docs.anthropic.com/
- **pgvector**: https://github.com/pgvector/pgvector
- **PyMuPDF**: https://pymupdf.readthedocs.io/

### SIMISAI Documentation
- **System Overview**: `/docs/architecture/system-overview.md`
- **AWS Infrastructure**: `/docs/deployment/aws-infrastructure.md`
- **API Reference**: `/docs/api/endpoints.md`

---

## Monthly Compliance Checklist

- [ ] Check HSA website for updated guidance
- [ ] Download any new documents
- [ ] Re-index documents into vector database
- [ ] Run compliance analysis
- [ ] Review new gaps
- [ ] Update remediation progress
- [ ] Generate monthly report
- [ ] Share with leadership

---

## Success Criteria

### MVP (End of Week 4)
- [ ] All HSA documents indexed
- [ ] Compliance analysis runs successfully
- [ ] Report generated with gap identification
- [ ] Critical gaps identified

### Production (End of Week 8)
- [ ] Compliance dashboard live in SIMISAI
- [ ] API endpoints functional
- [ ] AWS Lambda deployed
- [ ] Monthly workflow automated
- [ ] Compliance % > 80%

### HSA Registration Ready (Month 3-6)
- [ ] All critical gaps resolved
- [ ] All Class B documentation complete
- [ ] Singapore authorized representative appointed
- [ ] CSDT submission package prepared
- [ ] Compliance % > 95%

---

## Contact & Support

**Internal SIMISAI Team:**
- Technical Implementation: Engineering Team
- Regulatory Strategy: Regulatory Affairs Team
- HSA Liaison: Singapore Operations Team

**External Resources:**
- HSA Queries: https://www.hsa.gov.sg/contact-us
- Regulatory Consultants: Consider engaging for critical document review
- ISO Certification Bodies: For ISO 13485 QMS certification

---

**Document Version**: 1.0
**Last Updated**: 2025-12-02
**Purpose**: Quick reference for HSA compliance agent implementation
**Full Documentation**: See `/docs/development/hsa-regulatory-compliance-agent.md`
