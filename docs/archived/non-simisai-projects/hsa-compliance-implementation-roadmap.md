# HSA Compliance Agent Implementation Roadmap

## Quick Start Guide

This document provides a step-by-step implementation plan for building the HSA regulatory compliance agent for SIMISAI, with timelines, priorities, and actionable tasks.

---

## Phase 0: Preparation (Week 1)

### Day 1-2: Environment Setup

**Tasks:**
- [ ] Create Python virtual environment for compliance agent
- [ ] Install required dependencies
- [ ] Configure API keys (Anthropic Claude, Pinecone)
- [ ] Setup project structure

**Commands:**
```bash
# Navigate to SIMISAI workspace
cd /home/runner/workspace

# Create compliance agent directory
mkdir -p compliance_agent/{ingestion,vector_store,agent,data,output}
mkdir -p compliance_agent/data/{hsa_documents,simisai_docs}

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Create requirements.txt
cat > compliance_agent/requirements.txt << 'EOF'
# AI/LLM
anthropic>=0.18.0
llama-index>=0.9.0

# Document Processing
PyMuPDF>=1.23.0
pdfplumber>=0.10.0
camelot-py[cv]>=0.11.0
pytesseract>=0.3.10
python-docx>=1.0.0

# Vector Database
pinecone-client>=3.0.0
chromadb>=0.4.0

# Utilities
pandas>=2.0.0
numpy>=1.24.0
sentence-transformers>=2.2.0
tqdm>=4.66.0
python-dotenv>=1.0.0
EOF

# Install dependencies
pip install -r compliance_agent/requirements.txt

# Create environment variables file
cat > compliance_agent/.env << 'EOF'
# API Keys
ANTHROPIC_API_KEY=your-claude-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-west1-gcp

# Database
DATABASE_URL=your-postgresql-connection-string

# Paths
HSA_DOCS_PATH=/home/runner/workspace/compliance_agent/data/hsa_documents
SIMISAI_DOCS_PATH=/home/runner/workspace/docs
OUTPUT_PATH=/home/runner/workspace/compliance_agent/output
EOF

echo "Environment setup complete!"
```

**Deliverables:**
- Python environment configured
- Dependencies installed
- Project structure created
- API keys configured

---

### Day 3-4: HSA Document Collection

**Tasks:**
- [ ] Download HSA guidance documents
- [ ] Organize documents by type
- [ ] Create document inventory spreadsheet
- [ ] Verify document completeness

**HSA Documents to Download:**

1. **Core Regulatory Guidance:**
   - GN-13: Guidance on Risk Classification of General Medical Devices
   - Regulatory Guidelines for Software Medical Devices (Life Cycle Approach)
   - Updated SaMD and CDSS Guidelines (July 2025)
   - Medical Device Registration Guidance

2. **Templates and Forms:**
   - ASEAN Common Submission Dossier Template (CSDT)
   - Class B Registration Checklist
   - Declaration of Conformity Template

3. **Standards References:**
   - ISO 14971 (Risk Management) - summary guidance
   - ISO 13485 (QMS) - summary guidance
   - IEC 62304 (Medical Device Software) - summary guidance

**Document Inventory Template:**
```csv
document_name,document_id,version,date_downloaded,file_path,status
GN-13 Risk Classification,GN-13,v3.0,2025-12-02,/data/hsa_documents/GN-13-v3.0.pdf,downloaded
SaMD Regulatory Guidelines,SaMD-REG,v2.0,2025-12-02,/data/hsa_documents/SaMD-Guidelines-v2.0.pdf,downloaded
ASEAN CSDT Template,CSDT,v1.5,2025-12-02,/data/hsa_documents/ASEAN-CSDT-v1.5.pdf,downloaded
```

**Where to Find HSA Documents:**
- HSA Official Website: https://www.hsa.gov.sg/medical-devices
- Medical Device Guidance Documents section
- Contact HSA directly if documents are not publicly available

**Deliverables:**
- All required HSA documents downloaded
- Document inventory spreadsheet created
- Documents organized in `/compliance_agent/data/hsa_documents/`

---

### Day 5: SIMISAI Documentation Audit

**Tasks:**
- [ ] Audit existing SIMISAI documentation
- [ ] Identify documentation gaps
- [ ] Prioritize documentation creation
- [ ] Create documentation improvement plan

**SIMISAI Documentation Audit Checklist:**

**Existing Documentation:**
- [x] System Overview (`/docs/architecture/system-overview.md`)
- [x] AWS Infrastructure (`/docs/deployment/aws-infrastructure.md`)
- [x] API Reference (`/docs/api/endpoints.md`)
- [x] Database Schema (`shared/schema.ts`)
- [x] Frontend Architecture (`/docs/architecture/frontend.md`)
- [x] Backend Architecture (`/docs/architecture/backend.md`)

