# HSA Regulatory Compliance Agent for SIMISAI

## Executive Summary

This document provides a comprehensive guide to building an AI-powered regulatory compliance agent focused on Singapore's Health Sciences Authority (HSA) requirements for the SIMISAI medical device assistance platform. The agent will automate gap analysis, document validation, and compliance checking against HSA regulations for Software as a Medical Device (SaMD).

**Key Objectives:**
- Automate HSA compliance checking for SIMISAI platform
- Identify documentation gaps against HSA requirements
- Provide actionable remediation recommendations
- Support Class A/B medical device registration process
- Ensure ongoing compliance monitoring

---

## 1. Singapore HSA Regulatory Requirements (2025)

### 1.1 Medical Device Classification

The HSA classifies medical devices based on risk levels, following the guidance document **GN-13: Guidance on the Risk Classification of General Medical Devices**.

**SIMISAI Classification Analysis:**
- **Platform Type**: AI-powered medical device assistance software
- **Intended Use**: Provides guidance on medical device usage (non-diagnostic)
- **Risk Level**: Likely **Class B (Low-Medium Risk)** or potentially Class A if purely educational
- **Rationale**: SIMISAI provides guidance but does NOT:
  - Diagnose medical conditions
  - Prescribe treatment
  - Make clinical decisions
  - Control medical devices directly

### 1.2 Software as a Medical Device (SaMD) Requirements

#### Key HSA Guidance Documents:
- **"Regulatory Guidelines for Software Medical Devices – A Life Cycle Approach"**
- **Updated SaMD and CDSS Guidelines (July 2025)**

#### Critical Distinctions (July 2025 Updates):
- **Clinical Decision Support Software (CDSS)**: NOT regulated if based solely on established clinical guidelines without adaptive logic or AI
- **AI-Powered SaMD**: Regulated if software uses ML/AI models that adapt or provide personalized recommendations

**SIMISAI Status**: As an AI-powered platform with computer vision and chat guidance, SIMISAI falls under regulated AI-SaMD category.

### 1.3 Required Documentation for Class B Registration

Based on HSA's ASEAN Common Submission Dossier Template (CSDT) format:

#### Core Documentation Requirements:

1. **Executive Summary**
   - Overview of SIMISAI platform and intended use

2. **Essential Principles Checklist**
   - Demonstration of compliance with HSA safety and performance principles

3. **Declaration of Conformity**
   - Formal declaration of compliance with HSA essential principles

4. **Device Description**
   - Technical architecture (Astro + React frontend, Express backend, PostgreSQL database)
   - AWS infrastructure (SageMaker for CV, Lambda functions, RDS)
   - Computer vision pipeline (MediaPipe + YOLOv8)
   - AI chat system (WebSocket-based real-time guidance)
   - Multilingual support (English, Indonesian, Thai, Vietnamese, Filipino)

5. **Design Verification and Validation Documents**
   - CV model accuracy testing reports
   - AI chat response validation
   - Accessibility testing (WCAG 2.2 compliance)
   - Multilingual accuracy validation

6. **Clinical Evaluation Report (CER)**
   - Clinical data supporting safety and performance
   - User studies demonstrating effective device guidance
   - Evidence of improved user outcomes (safer device usage)

7. **Device Labels and Instructions for Use (IFU)**
   - User interface screenshots and navigation guides
   - Disclaimers about non-diagnostic nature
   - Instructions for users with disabilities

8. **Risk Analysis/Management Report**
   - ISO 14971 compliant risk management file
   - Identified risks: misidentification of devices, incorrect guidance, accessibility barriers
   - Mitigation measures: accuracy thresholds, human-in-the-loop, clear disclaimers

9. **Quality Management System (QMS) Certificate**
   - ISO 13485 or equivalent certification
   - Must include software development scope

10. **Software-Specific Documentation**
    - Software versioning and traceability
    - Software verification and validation reports
    - Cybersecurity documentation
    - Software development lifecycle (SDLC) process summary
    - Software Requirements Specification
    - Traceability analysis

11. **Manufacturer Information**
    - All manufacturing and deployment sites (AWS regions)
    - Local Singapore authorized representative

12. **Cybersecurity Documentation**
    - Data encryption (at rest and in transit)
    - Authentication and authorization mechanisms
    - Vulnerability management process
    - Incident response plan

13. **Data Protection Compliance**
    - Singapore Personal Data Protection Act (PDPA) compliance
    - Data retention policies
    - User consent mechanisms
    - Data breach notification procedures

14. **AI-Specific Documentation**
    - AI model training data sources and methodology
    - Model validation and performance metrics
    - **AI Verify Toolkit** benchmarking results (encouraged by HSA)
    - Bias and fairness testing
    - Explainability and transparency measures

### 1.4 Recent 2025 HSA Updates

#### Exemptions for In-House AI-SaMDs (Mid-2025 Consultation)
- Proposed exemptions from licensing/registration for AI-SaMDs developed and used within public healthcare institutions
- **SIMISAI Impact**: Not applicable as commercial platform, but signals regulatory accommodation for healthcare AI innovation

#### Revised Change Management Program (CMP) (Early 2025)
- Updated framework for ML-enabled SaMDs
- Streamlined process for software updates and model improvements
- **SIMISAI Impact**: Enables faster iteration on CV models and AI chat improvements with proper documentation

---

## 2. Agent Architecture Recommendation