**Missing Documentation (Critical for HSA):**
- [ ] Clinical Evaluation Report (CER)
- [ ] Risk Analysis/Management Report (ISO 14971)
- [ ] Software Validation Report
- [ ] Cybersecurity Documentation
- [ ] AI Model Training and Validation Report
- [ ] Quality Management System (QMS) Documentation
- [ ] Instructions for Use (IFU)
- [ ] Declaration of Conformity

**Audit Script:**
```bash
#!/bin/bash
# File: compliance_agent/scripts/audit_simisai_docs.sh

echo "SIMISAI Documentation Audit Report"
echo "==================================="
echo ""

# Count existing documentation
echo "Existing Documentation:"
find /home/runner/workspace/docs -name "*.md" | wc -l | xargs echo "- Markdown files:"
find /home/runner/workspace/docs -type f | wc -l | xargs echo "- Total files:"

echo ""
echo "Documentation by Category:"
for dir in /home/runner/workspace/docs/*/; do
    dirname=$(basename "$dir")
    count=$(find "$dir" -name "*.md" 2>/dev/null | wc -l)
    echo "- $dirname: $count files"
done

echo ""
echo "Missing Critical Documents for HSA:"
echo "- [ ] Clinical Evaluation Report (CER)"
echo "- [ ] Risk Analysis Report (ISO 14971)"
echo "- [ ] Software Validation Report"
echo "- [ ] Cybersecurity Documentation"
echo "- [ ] AI Model Validation Report"
echo "- [ ] QMS Documentation"
echo "- [ ] Instructions for Use (IFU)"
echo "- [ ] Declaration of Conformity"
```

**Deliverables:**
- Documentation audit report
- Gap identification list
- Prioritized documentation creation plan

---

## Phase 1: MVP Implementation (Weeks 2-4)

### Week 2: Document Ingestion Pipeline

**Goal:** Build system to load and process HSA and SIMISAI documents

**Tasks:**
- [ ] Implement HSA document loader
- [ ] Implement SIMISAI document loader
- [ ] Test PDF parsing and table extraction
- [ ] Validate document chunking

**Implementation:**
1. Copy code from main guide document (Section 3.2, Phase 1)
2. Create `compliance_agent/ingestion/hsa_document_loader.py`
3. Test with sample HSA PDF
4. Verify output quality

**Testing Script:**
```python
# File: compliance_agent/tests/test_document_loader.py

from ingestion.hsa_document_loader import HSADocumentLoader, SIMISAIDocumentLoader

def test_hsa_loader():
    loader = HSADocumentLoader("/home/runner/workspace/compliance_agent/data/hsa_documents")

    # Test with GN-13 document
    chunks = loader.load_hsa_guidance("GN-13-v3.0.pdf")

    print(f"Loaded {len(chunks)} chunks from GN-13")
    print("\nSample chunk:")
    print(f"Source: {chunks[0].source}")
    print(f"Regulation: {chunks[0].regulation}")
    print(f"Article: {chunks[0].article}")
    print(f"Text preview: {chunks[0].text[:200]}...")

    assert len(chunks) > 0, "Should load at least one chunk"
    assert chunks[0].regulation == "GN-13", "Should identify regulation correctly"

    print("\n✓ HSA loader test passed")

def test_simisai_loader():
    loader = SIMISAIDocumentLoader("/home/runner/workspace/docs")

    # Test with SIMISAI docs
    chunks = loader.load_simisai_docs()

    print(f"\nLoaded {len(chunks)} chunks from SIMISAI docs")
    print("\nSample chunk:")
    print(f"Source: {chunks[0].source}")
    print(f"Article: {chunks[0].article}")
    print(f"Category: {chunks[0].metadata['category']}")
    print(f"Text preview: {chunks[0].text[:200]}...")

    assert len(chunks) > 0, "Should load at least one chunk"

    print("\n✓ SIMISAI loader test passed")

if __name__ == "__main__":
    test_hsa_loader()
    test_simisai_loader()
    print("\n✅ All document loader tests passed!")
```

**Run Tests:**
```bash
cd /home/runner/workspace/compliance_agent
source ../venv/bin/activate
python tests/test_document_loader.py
```

**Success Criteria:**
- Successfully parse HSA PDFs
- Extract text and tables
- Generate semantic chunks
- Load SIMISAI markdown docs
- Tests pass

---

### Week 3: Vector Database Setup

**Goal:** Create searchable vector database of all regulatory and internal documents

**Tasks:**
- [ ] Setup vector database (Pinecone or pgvector)
- [ ] Implement embedding generation
- [ ] Index all documents
- [ ] Test semantic search

**Vector Database Decision:**

**Option A: Pinecone (Recommended for MVP)**
- Pros: Fast setup, managed service, excellent performance
- Cons: Monthly cost ($70), external dependency
- Use when: Need quick MVP, have budget

**Option B: pgvector (Recommended for Production)**
- Pros: Free, uses existing SIMISAI PostgreSQL, data locality
- Cons: Setup complexity, slower than Pinecone
- Use when: Cost-sensitive, want full control

**pgvector Setup (Free Option):**
```bash
# Install pgvector extension on SIMISAI PostgreSQL database
# This requires database admin access

# Connect to your Neon Database
psql $DATABASE_URL

# Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

# Create vectors table
CREATE TABLE IF NOT EXISTS document_vectors (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(255) NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding vector(384),  -- dimension for sentence-transformers/all-MiniLM-L6-v2
    text_content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_id, chunk_index)
);

-- Create index for fast similarity search
CREATE INDEX ON document_vectors USING ivfflat (embedding vector_cosine_ops);

-- Test query
SELECT COUNT(*) FROM document_vectors;
```

**Pinecone Setup (Paid Option):**
```python
# File: compliance_agent/vector_store/setup_pinecone.py

import pinecone
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Pinecone
pinecone.init(
    api_key=os.environ.get("PINECONE_API_KEY"),
    environment=os.environ.get("PINECONE_ENVIRONMENT", "us-west1-gcp")
)

# Create index
index_name = "hsa-compliance"

if index_name not in pinecone.list_indexes():
    pinecone.create_index(
        name=index_name,
        dimension=384,  # sentence-transformers/all-MiniLM-L6-v2
        metric="cosine",
        pods=1,
        pod_type="p1.x1"  # Starter tier
    )
    print(f"✓ Created Pinecone index: {index_name}")
else:
    print(f"✓ Pinecone index already exists: {index_name}")

# Get index stats
index = pinecone.Index(index_name)
stats = index.describe_index_stats()
print(f"Index stats: {stats}")
```

**Implementation (using pgvector):**
```python
# File: compliance_agent/vector_store/pgvector_store.py

import os
import psycopg2
from psycopg2.extras import execute_values
from sentence_transformers import SentenceTransformer
from typing import List, Dict
import numpy as np
from dotenv import load_dotenv

load_dotenv()

class PGVectorStore:
    """PostgreSQL + pgvector implementation for SIMISAI compliance."""

    def __init__(self):
        self.conn = psycopg2.connect(os.environ.get("DATABASE_URL"))
        self.model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

    def index_documents(self, chunks: List):
        """Index document chunks into pgvector."""

        print(f"Indexing {len(chunks)} document chunks...")

        # Generate embeddings in batches
        batch_size = 32
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i+batch_size]
            texts = [chunk.text for chunk in batch]
            embeddings = self.model.encode(texts)

            # Insert into database
            values = []
            for j, chunk in enumerate(batch):
                values.append((
                    chunk.source,
                    j,
                    embeddings[j].tolist(),
                    chunk.text,
                    {
                        'regulation': chunk.regulation,
                        'article': chunk.article,
                        'page_number': chunk.page_number,
                        **chunk.metadata
                    }
                ))

            with self.conn.cursor() as cur:
                execute_values(
                    cur,
                    """
                    INSERT INTO document_vectors
                    (document_id, chunk_index, embedding, text_content, metadata)
                    VALUES %s
                    ON CONFLICT (document_id, chunk_index) DO UPDATE
                    SET embedding = EXCLUDED.embedding,
                        text_content = EXCLUDED.text_content,
                        metadata = EXCLUDED.metadata
                    """,
                    values,
                    template="(%s, %s, %s::vector, %s, %s::jsonb)"
                )

            self.conn.commit()
            print(f"Indexed batch {i//batch_size + 1}/{(len(chunks)-1)//batch_size + 1}")

        print("✓ Indexing complete!")

    def search(self, query: str, top_k: int = 5, filter_metadata: Dict = None) -> List[Dict]:
        """Search for similar documents."""

        # Generate query embedding
        query_embedding = self.model.encode([query])[0]

        # Build SQL query
        sql = """
        SELECT
            text_content,
            metadata,
            1 - (embedding <=> %s::vector) as similarity
        FROM document_vectors
        """

        params = [query_embedding.tolist()]

        # Add metadata filtering if provided
        if filter_metadata:
            conditions = []
            for key, value in filter_metadata.items():
                conditions.append(f"metadata->>'{key}' = %s")
                params.append(value)
            sql += " WHERE " + " AND ".join(conditions)

        sql += " ORDER BY embedding <=> %s::vector LIMIT %s"
        params.extend([query_embedding.tolist(), top_k])

        with self.conn.cursor() as cur:
            cur.execute(sql, params)
            results = cur.fetchall()

        return [
            {
                'text': row[0],
                'metadata': row[1],
                'score': float(row[2])
            }
            for row in results
        ]

    def get_stats(self) -> Dict:
        """Get vector store statistics."""
        with self.conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM document_vectors")
            total_vectors = cur.fetchone()[0]

            cur.execute("""
                SELECT metadata->>'doc_type', COUNT(*)
                FROM document_vectors
                GROUP BY metadata->>'doc_type'
            """)
            by_type = dict(cur.fetchall())

        return {
            'total_vectors': total_vectors,
            'by_doc_type': by_type
        }

    def close(self):
        self.conn.close()

# Test script
if __name__ == "__main__":
    from ingestion.hsa_document_loader import HSADocumentLoader, SIMISAIDocumentLoader

    # Load documents
    hsa_loader = HSADocumentLoader("/home/runner/workspace/compliance_agent/data/hsa_documents")
    simisai_loader = SIMISAIDocumentLoader("/home/runner/workspace/docs")

    all_chunks = []
    # all_chunks.extend(hsa_loader.load_hsa_guidance("GN-13-v3.0.pdf"))
    all_chunks.extend(simisai_loader.load_simisai_docs())

    # Index into pgvector
    store = PGVectorStore()
    store.index_documents(all_chunks)

    # Test search
    results = store.search("What is the SIMISAI architecture?", top_k=3)

    print("\nSearch Results:")
    for i, result in enumerate(results):
        print(f"\n{i+1}. Similarity: {result['score']:.3f}")
        print(f"   Source: {result['metadata'].get('source', 'Unknown')}")
        print(f"   Text: {result['text'][:200]}...")

    # Get stats
    stats = store.get_stats()
    print(f"\nVector Store Stats:")
    print(f"Total vectors: {stats['total_vectors']}")
    print(f"By type: {stats['by_doc_type']}")

    store.close()
```