### 2.1 Hybrid RAG + Claude Agent SDK Architecture

**Recommended Approach**: Combine LlamaIndex (data/retrieval layer) with Claude Agent SDK (reasoning/analysis layer) for production-grade compliance checking.

#### Architecture Components:

```
┌─────────────────────────────────────────────────────────────┐
│                   HSA Compliance Agent                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Data & Retrieval Layer (LlamaIndex)            │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Document Ingestion Pipeline                        │    │
│  │  • HSA Guidance Documents (PDFs)                   │    │
│  │  • ASEAN CSDT Templates                            │    │
│  │  • ISO 14971, ISO 13485 Standards                  │    │
│  │  • SIMISAI Internal Documentation                  │    │
│  └────────────────────────────────────────────────────┘    │
│                              │                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Text Processing                                    │    │
│  │  • PDF Parsing (PyMuPDF, pdfplumber)              │    │
│  │  • Table Extraction (camelot-py)                   │    │
│  │  • Semantic Chunking                               │    │
│  └────────────────────────────────────────────────────┘    │
│                              │                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Vector Database (Pinecone/ChromaDB/pgvector)       │    │
│  │  • Regulatory Requirements (embedded)              │    │
│  │  • SIMISAI Docs (embedded)                         │    │
│  │  • Metadata: source, regulation, article, version  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│         Reasoning & Analysis Layer (Claude Agent SDK)       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Compliance Analysis Agent                          │    │
│  │  • Query regulatory requirements                   │    │
│  │  • Retrieve relevant SIMISAI docs                  │    │
│  │  • Compare and identify gaps                       │    │
│  │  • Generate remediation recommendations            │    │
│  └────────────────────────────────────────────────────┘    │
│                              │                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Tools Available to Agent                           │    │
│  │  • get_regulatory_context(query)                   │    │
│  │  • get_simisai_documentation(query)                │    │
│  │  • compare_requirement_vs_doc(req_id, doc_id)      │    │
│  │  • generate_compliance_report()                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Output Layer                            │
│  • Gap Analysis Report (JSON/PDF/Markdown)                  │
│  • Compliance Dashboard (React UI)                          │
│  • Remediation Action Items (CSV/Notion/Jira)              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Why This Architecture?

**LlamaIndex for Data Layer:**
- Best-in-class RAG capabilities for complex medical/regulatory documents
- Advanced indexing strategies (graph-based) for interconnected regulations
- Excellent PDF/document loaders
- Multi-document retrieval for comparing regulations vs. internal docs

**Claude Agent SDK for Reasoning Layer:**
- Superior legal/regulatory reasoning capabilities
- Reliable tool use for structured compliance checking
- Strong citation and source tracking
- Excellent at nuanced gap analysis

### 2.3 Alternative: LangChain + OpenAI

**When to Consider:**
- Cost optimization (OpenAI GPT-4 Turbo cheaper than Claude Opus)
- Need extensive third-party integrations
- Want mature ecosystem with more examples

**Trade-offs:**
- Lower reasoning quality for complex regulatory interpretation
- Less reliable citation generation
- More prompt engineering required

---

## 3. Technical Implementation Guide

### 3.1 Technology Stack

#### Core Libraries:
```bash
# AI/LLM
pip install anthropic  # Claude API
pip install langchain  # Optional: for additional abstractions
pip install llama-index  # RAG framework

# Document Processing
pip install PyMuPDF  # PDF parsing (fast)
pip install pdfplumber  # Advanced PDF layout analysis
pip install camelot-py[cv]  # Table extraction
pip install pytesseract  # OCR for scanned PDFs
pip install python-docx  # Word document processing

# Vector Database
pip install pinecone-client  # Managed vector DB (recommended)
# OR
pip install chromadb  # Local/open-source vector DB
# OR
pip install pgvector  # PostgreSQL extension (integrates with existing SIMISAI DB)

# Utilities
pip install pandas  # Data manipulation
pip install numpy  # Numerical operations
pip install sentence-transformers  # Embedding models
```

#### Infrastructure Integration:
- **Database**: Extend existing SIMISAI PostgreSQL (Neon Database) with pgvector extension
- **Storage**: AWS S3 for regulatory document storage
- **Compute**: AWS Lambda function for compliance agent (or EC2 for larger workloads)
- **Frontend**: React component in SIMISAI dashboard for compliance status

### 3.2 Implementation Workflow

#### Phase 1: Document Ingestion Pipeline

```python
# File: compliance_agent/ingestion/hsa_document_loader.py

import fitz  # PyMuPDF
import pdfplumber
import camelot
from typing import List, Dict
from dataclasses import dataclass

@dataclass
class DocumentChunk:
    text: str
    source: str
    regulation: str
    article: str
    page_number: int
    metadata: Dict