**Run Indexing:**
```bash
cd /home/runner/workspace/compliance_agent
source ../venv/bin/activate
python vector_store/pgvector_store.py
```

**Success Criteria:**
- Vector database setup complete
- All documents indexed
- Search returns relevant results
- Stats show correct document counts

---

### Week 4: Claude Agent Implementation

**Goal:** Build compliance analysis agent using Claude API

**Tasks:**
- [ ] Implement compliance agent class
- [ ] Create system prompts
- [ ] Test single requirement analysis
- [ ] Test full compliance report generation

**Implementation:**
Copy code from main guide document (Section 3.2, Phase 3) into:
`compliance_agent/agent/hsa_compliance_agent.py`

**Testing Script:**
```python
# File: compliance_agent/tests/test_compliance_agent.py

from agent.hsa_compliance_agent import HSAComplianceAgent
from vector_store.pgvector_store import PGVectorStore

def test_single_requirement():
    """Test analyzing a single requirement."""

    vector_store = PGVectorStore()
    agent = HSAComplianceAgent(vector_store)

    # Test requirement
    requirement = {
        'id': 'TEST-001',
        'text': 'Software as a Medical Device must document software architecture including frontend, backend, and database components.'
    }

    print("Analyzing requirement:", requirement['text'])
    gap = agent.analyze_requirement(requirement['id'], requirement['text'])

    print(f"\nResult:")
    print(f"Status: {gap.status}")
    print(f"Priority: {gap.priority}")
    print(f"Evidence: {gap.evidence}")
    print(f"Gap: {gap.gap_description}")
    print(f"Remediation: {gap.remediation}")

    vector_store.close()

    assert gap.status in ['compliant', 'partial', 'non_compliant']
    assert gap.priority in ['critical', 'high', 'medium', 'low']

    print("\n✓ Single requirement test passed")

def test_full_report():
    """Test generating full compliance report."""

    vector_store = PGVectorStore()
    agent = HSAComplianceAgent(vector_store)

    # Sample requirements
    requirements = [
        {
            'id': 'ARCH-001',
            'text': 'System architecture documentation must describe all major components and their interactions.'
        },
        {
            'id': 'DB-001',
            'text': 'Database schema must be documented with table definitions and relationships.'
        },
        {
            'id': 'API-001',
            'text': 'API endpoints must be documented with request/response formats.'
        }
    ]

    print(f"Generating compliance report for {len(requirements)} requirements...")
    report = agent.generate_compliance_report(requirements)

    print(f"\nSummary:")
    print(f"Total: {report['summary']['total_requirements']}")
    print(f"Compliant: {report['summary']['compliant']}")
    print(f"Partial: {report['summary']['partial_compliant']}")
    print(f"Non-Compliant: {report['summary']['non_compliant']}")
    print(f"Compliance %: {report['summary']['compliance_percentage']:.1f}%")

    # Save report
    import json
    with open('/home/runner/workspace/compliance_agent/output/test_report.json', 'w') as f:
        json.dump(report, f, indent=2)

    print("\n✓ Report saved to output/test_report.json")

    vector_store.close()

    assert report['summary']['total_requirements'] == len(requirements)

    print("\n✓ Full report test passed")

if __name__ == "__main__":
    print("Testing HSA Compliance Agent\n" + "="*50)
    test_single_requirement()
    print("\n" + "="*50)
    test_full_report()
    print("\n✅ All agent tests passed!")
```

**Run Tests:**
```bash
cd /home/runner/workspace/compliance_agent
source ../venv/bin/activate

# Set API key
export ANTHROPIC_API_KEY="your-key-here"

# Run tests
python tests/test_compliance_agent.py
```

**Success Criteria:**
- Agent successfully analyzes requirements
- Returns structured gap analysis
- Generates compliance report
- Report saved to JSON file

---

## Phase 2: SIMISAI Integration (Weeks 5-6)

### Week 5: Backend Integration

**Goal:** Add compliance API endpoints to SIMISAI Express backend

**Tasks:**
- [ ] Add compliance routes to Express server
- [ ] Create database tables for compliance reports
- [ ] Implement report storage and retrieval
- [ ] Test API endpoints

**Database Migration:**
```sql
-- File: compliance_agent/migrations/001_create_compliance_tables.sql

-- Compliance reports table
CREATE TABLE IF NOT EXISTS compliance_reports (
    id SERIAL PRIMARY KEY,
    report_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_requirements INTEGER NOT NULL,
    compliant_count INTEGER NOT NULL,
    partial_count INTEGER NOT NULL,
    non_compliant_count INTEGER NOT NULL,
    compliance_percentage DECIMAL(5,2) NOT NULL,
    critical_gaps INTEGER NOT NULL,
    report_data JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Compliance gaps table
CREATE TABLE IF NOT EXISTS compliance_gaps (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES compliance_reports(id) ON DELETE CASCADE,
    requirement_id VARCHAR(100) NOT NULL,
    requirement_text TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('compliant', 'partial', 'non_compliant')),
    evidence TEXT,
    gap_description TEXT,
    remediation TEXT,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(255),
    resolution_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_compliance_reports_date ON compliance_reports(report_date DESC);
CREATE INDEX idx_compliance_gaps_report_id ON compliance_gaps(report_id);
CREATE INDEX idx_compliance_gaps_status ON compliance_gaps(status);
CREATE INDEX idx_compliance_gaps_priority ON compliance_gaps(priority);
CREATE INDEX idx_compliance_gaps_resolved ON compliance_gaps(resolved);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compliance_reports_updated_at
    BEFORE UPDATE ON compliance_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_gaps_updated_at
    BEFORE UPDATE ON compliance_gaps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON compliance_reports TO simisai_backend;
-- GRANT SELECT, INSERT, UPDATE ON compliance_gaps TO simisai_backend;
```

**Apply Migration:**
```bash
psql $DATABASE_URL -f /home/runner/workspace/compliance_agent/migrations/001_create_compliance_tables.sql
```