class HSADocumentLoader:
    """Loads and processes HSA regulatory documents."""

    def __init__(self, docs_directory: str):
        self.docs_directory = docs_directory
        self.chunks: List[DocumentChunk] = []

    def load_hsa_guidance(self, pdf_path: str) -> List[DocumentChunk]:
        """
        Load HSA guidance document and extract structured requirements.

        Args:
            pdf_path: Path to HSA PDF document (e.g., GN-13, SaMD guidelines)

        Returns:
            List of DocumentChunk objects with extracted requirements
        """
        chunks = []

        # Extract text with PyMuPDF (fast)
        doc = fitz.open(pdf_path)

        for page_num, page in enumerate(doc):
            text = page.get_text()

            # Extract tables separately with pdfplumber for better accuracy
            with pdfplumber.open(pdf_path) as pdf:
                pdf_page = pdf.pages[page_num]
                tables = pdf_page.extract_tables()

            # Chunk text semantically (by section/paragraph)
            text_chunks = self._semantic_chunk(text)

            for chunk_text in text_chunks:
                chunk = DocumentChunk(
                    text=chunk_text,
                    source=pdf_path,
                    regulation=self._extract_regulation_name(pdf_path),
                    article=self._extract_article_number(chunk_text),
                    page_number=page_num + 1,
                    metadata={
                        "tables": tables,
                        "doc_type": "hsa_guidance",
                    }
                )
                chunks.append(chunk)

        doc.close()
        return chunks

    def _semantic_chunk(self, text: str, chunk_size: int = 512) -> List[str]:
        """
        Chunk text by semantic boundaries (paragraphs, sections).
        Better than fixed-size chunking for regulatory documents.
        """
        # Split by double newlines (paragraph boundaries)
        paragraphs = text.split('\n\n')

        chunks = []
        current_chunk = ""

        for para in paragraphs:
            if len(current_chunk) + len(para) < chunk_size:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks

    def _extract_regulation_name(self, pdf_path: str) -> str:
        """Extract regulation name from filename or metadata."""
        # Simple heuristic: extract from filename
        filename = pdf_path.split('/')[-1]
        if 'GN-13' in filename:
            return 'GN-13'
        elif 'SaMD' in filename:
            return 'SaMD Guidelines'
        return 'Unknown'

    def _extract_article_number(self, text: str) -> str:
        """Extract article/section number from text."""
        import re
        # Look for patterns like "Article 5.2.1" or "Section 3.4"
        match = re.search(r'(Article|Section)\s+(\d+(?:\.\d+)*)', text)
        if match:
            return match.group(2)
        return 'N/A'

class SIMISAIDocumentLoader:
    """Loads and processes SIMISAI internal documentation."""

    def __init__(self, docs_directory: str):
        self.docs_directory = docs_directory

    def load_simisai_docs(self) -> List[DocumentChunk]:
        """
        Load SIMISAI documentation from /docs/ directory.

        Returns:
            List of DocumentChunk objects from SIMISAI docs
        """
        chunks = []

        # Load markdown files from SIMISAI docs
        import os
        for root, dirs, files in os.walk(self.docs_directory):
            for file in files:
                if file.endswith('.md'):
                    file_path = os.path.join(root, file)
                    with open(file_path, 'r') as f:
                        content = f.read()

                    # Chunk markdown by sections (## headers)
                    sections = self._chunk_markdown_by_headers(content)

                    for section in sections:
                        chunk = DocumentChunk(
                            text=section['content'],
                            source=file_path,
                            regulation='SIMISAI Internal',
                            article=section['header'],
                            page_number=0,
                            metadata={
                                "doc_type": "simisai_internal",
                                "category": self._categorize_doc(file_path)
                            }
                        )
                        chunks.append(chunk)

        return chunks

    def _chunk_markdown_by_headers(self, markdown: str) -> List[Dict]:
        """Split markdown by ## headers for semantic chunking."""
        import re
        sections = []

        # Split by ## headers
        parts = re.split(r'^(##\s+.+)$', markdown, flags=re.MULTILINE)

        current_header = "Introduction"
        for part in parts:
            if part.startswith('##'):
                current_header = part.replace('##', '').strip()
            elif part.strip():
                sections.append({
                    'header': current_header,
                    'content': part.strip()
                })

        return sections

    def _categorize_doc(self, file_path: str) -> str:
        """Categorize SIMISAI document by directory."""
        if '/architecture/' in file_path:
            return 'architecture'
        elif '/deployment/' in file_path:
            return 'deployment'
        elif '/api/' in file_path:
            return 'api'
        return 'general'

# Example usage:
if __name__ == "__main__":
    hsa_loader = HSADocumentLoader("/path/to/hsa/docs")
    simisai_loader = SIMISAIDocumentLoader("/home/runner/workspace/docs")

    hsa_chunks = hsa_loader.load_hsa_guidance("/path/to/GN-13.pdf")
    simisai_chunks = simisai_loader.load_simisai_docs()

    print(f"Loaded {len(hsa_chunks)} HSA chunks")
    print(f"Loaded {len(simisai_chunks)} SIMISAI chunks")
```

#### Phase 2: Vector Database Setup

```python
# File: compliance_agent/vector_store/setup.py

from llama_index import VectorStoreIndex, ServiceContext, StorageContext
from llama_index.vector_stores import PineconeVectorStore
from llama_index.embeddings import HuggingFaceEmbedding
import pinecone
import os

class ComplianceVectorStore:
    """Manages vector database for regulatory compliance checking."""

    def __init__(self, use_pinecone: bool = True):
        self.use_pinecone = use_pinecone

        if use_pinecone:
            self._setup_pinecone()
        else:
            self._setup_local()

    def _setup_pinecone(self):
        """Setup Pinecone managed vector database."""
        pinecone.init(
            api_key=os.environ.get("PINECONE_API_KEY"),
            environment=os.environ.get("PINECONE_ENVIRONMENT", "us-west1-gcp")
        )

        # Create index if it doesn't exist
        index_name = "hsa-compliance"
        if index_name not in pinecone.list_indexes():
            pinecone.create_index(
                name=index_name,
                dimension=384,  # dimension for sentence-transformers/all-MiniLM-L6-v2
                metric="cosine"
            )

        self.index = pinecone.Index(index_name)
        self.vector_store = PineconeVectorStore(pinecone_index=self.index)

    def _setup_local(self):
        """Setup local ChromaDB vector database."""
        import chromadb

        chroma_client = chromadb.Client()
        self.collection = chroma_client.create_collection(
            name="hsa_compliance",
            metadata={"description": "HSA regulatory compliance knowledge base"}
        )

    def index_documents(self, chunks: List[DocumentChunk]):
        """
        Index document chunks into vector database.

        Args:
            chunks: List of DocumentChunk objects to index
        """
        from llama_index import Document

        # Convert DocumentChunks to LlamaIndex Documents
        documents = []
        for chunk in chunks:
            doc = Document(
                text=chunk.text,
                metadata={
                    "source": chunk.source,
                    "regulation": chunk.regulation,
                    "article": chunk.article,
                    "page_number": chunk.page_number,
                    **chunk.metadata
                }
            )
            documents.append(doc)

        # Create embedding model (lightweight for cost efficiency)
        embed_model = HuggingFaceEmbedding(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        # Create service context
        service_context = ServiceContext.from_defaults(
            embed_model=embed_model,
            llm=None  # We'll use Claude API directly
        )

        # Create storage context
        storage_context = StorageContext.from_defaults(
            vector_store=self.vector_store
        )

        # Create index
        self.compliance_index = VectorStoreIndex.from_documents(
            documents,
            service_context=service_context,
            storage_context=storage_context
        )

        print(f"Indexed {len(documents)} documents into vector store")

    def query(self, query_text: str, top_k: int = 5) -> List[Dict]:
        """
        Query vector database for relevant documents.

        Args:
            query_text: Query string
            top_k: Number of results to return

        Returns:
            List of relevant document chunks with metadata
        """
        retriever = self.compliance_index.as_retriever(similarity_top_k=top_k)
        results = retriever.retrieve(query_text)

        return [
            {
                "text": result.node.text,
                "metadata": result.node.metadata,
                "score": result.score
            }
            for result in results
        ]

# Example usage:
if __name__ == "__main__":
    from ingestion.hsa_document_loader import HSADocumentLoader, SIMISAIDocumentLoader

    # Load documents
    hsa_loader = HSADocumentLoader("/path/to/hsa/docs")
    simisai_loader = SIMISAIDocumentLoader("/home/runner/workspace/docs")

    all_chunks = []
    all_chunks.extend(hsa_loader.load_hsa_guidance("/path/to/GN-13.pdf"))
    all_chunks.extend(simisai_loader.load_simisai_docs())

    # Index into vector store
    vector_store = ComplianceVectorStore(use_pinecone=True)
    vector_store.index_documents(all_chunks)

    # Test query
    results = vector_store.query("What are the Class B medical device requirements?")
    for result in results:
        print(f"Source: {result['metadata']['source']}")
        print(f"Text: {result['text'][:200]}...")
        print()
```

#### Phase 3: Claude Agent Implementation

```python
# File: compliance_agent/agent/hsa_compliance_agent.py

import os
import anthropic
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class ComplianceGap:
    """Represents a compliance gap identified by the agent."""
    requirement_id: str
    requirement_text: str
    status: str  # 'compliant', 'partial', 'non_compliant'
    evidence: Optional[str]
    gap_description: str
    remediation: str
    priority: str  # 'critical', 'high', 'medium', 'low'

class HSAComplianceAgent:
    """AI agent for HSA regulatory compliance checking."""

    def __init__(self, vector_store):
        self.vector_store = vector_store
        self.client = anthropic.Anthropic(
            api_key=os.environ.get("ANTHROPIC_API_KEY")
        )

        self.system_prompt = """
You are an expert HSA (Health Sciences Authority, Singapore) regulatory compliance analyst for medical devices.

Your role is to:
1. Analyze regulatory requirements from HSA guidance documents
2. Compare requirements against SIMISAI platform documentation
3. Identify compliance gaps with specific evidence
4. Provide actionable remediation recommendations

Rules:
- Base all analysis ONLY on provided context documents
- Cite specific sources for all findings
- Be precise about compliance status (Compliant/Partial/Non-Compliant)
- Prioritize gaps by risk level (Critical/High/Medium/Low)
- Provide concrete, actionable remediation steps

For SIMISAI context:
- Medical device assistance platform (non-diagnostic)
- Computer vision for device detection (YOLOv8)
- AI chat guidance (multilingual)
- AWS infrastructure (SageMaker, Lambda, RDS)
- Target: Singapore market, likely Class B SaMD
"""

    def analyze_requirement(
        self,
        requirement_id: str,
        requirement_text: str
    ) -> ComplianceGap:
        """
        Analyze a single regulatory requirement for compliance.

        Args:
            requirement_id: HSA requirement identifier (e.g., "GN-13-5.2.1")
            requirement_text: Full text of the requirement

        Returns:
            ComplianceGap object with analysis results
        """
        # Retrieve relevant SIMISAI documentation
        simisai_docs = self.vector_store.query(
            f"{requirement_text} SIMISAI documentation evidence",
            top_k=3
        )

        # Build context for Claude
        context = self._build_context(requirement_text, simisai_docs)

        # Create analysis prompt
        prompt = f"""
<requirement>
ID: {requirement_id}
Text: {requirement_text}
</requirement>

<simisai_documentation>
{context}
</simisai_documentation>

<task>
Analyze if SIMISAI platform complies with this HSA requirement.

Provide your analysis in this exact JSON format:
{{
    "status": "compliant" | "partial" | "non_compliant",
    "evidence": "Specific text from SIMISAI docs showing compliance (or null if none)",
    "gap_description": "Detailed explanation of what is missing or insufficient",
    "remediation": "Specific actionable steps to achieve compliance",
    "priority": "critical" | "high" | "medium" | "low"
}}

Be precise and cite specific document sources.
</task>
"""

        # Call Claude API
        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",  # or claude-3-opus for higher accuracy
            max_tokens=2048,
            system=self.system_prompt,
            messages=[{"role": "user", "content": prompt}]
        )

        # Parse response
        import json
        analysis = json.loads(response.content[0].text)

        return ComplianceGap(
            requirement_id=requirement_id,
            requirement_text=requirement_text,
            status=analysis['status'],
            evidence=analysis['evidence'],
            gap_description=analysis['gap_description'],
            remediation=analysis['remediation'],
            priority=analysis['priority']
        )

    def _build_context(self, requirement: str, docs: List[Dict]) -> str:
        """Build context string from retrieved documents."""
        context_parts = []
        for doc in docs:
            context_parts.append(f"""
<document source="{doc['metadata']['source']}">
{doc['text']}
</document>
""")
        return "\n".join(context_parts)

    def generate_compliance_report(
        self,
        requirements: List[Dict[str, str]]
    ) -> Dict:
        """
        Generate comprehensive compliance report for all requirements.

        Args:
            requirements: List of dicts with 'id' and 'text' keys

        Returns:
            Compliance report dict with summary and detailed gaps
        """
        gaps = []

        for req in requirements:
            gap = self.analyze_requirement(req['id'], req['text'])
            gaps.append(gap)

        # Calculate summary statistics
        total = len(gaps)
        compliant = sum(1 for g in gaps if g.status == 'compliant')
        partial = sum(1 for g in gaps if g.status == 'partial')
        non_compliant = sum(1 for g in gaps if g.status == 'non_compliant')

        critical_gaps = [g for g in gaps if g.priority == 'critical']
        high_gaps = [g for g in gaps if g.priority == 'high']

        report = {
            "summary": {
                "total_requirements": total,
                "compliant": compliant,
                "partial_compliant": partial,
                "non_compliant": non_compliant,
                "compliance_percentage": (compliant / total * 100) if total > 0 else 0,
                "critical_gaps": len(critical_gaps),
                "high_priority_gaps": len(high_gaps)
            },
            "gaps": [
                {
                    "requirement_id": g.requirement_id,
                    "requirement_text": g.requirement_text,
                    "status": g.status,
                    "evidence": g.evidence,
                    "gap_description": g.gap_description,
                    "remediation": g.remediation,
                    "priority": g.priority
                }
                for g in gaps
            ],
            "critical_gaps": [
                {
                    "requirement_id": g.requirement_id,
                    "gap_description": g.gap_description,
                    "remediation": g.remediation
                }
                for g in critical_gaps
            ]
        }

        return report