**Backend Routes Implementation:**
```typescript
// File: server/compliance-routes.ts

import { Router } from 'express';
import { db } from '../shared/db';
import { complianceReports, complianceGaps } from '../shared/schema';
import { eq, desc } from 'drizzle-orm';
import { spawn } from 'child_process';
import path from 'path';

const router = Router();

// Get latest compliance report
router.get('/api/compliance/report/latest', async (req, res) => {
  try {
    const [latestReport] = await db
      .select()
      .from(complianceReports)
      .orderBy(desc(complianceReports.reportDate))
      .limit(1);

    if (!latestReport) {
      return res.status(404).json({ error: 'No compliance reports found' });
    }

    // Get gaps for this report
    const gaps = await db
      .select()
      .from(complianceGaps)
      .where(eq(complianceGaps.reportId, latestReport.id));

    const report = {
      summary: {
        report_id: latestReport.id,
        report_date: latestReport.reportDate,
        total_requirements: latestReport.totalRequirements,
        compliant: latestReport.compliantCount,
        partial_compliant: latestReport.partialCount,
        non_compliant: latestReport.nonCompliantCount,
        compliance_percentage: parseFloat(latestReport.compliancePercentage),
        critical_gaps: latestReport.criticalGaps,
        high_priority_gaps: gaps.filter(g => g.priority === 'high').length
      },
      gaps: gaps.map(g => ({
        id: g.id,
        requirement_id: g.requirementId,
        requirement_text: g.requirementText,
        status: g.status,
        evidence: g.evidence,
        gap_description: g.gapDescription,
        remediation: g.remediation,
        priority: g.priority,
        resolved: g.resolved,
        resolved_at: g.resolvedAt,
        resolved_by: g.resolvedBy,
        resolution_notes: g.resolutionNotes
      })),
      critical_gaps: gaps
        .filter(g => g.priority === 'critical')
        .map(g => ({
          requirement_id: g.requirementId,
          gap_description: g.gapDescription,
          remediation: g.remediation
        }))
    };

    res.json(report);
  } catch (error) {
    console.error('Error fetching compliance report:', error);
    res.status(500).json({ error: 'Failed to fetch compliance report' });
  }
});

// Get all compliance reports (history)
router.get('/api/compliance/reports', async (req, res) => {
  try {
    const reports = await db
      .select()
      .from(complianceReports)
      .orderBy(desc(complianceReports.reportDate))
      .limit(20);

    res.json(reports);
  } catch (error) {
    console.error('Error fetching compliance reports:', error);
    res.status(500).json({ error: 'Failed to fetch compliance reports' });
  }
});

// Trigger new compliance analysis
router.post('/api/compliance/analyze', async (req, res) => {
  try {
    // Spawn Python compliance agent
    const pythonPath = path.join(process.cwd(), '../venv/bin/python3');
    const scriptPath = path.join(process.cwd(), '../compliance_agent/agent/run_analysis.py');

    const pythonProcess = spawn(pythonPath, [scriptPath]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('Python output:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error('Python error:', data.toString());
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        // Analysis succeeded, report should be in database
        const [latestReport] = await db
          .select()
          .from(complianceReports)
          .orderBy(desc(complianceReports.reportDate))
          .limit(1);

        res.json({
          message: 'Compliance analysis completed successfully',
          report_id: latestReport?.id,
          output: output
        });
      } else {
        res.status(500).json({
          error: 'Compliance analysis failed',
          code: code,
          stderr: errorOutput
        });
      }
    });
  } catch (error) {
    console.error('Error triggering compliance analysis:', error);
    res.status(500).json({ error: 'Failed to trigger compliance analysis' });
  }
});

// Mark gap as resolved
router.patch('/api/compliance/gaps/:gapId/resolve', async (req, res) => {
  try {
    const { gapId } = req.params;
    const { resolved_by, resolution_notes } = req.body;

    await db
      .update(complianceGaps)
      .set({
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy: resolved_by,
        resolutionNotes: resolution_notes
      })
      .where(eq(complianceGaps.id, parseInt(gapId)));

    res.json({ message: 'Gap marked as resolved' });
  } catch (error) {
    console.error('Error resolving gap:', error);
    res.status(500).json({ error: 'Failed to resolve gap' });
  }
});

export default router;
```

**Add to main server:**
```typescript
// File: server/index.ts (add to existing imports and routes)

import complianceRoutes from './compliance-routes';

// ... existing code ...

// Add compliance routes
app.use(complianceRoutes);

// ... rest of existing code ...
```

**Update Drizzle Schema:**
```typescript
// File: shared/schema.ts (add to existing schema)

export const complianceReports = pgTable('compliance_reports', {
  id: serial('id').primaryKey(),
  reportDate: timestamp('report_date').notNull().defaultNow(),
  totalRequirements: integer('total_requirements').notNull(),
  compliantCount: integer('compliant_count').notNull(),
  partialCount: integer('partial_count').notNull(),
  nonCompliantCount: integer('non_compliant_count').notNull(),
  compliancePercentage: decimal('compliance_percentage', { precision: 5, scale: 2 }).notNull(),
  criticalGaps: integer('critical_gaps').notNull(),
  reportData: jsonb('report_data').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const complianceGaps = pgTable('compliance_gaps', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id').references(() => complianceReports.id, { onDelete: 'cascade' }),
  requirementId: varchar('requirement_id', { length: 100 }).notNull(),
  requirementText: text('requirement_text').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  evidence: text('evidence'),
  gapDescription: text('gap_description'),
  remediation: text('remediation'),
  priority: varchar('priority', { length: 20 }).notNull(),
  resolved: boolean('resolved').default(false),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: varchar('resolved_by', { length: 255 }),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});
```

**Test Backend:**
```bash
cd /home/runner/workspace
pnpm run dev:server

# In another terminal, test endpoints:
curl http://localhost:3001/api/compliance/report/latest
curl -X POST http://localhost:3001/api/compliance/analyze
```

**Success Criteria:**
- Database tables created
- API endpoints respond correctly
- Compliance analysis can be triggered
- Reports stored in database

---

### Week 6: Frontend Dashboard