# Example usage:
if __name__ == "__main__":
    from vector_store.setup import ComplianceVectorStore

    # Setup vector store
    vector_store = ComplianceVectorStore(use_pinecone=True)

    # Create agent
    agent = HSAComplianceAgent(vector_store)

    # Define HSA requirements to check (example subset)
    requirements = [
        {
            "id": "GN-13-ClassB-1",
            "text": "Class B devices require a Clinical Evaluation Report (CER) summarizing clinical data supporting device safety and performance."
        },
        {
            "id": "SaMD-Software-1",
            "text": "Software as a Medical Device must include software versioning, traceability, verification and validation reports."
        },
        {
            "id": "SaMD-Cybersecurity-1",
            "text": "SaMD must provide cybersecurity documentation including data encryption, authentication mechanisms, and vulnerability management."
        },
        {
            "id": "SaMD-AI-1",
            "text": "AI-powered SaMD must document AI model training data, validation metrics, bias testing, and explainability measures. Use of AI Verify Toolkit is encouraged."
        }
    ]

    # Generate compliance report
    report = agent.generate_compliance_report(requirements)

    # Save report
    import json
    with open("/home/runner/workspace/hsa_compliance_report.json", "w") as f:
        json.dump(report, f, indent=2)

    print(f"Compliance Report Generated:")
    print(f"- Overall Compliance: {report['summary']['compliance_percentage']:.1f}%")
    print(f"- Critical Gaps: {report['summary']['critical_gaps']}")
    print(f"- High Priority Gaps: {report['summary']['high_priority_gaps']}")