**Goal:** Build React compliance dashboard in SIMISAI frontend

**Tasks:**
- [ ] Copy dashboard component from main guide
- [ ] Add route to Astro pages
- [ ] Test dashboard rendering
- [ ] Add navigation link

**Implementation:**
Copy dashboard component from main guide document (Section 3.3) into:
`src/components/pages/ComplianceDashboard.tsx`

**Add Astro Page:**
```astro
---
// File: src/pages/compliance.astro

import Layout from '../layouts/Layout.astro';
import { ComplianceDashboard } from '../components/pages/ComplianceDashboard';
---

<Layout title="HSA Regulatory Compliance">
  <ComplianceDashboard client:load />
</Layout>
```

**Add Navigation Link:**
```typescript
// File: src/components/ui/nav.tsx (or wherever your nav component is)

// Add to navigation items:
{
  href: '/compliance',
  label: 'Compliance',
  icon: 'shield-check'
}
```

**Test Frontend:**
```bash
cd /home/runner/workspace
pnpm run dev:full

# Open browser to http://localhost:5000/compliance
```

**Success Criteria:**
- Dashboard renders correctly
- Data fetched from backend API
- Charts and tables display properly
- Navigation works

---

## Phase 3: Production Deployment (Weeks 7-8)

### Week 7: AWS Lambda Deployment

**Goal:** Deploy compliance agent as AWS Lambda function

**Tasks:**
- [ ] Package Python agent for Lambda
- [ ] Create Lambda function
- [ ] Configure API Gateway
- [ ] Test Lambda execution

**Lambda Package Structure:**
```
compliance_lambda/
├── lambda_function.py          # Lambda handler
├── agent/
│   └── hsa_compliance_agent.py
├── ingestion/
│   └── hsa_document_loader.py
├── vector_store/
│   └── pgvector_store.py
└── requirements.txt
```

**Lambda Handler:**
```python
# File: compliance_agent/lambda/lambda_function.py

import json
import os
from agent.hsa_compliance_agent import HSAComplianceAgent
from vector_store.pgvector_store import PGVectorStore

def lambda_handler(event, context):
    """
    AWS Lambda handler for HSA compliance analysis.

    Event format:
    {
        "action": "analyze" | "get_report",
        "requirements": [...] (optional, for analyze action)
    }
    """

    try:
        action = event.get('action', 'analyze')

        if action == 'analyze':
            # Run compliance analysis
            vector_store = PGVectorStore()
            agent = HSAComplianceAgent(vector_store)

            # Load requirements (from S3 or event)
            requirements = event.get('requirements', load_default_requirements())

            # Generate report
            report = agent.generate_compliance_report(requirements)

            # Save to database
            save_report_to_database(report)

            vector_store.close()

            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Compliance analysis completed',
                    'summary': report['summary']
                })
            }

        elif action == 'get_report':
            # Fetch latest report from database
            report = fetch_latest_report()

            return {
                'statusCode': 200,
                'body': json.dumps(report)
            }

        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid action'})
            }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def load_default_requirements():
    """Load HSA requirements from S3 or environment."""
    # Implementation depends on your setup
    pass

def save_report_to_database(report):
    """Save compliance report to PostgreSQL."""
    # Implementation using psycopg2
    pass

def fetch_latest_report():
    """Fetch latest report from database."""
    # Implementation using psycopg2
    pass
```

**Deploy to Lambda:**
```bash
# Build Lambda package
cd /home/runner/workspace/compliance_agent
mkdir lambda_package
pip install -r requirements.txt -t lambda_package/
cp -r agent ingestion vector_store lambda_package/
cp lambda/lambda_function.py lambda_package/

# Create deployment zip
cd lambda_package
zip -r ../compliance_lambda.zip .

# Deploy via AWS CLI
aws lambda create-function \
  --function-name simisai-hsa-compliance-agent \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://../compliance_lambda.zip \
  --timeout 300 \
  --memory-size 1024 \
  --environment Variables="{ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY,DATABASE_URL=$DATABASE_URL}"
```

**Success Criteria:**
- Lambda function deployed
- Test invocation succeeds
- Report generated and saved
- API Gateway configured

---

### Week 8: Production Testing & Documentation

**Goal:** Test end-to-end system and document procedures

**Tasks:**
- [ ] Run full compliance analysis
- [ ] Validate all critical gaps identified
- [ ] Create user documentation
- [ ] Create maintenance procedures

**Full System Test:**
```bash
# 1. Ensure all HSA documents are loaded
cd /home/runner/workspace/compliance_agent
python vector_store/pgvector_store.py

# 2. Trigger full compliance analysis
curl -X POST http://localhost:3001/api/compliance/analyze

# 3. View results in dashboard
# Open http://localhost:5000/compliance

# 4. Export report
curl http://localhost:3001/api/compliance/report/latest > compliance_report.json
```