```

### 3.3 Integration with SIMISAI Platform

#### Add Compliance Dashboard to React Frontend

```typescript
// File: src/components/pages/ComplianceDashboard.tsx

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface ComplianceGap {
  requirement_id: string;
  requirement_text: string;
  status: 'compliant' | 'partial' | 'non_compliant';
  evidence: string | null;
  gap_description: string;
  remediation: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface ComplianceReport {
  summary: {
    total_requirements: number;
    compliant: number;
    partial_compliant: number;
    non_compliant: number;
    compliance_percentage: number;
    critical_gaps: number;
    high_priority_gaps: number;
  };
  gaps: ComplianceGap[];
  critical_gaps: Array<{
    requirement_id: string;
    gap_description: string;
    remediation: string;
  }>;
}

export function ComplianceDashboard() {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceReport();
  }, []);

  const fetchComplianceReport = async () => {
    try {
      const response = await fetch('/api/compliance/report');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch compliance report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading compliance report...</div>;
  }

  if (!report) {
    return <div>Failed to load compliance report</div>;
  }

  const { summary, gaps, critical_gaps } = report;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">HSA Regulatory Compliance Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Overall Compliance</CardTitle>
            <CardDescription>Percentage of requirements met</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {summary.compliance_percentage.toFixed(1)}%
            </div>
            <Progress value={summary.compliance_percentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Gaps</CardTitle>
            <CardDescription>High-priority compliance issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="text-4xl font-bold">{summary.critical_gaps}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requirements Status</CardTitle>
            <CardDescription>Breakdown by compliance level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Compliant
                </span>
                <span className="font-bold">{summary.compliant}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  Partial
                </span>
                <span className="font-bold">{summary.partial_compliant}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  Non-Compliant
                </span>
                <span className="font-bold">{summary.non_compliant}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Gaps Section */}
      {critical_gaps.length > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Critical Compliance Gaps</CardTitle>
            <CardDescription>These require immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {critical_gaps.map((gap) => (
                <div key={gap.requirement_id} className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold">{gap.requirement_id}</h3>
                  <p className="text-sm text-gray-600 mt-1">{gap.gap_description}</p>
                  <div className="mt-2 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium">Remediation:</p>
                    <p className="text-sm">{gap.remediation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Gaps Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Compliance Analysis</CardTitle>
          <CardDescription>All requirements and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gaps.map((gap) => (
              <div
                key={gap.requirement_id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{gap.requirement_id}</h3>
                      <Badge
                        variant={
                          gap.status === 'compliant'
                            ? 'default'
                            : gap.status === 'partial'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {gap.status}
                      </Badge>
                      <Badge
                        variant={
                          gap.priority === 'critical' || gap.priority === 'high'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {gap.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{gap.requirement_text}</p>
                  </div>
                </div>

                {gap.evidence && (
                  <div className="mt-3 p-3 bg-green-50 rounded">
                    <p className="text-sm font-medium">Evidence:</p>
                    <p className="text-sm">{gap.evidence}</p>
                  </div>
                )}

                {gap.gap_description && gap.status !== 'compliant' && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded">
                    <p className="text-sm font-medium">Gap:</p>
                    <p className="text-sm">{gap.gap_description}</p>
                  </div>
                )}

                {gap.remediation && gap.status !== 'compliant' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium">Remediation:</p>
                    <p className="text-sm">{gap.remediation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Add Backend API Endpoint

```typescript
// File: server/routes.ts (add to existing routes)

// HSA Compliance API endpoint
router.get('/api/compliance/report', async (req, res) => {
  try {
    // In production, this would trigger the Python compliance agent
    // For now, serve pre-generated report
    const fs = await import('fs/promises');
    const reportPath = path.join(process.cwd(), 'hsa_compliance_report.json');
    const reportData = await fs.readFile(reportPath, 'utf-8');
    const report = JSON.parse(reportData);

    res.json(report);
  } catch (error) {
    console.error('Failed to load compliance report:', error);
    res.status(500).json({ error: 'Failed to load compliance report' });
  }
});

// Trigger new compliance analysis
router.post('/api/compliance/analyze', async (req, res) => {
  try {
    // Trigger Python compliance agent (via AWS Lambda or subprocess)
    // For MVP, use subprocess to call Python script
    const { spawn } = await import('child_process');

    const pythonProcess = spawn('python3', [
      path.join(process.cwd(), 'compliance_agent/agent/hsa_compliance_agent.py')
    ]);

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        res.json({ message: 'Compliance analysis completed', output });
      } else {
        res.status(500).json({ error: 'Compliance analysis failed' });
      }
    });
  } catch (error) {
    console.error('Failed to trigger compliance analysis:', error);
    res.status(500).json({ error: 'Failed to trigger compliance analysis' });
  }
});
```

---

## 4. Gap Analysis Methodology

### 4.1 Semantic Comparison Process

1. **Requirement Decomposition**: Break down complex HSA requirements into atomic, testable statements
2. **Evidence Retrieval**: Use vector search to find relevant SIMISAI documentation
3. **Similarity Scoring**: Calculate semantic similarity between requirement and evidence
4. **LLM Judgment**: Use Claude to make final compliance determination
5. **Citation Generation**: Provide specific document references for transparency

### 4.2 Compliance Status Classification

**Compliant**:
- Requirement fully addressed in SIMISAI documentation
- Sufficient evidence with specific implementation details
- No identified gaps or missing elements

**Partially Compliant**:
- Requirement partially addressed
- Some implementation exists but lacks completeness
- Minor gaps that can be addressed with documentation updates

**Non-Compliant**:
- Requirement not addressed in SIMISAI documentation
- No evidence found
- Significant implementation work required

### 4.3 Priority Assignment

**Critical**:
- Blocks HSA registration
- Patient safety implications
- Legal/regulatory violations
- Examples: Missing risk analysis, no cybersecurity documentation

**High**:
- Required for Class B registration
- Significant compliance risk
- Examples: Incomplete clinical evaluation, missing QMS certificate

**Medium**:
- Important but not blocking
- Can be addressed during registration process
- Examples: Incomplete labeling, minor documentation gaps

**Low**:
- Nice-to-have improvements
- No immediate compliance impact
- Examples: Documentation formatting, minor clarifications

---

## 5. Integration with SIMISAI Platform

### 5.1 Integration Points

1. **AWS Lambda Function**: Deploy compliance agent as Lambda function for on-demand analysis
2. **S3 Document Storage**: Store HSA guidance documents and SIMISAI docs in S3
3. **RDS PostgreSQL**: Use existing database with pgvector extension for vector storage
4. **React Dashboard**: Add compliance dashboard to SIMISAI admin interface
5. **API Gateway**: Expose compliance API endpoints for frontend consumption

### 5.2 Deployment Architecture

```
SIMISAI Compliance System
├── Frontend (Astro + React)
│   └── Compliance Dashboard Component
│       ├── Summary Cards
│       ├── Gap Analysis Table
│       └── Remediation Actions
│
├── Backend (Express.js)
│   └── API Endpoints
│       ├── GET /api/compliance/report
│       ├── POST /api/compliance/analyze
│       └── GET /api/compliance/requirements
│
├── Compliance Agent (Python + AWS Lambda)
│   ├── Document Loader
│   ├── Vector Store Manager
│   └── Claude Agent
│
└── Data Layer
    ├── S3: HSA Documents + SIMISAI Docs
    ├── RDS (pgvector): Vector embeddings
    └── RDS: Compliance reports table
```

### 5.3 Database Schema Extension

```sql
-- Add compliance tables to existing SIMISAI database

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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_gaps (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES compliance_reports(id),
    requirement_id VARCHAR(100) NOT NULL,
    requirement_text TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('compliant', 'partial', 'non_compliant')),
    evidence TEXT,
    gap_description TEXT,
    remediation TEXT,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_compliance_gaps_status ON compliance_gaps(status);
CREATE INDEX idx_compliance_gaps_priority ON compliance_gaps(priority);
CREATE INDEX idx_compliance_gaps_resolved ON compliance_gaps(resolved);
```

---

## 6. Sample Workflow

### 6.1 Initial Compliance Assessment

**Step 1: Document Collection**
```bash
# Gather HSA documents
mkdir -p /data/hsa_documents
# Download from HSA website:
# - GN-13: Risk Classification Guide
# - SaMD Regulatory Guidelines
# - ASEAN CSDT Template
# - Updated 2025 SaMD/CDSS Guidelines

# SIMISAI docs already in /home/runner/workspace/docs
```

**Step 2: Run Initial Analysis**
```bash
# Setup Python environment
cd /home/runner/workspace
python3 -m venv venv
source venv/bin/activate
pip install -r compliance_agent/requirements.txt

# Set environment variables
export ANTHROPIC_API_KEY="your-key-here"
export PINECONE_API_KEY="your-key-here"
export PINECONE_ENVIRONMENT="us-west1-gcp"

# Run compliance agent
python compliance_agent/agent/hsa_compliance_agent.py

# Output: hsa_compliance_report.json
```

**Step 3: Review Results**
```bash
# View compliance dashboard in browser
cd /home/runner/workspace
pnpm run dev:full

# Navigate to: http://localhost:5000/compliance
```

### 6.2 Addressing Compliance Gaps

**Example Critical Gap: Missing Clinical Evaluation Report**

**Gap Details:**
- Requirement ID: GN-13-ClassB-1
- Requirement: "Class B devices require a Clinical Evaluation Report (CER) summarizing clinical data supporting device safety and performance."
- Status: Non-Compliant
- Priority: Critical

**Remediation Steps:**
1. Conduct user studies demonstrating SIMISAI improves device usage safety
2. Collect data on:
   - Device detection accuracy (CV model performance)
   - User comprehension of guidance (chat effectiveness)
   - Reduction in user errors
   - Accessibility improvements for users with disabilities
3. Compile literature review on similar medical device assistance platforms
4. Write formal CER document following HSA templates
5. Update SIMISAI documentation with CER reference
6. Re-run compliance agent to verify gap closure

### 6.3 Ongoing Compliance Monitoring

**Automated Workflow:**
1. **Weekly Document Sync**: Automatically pull latest HSA guidance updates
2. **Monthly Compliance Scan**: Run agent monthly to detect new gaps
3. **Pre-Release Checks**: Run before major SIMISAI releases
4. **Regulatory Change Alerts**: Monitor HSA website for new regulations
5. **Dashboard Updates**: Real-time compliance status in admin interface

---

## 7. Cost Considerations

### 7.1 Infrastructure Costs

**Vector Database (Pinecone)**:
- Starter Plan: $70/month (1M vectors, 1 index)
- Standard Plan: $200/month (10M vectors, 5 indexes)
- **Recommendation**: Start with Starter Plan, sufficient for SIMISAI compliance docs

**Alternative: pgvector Extension**:
- Free (uses existing SIMISAI RDS PostgreSQL)
- Pros: No additional cost, data locality
- Cons: Slower than dedicated vector DB, less scalable
- **Recommendation**: Use for MVP, migrate to Pinecone if performance issues

**Claude API Costs**:
- Claude 3 Sonnet: $3/MTok input, $15/MTok output
- Estimated cost per compliance run: ~$2-5 (depends on doc size)
- Monthly cost (4 runs): ~$10-20
- **Recommendation**: Use Sonnet for routine checks, Opus for critical analysis

**AWS Lambda**:
- Compliance agent runtime: ~2-5 minutes per run
- Estimated cost: $0.50-1.00 per run
- Monthly cost (4 runs): ~$2-4

**Total Monthly Cost**:
- MVP (pgvector + Sonnet): $10-20
- Production (Pinecone Starter + Sonnet): $80-100
- Enterprise (Pinecone Standard + Opus): $220-250

### 7.2 Cost Optimization Strategies

1. **Cache embeddings**: Don't re-embed unchanged documents
2. **Batch processing**: Run compliance checks in batches vs. per-requirement
3. **Selective analysis**: Focus on changed requirements only
4. **Local models**: Use open-source embedding models (sentence-transformers) instead of OpenAI embeddings
5. **Incremental updates**: Only re-index changed SIMISAI documents

---

## 8. Next Steps for SIMISAI

### 8.1 Immediate Actions (Week 1-2)

1. **Download HSA Documents**
   - GN-13 Risk Classification Guide
   - SaMD Regulatory Guidelines (updated 2025)
   - ASEAN CSDT Template
   - Class B registration requirements

2. **Setup Development Environment**
   - Install Python dependencies
   - Configure Anthropic API key
   - Setup local vector database (pgvector)

3. **Run Initial Compliance Scan**
   - Ingest HSA documents
   - Ingest SIMISAI /docs/ directory
   - Generate first compliance report

### 8.2 Short-Term Goals (Month 1-2)

1. **Address Critical Gaps**
   - Prioritize gaps blocking Class B registration
   - Create missing documents (CER, Risk Analysis, Cybersecurity)
   - Update SIMISAI documentation

2. **Build Compliance Dashboard**
   - Integrate React component into SIMISAI admin
   - Add API endpoints to Express backend
   - Deploy Lambda function for agent

3. **Establish Compliance Workflow**
   - Monthly compliance scans
   - Document version control
   - Gap tracking and remediation workflow

### 8.3 Long-Term Goals (Month 3-6)

1. **HSA Registration Preparation**
   - Complete all Class B documentation requirements
   - Appoint Singapore authorized representative
   - Prepare CSDT submission package

2. **Continuous Compliance Monitoring**
   - Automated HSA guidance updates
   - Pre-release compliance checks
   - Integration with CI/CD pipeline

3. **Expansion to Other Jurisdictions**
   - Adapt agent for other ASEAN countries
   - FDA compliance checking (if expanding to US)
   - CE marking compliance (if expanding to EU)

---

## 9. Conclusion

Building an HSA regulatory compliance agent for SIMISAI provides significant value:

**Benefits:**
- **Automation**: Reduces manual compliance checking from weeks to hours
- **Accuracy**: AI-powered analysis catches gaps humans might miss
- **Traceability**: Clear citations and evidence trails for audits
- **Proactive**: Identifies issues before HSA review
- **Cost-Effective**: Reduces regulatory consultant costs
- **Scalable**: Easy to adapt for other jurisdictions

**Technical Feasibility:**
- Leverages existing SIMISAI infrastructure (PostgreSQL, AWS, React)
- Uses proven frameworks (LlamaIndex, Claude API)
- Modular architecture allows incremental implementation
- Low ongoing costs ($10-100/month)

**Regulatory Impact:**
- Accelerates HSA Class B registration timeline
- Reduces risk of registration rejection
- Provides audit trail for regulatory submissions
- Demonstrates compliance diligence to HSA reviewers

**Recommendation**: Prioritize building this agent as it directly supports SIMISAI's go-to-market strategy in Singapore and provides a competitive advantage in regulatory compliance.

---

## Appendix A: HSA Resource Links

- **HSA Official Website**: https://www.hsa.gov.sg/medical-devices
- **Medical Device Registration**: https://www.hsa.gov.sg/medical-devices/how-to-register
- **GN-13 Guidance**: Search HSA website for "GN-13 Risk Classification"
- **SaMD Guidelines**: Search HSA website for "Software Medical Device Guidelines"
- **ASEAN CSDT**: Search HSA website for "ASEAN Common Submission Dossier Template"

## Appendix B: Technical References

- **LlamaIndex Documentation**: https://docs.llamaindex.ai/
- **Claude API Documentation**: https://docs.anthropic.com/
- **Pinecone Documentation**: https://docs.pinecone.io/
- **pgvector Documentation**: https://github.com/pgvector/pgvector
- **PyMuPDF Documentation**: https://pymupdf.readthedocs.io/
- **camelot-py Documentation**: https://camelot-py.readthedocs.io/

## Appendix C: Compliance Agent Code Repository

All code examples from this document are available in:
```
/home/runner/workspace/compliance_agent/
├── ingestion/
│   └── hsa_document_loader.py
├── vector_store/
│   └── setup.py
├── agent/
│   └── hsa_compliance_agent.py
└── requirements.txt
```

---

**Document Version**: 1.0
**Last Updated**: 2025-12-02
**Author**: SIMISAI Medical Device Research Specialist
**Status**: Draft - Ready for Implementation