**User Documentation:**
Create `/docs/compliance/user-guide.md` with:
- How to access compliance dashboard
- How to trigger new analysis
- How to interpret results
- How to mark gaps as resolved
- How to export reports

**Maintenance Procedures:**
Create `/docs/compliance/maintenance.md` with:
- How to update HSA documents
- How to add new requirements
- How to re-index documents
- How to troubleshoot issues
- Monthly compliance workflow

**Success Criteria:**
- Full system test passes
- All documentation complete
- Team trained on usage
- Production ready

---

## Ongoing Operations

### Monthly Compliance Workflow

**Every Month:**
1. Check HSA website for updated guidance documents
2. Download any new/updated documents
3. Re-index documents into vector database
4. Run compliance analysis
5. Review new gaps
6. Update documentation as needed
7. Archive old reports

**Automated Monitoring:**
- Set up AWS CloudWatch Events to trigger monthly analysis
- Email notifications for critical gaps
- Slack integration for compliance alerts

### Quarterly Reviews

**Every Quarter:**
- Review all open compliance gaps
- Update remediation progress
- Present compliance status to leadership
- Plan documentation improvements
- Budget for regulatory consultant review

---

## Success Metrics

### Technical Metrics
- [ ] 100% of HSA documents indexed
- [ ] 100% of SIMISAI docs indexed
- [ ] Search returns results in <2 seconds
- [ ] Agent analysis completes in <5 minutes
- [ ] API response times <500ms
- [ ] 99% uptime for compliance dashboard

### Compliance Metrics
- [ ] Compliance percentage > 80% (MVP target)
- [ ] Zero critical gaps (production target)
- [ ] All high-priority gaps have remediation plans
- [ ] Monthly compliance reports generated on time
- [ ] All gaps resolved before HSA submission

### Business Metrics
- [ ] HSA registration timeline reduced by 50%
- [ ] Regulatory consultant costs reduced by 30%
- [ ] Time to identify gaps reduced from weeks to hours
- [ ] Documentation completeness improved by 40%

---

## Troubleshooting Guide

### Common Issues

**Issue: Vector search returns no results**
- Check if documents are indexed: `SELECT COUNT(*) FROM document_vectors;`
- Verify embedding model is correct version
- Check query embedding generation
- Review metadata filters

**Issue: Claude API rate limits**
- Implement exponential backoff
- Batch requirements together
- Use Sonnet instead of Opus for routine checks
- Cache analysis results

**Issue: PDF parsing failures**
- Check if PDF is scanned (requires OCR)
- Verify PDF version compatibility
- Try alternative parsing library (pdfplumber vs PyMuPDF)
- Manual extraction for critical documents

**Issue: Database connection errors**
- Verify DATABASE_URL environment variable
- Check network connectivity to Neon Database
- Verify pgvector extension is installed
- Check connection pool limits

---

## Budget Summary

### MVP (Months 1-2)
- Development time: 80 hours @ $0/hour (internal) = $0
- Anthropic Claude API: ~$20/month
- PostgreSQL (pgvector): $0 (using existing SIMISAI DB)
- AWS Lambda: ~$5/month
- **Total: ~$25/month**

### Production (Months 3+)
- Anthropic Claude API: ~$50/month
- Pinecone (optional): $70/month
- AWS Lambda: ~$10/month
- S3 storage: ~$5/month
- Maintenance: 5 hours/month @ $0/hour = $0
- **Total: ~$135/month (or $65 without Pinecone)**

### ROI Analysis
- Regulatory consultant savings: $5,000-10,000/year
- Faster time to market: $20,000-50,000 value
- Reduced documentation errors: $10,000-30,000 value
- **Total value: $35,000-90,000/year**
- **Cost: $300-1,620/year**
- **ROI: 22x - 300x**

---

## Next Steps

### Immediate (This Week)
1. Review this roadmap with team
2. Set up development environment (Day 1-2)
3. Download HSA documents (Day 3-4)
4. Begin MVP implementation (Week 2)

### Short-Term (This Month)
1. Complete MVP implementation (Weeks 2-4)
2. Run first compliance analysis
3. Identify top 10 critical gaps
4. Begin addressing critical gaps

### Long-Term (Next 3 Months)
1. Integrate with SIMISAI platform (Weeks 5-6)
2. Deploy to production (Weeks 7-8)
3. Begin HSA registration preparation
4. Expand to other ASEAN jurisdictions

---

**Document Version**: 1.0
**Last Updated**: 2025-12-02
**Status**: Ready for Implementation
**Estimated Total Time**: 8 weeks
**Estimated Total Cost**: $25-135/month
