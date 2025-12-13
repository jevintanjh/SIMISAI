# Repository Cleanup Action Plan
**Quick Reference for Immediate Actions**

**Audit Date:** 2025-12-02
**Full Report:** `/home/runner/workspace/docs/archived/REPOSITORY-CLEANUP-AUDIT-2025-12-02.md`

---

## Status: ✅ REPOSITORY IS PRODUCTION-READY

The repository is clean and well-organized. These are optional improvements for maximum cleanliness.

---

## High Priority (5-10 minutes)

### 1. Track New Documentation
```bash
cd /home/runner/workspace
git add docs/deployment/BEDROCK-VERIFICATION-REPORT.md
git add docs/archived/CLEANUP-SUMMARY-2025-12-01.md
git add docs/archived/REPOSITORY-CLEANUP-AUDIT-2025-12-02.md
git add scripts/search-all-aimx-images.sh
git add scripts/simisai-image-finder
git commit -m "docs: Add cleanup audit and track new documentation

- Add comprehensive repository cleanup audit (2025-12-02)
- Track Bedrock verification report
- Track cleanup summary from Dec 1
- Track image search utility scripts

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 2. Archive Database Setup Scripts
```bash
cd /home/runner/workspace
mkdir -p docs/archived/database-setup
git mv generate-phase1-content.js docs/archived/database-setup/
git mv generate-phase2-content.js docs/archived/database-setup/
git mv phase1-content.sql docs/archived/database-setup/
git mv phase2-content.sql docs/archived/database-setup/
git add docs/archived/database-setup/
git commit -m "refactor: Archive one-time database setup scripts

Move initial database content generation scripts to archive:
- generate-phase1-content.js (9.7 KB)
- generate-phase2-content.js (29 KB)
- phase1-content.sql (15 KB)
- phase2-content.sql (52 KB)

Database is already initialized; these are preserved for reference.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 3. Clean Duplicate Archives
```bash
cd /home/runner/workspace

# Check Archive.zip contents first
unzip -l Archive.zip | head -20

# If it's duplicate/unnecessary, remove it and auto-generated copies
rm -f Archive.zip
rm -f attached_assets/Archive_1758275497269.zip
rm -f aws-deployment/deployment-ready/Archive_1758275497269.zip
rm -f dist/Archive_1758275497269.zip

# Commit cleanup
git add -A
git commit -m "chore: Remove duplicate archive files

Remove Archive.zip and auto-generated duplicates:
- Archive.zip (39 KB)
- Archive_1758275497269.zip (3 duplicates)

Space saved: ~200 KB

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Medium Priority (Optional - 15 minutes)

### 4. Archive Test HTML Files
```bash
cd /home/runner/workspace
mkdir -p docs/archived/test-artifacts
git mv chat-test.html docs/archived/test-artifacts/
git mv test-frontend-chat.html docs/archived/test-artifacts/
git mv aws-deployment/hackathon-status.html docs/archived/test-artifacts/
git add docs/archived/test-artifacts/
git commit -m "refactor: Archive test HTML files

Move development test files to archive:
- chat-test.html (5 KB)
- test-frontend-chat.html (18 KB)
- hackathon-status.html (3.7 KB)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 5. Archive Deprecated Scripts
```bash
cd /home/runner/workspace
git mv ealion-sagemaker-deploy docs/archived/scripts-old/
git mv extract_pdf_content.py docs/archived/scripts-old/
git rm sagemaker-sealion  # Empty/broken file
git rm claude-bed  # Duplicate of .claude-aliases.sh functionality

git add docs/archived/scripts-old/
git commit -m "refactor: Archive deprecated scripts

Archive old deployment and utility scripts:
- ealion-sagemaker-deploy (17 KB) - Old deployment
- extract_pdf_content.py (1.2 KB) - One-time utility
- sagemaker-sealion (62 bytes) - Empty file
- claude-bed (1.3 KB) - Superseded by .claude-aliases.sh

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 6. Clean Old Lambda Deployment ZIPs
```bash
cd /home/runner/workspace/aws-deployment

# Check deployment archives
ls -lh simis-deployment-*.zip
ls -lh lambda/*/hybrid-deployment*.zip
ls -lh lambda/*/status-deployment*.zip

# Keep most recent 2-3, archive old ones
mkdir -p docs/archived/lambda-deployments

# Example (verify dates first):
mv simis-deployment-20250919-101619.zip ../docs/archived/lambda-deployments/

# Commit
git add -A
git commit -m "chore: Archive old Lambda deployment archives

Move old deployment ZIPs to archive, keep recent versions.
Space saved: ~700 KB

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Low Priority (Optional)

### 7. Update .gitignore
Add these patterns to prevent future accumulation:
```bash
cat >> .gitignore << 'EOF'

# Auto-generated archive files
Archive_*.zip

# Old deployment archives (keep in docs/archived/)
*-deployment-*.zip
simis-deployment-*.zip
EOF

git add .gitignore
git commit -m "chore: Update .gitignore for auto-generated archives"
```

### 8. Merge CVFix to Main
```bash
cd /home/runner/workspace
git checkout main
git pull origin main
git merge CVFix
git push origin main
```

---

## Space Savings Summary

| Action | Space Saved | Priority |
|--------|-------------|----------|
| Remove duplicate archives | ~200 KB | High |
| Archive old deployment ZIPs | ~700 KB | Medium |
| Archive test HTML files | ~30 KB | Medium |
| Archive deprecated scripts | ~50 KB | Medium |
| **Total Immediate Savings** | **~1 MB** | - |

---

## Medical Platform Safety Verification

**ALL MEDICAL DEVICE CODE PRESERVED ✅**

- ✅ Computer vision services (4 implementations)
- ✅ AI medical guidance (hybrid LLM service)
- ✅ Medical device database schema (24 devices, 5 languages)
- ✅ Accessibility features (screen reader, keyboard nav)
- ✅ Medical compliance documentation
- ✅ AWS deployment configurations

**No production impact from cleanup actions.**

---

## Verification Commands

After completing actions, verify repository health:

```bash
# Check git status
git status

# Verify no credentials exposed
grep -r "AKIA\|sk-\|aws_access_key" --include="*.js" --include="*.ts" --exclude-dir=node_modules

# Check repository size
du -sh /home/runner/workspace
du -sh /home/runner/workspace/node_modules
du -sh /home/runner/workspace/.git

# Verify core files intact
ls -la server/*.ts
ls -la shared/schema.ts
find src -name "*.tsx" | wc -l

# Run type checking
pnpm run check

# Test build
pnpm run build
```

---

## Decision Points

**Before proceeding, decide:**

1. **Archive.zip**: Check contents, then delete if unnecessary
   ```bash
   unzip -l Archive.zip
   ```

2. **Old deployment ZIPs**: Which versions to keep?
   - Recommend: Keep last 2-3 per service
   - Archive: Older versions to `docs/archived/lambda-deployments/`

3. **Test HTML files**: Keep any for active testing?
   - If still using: Keep in root
   - If obsolete: Archive to `docs/archived/test-artifacts/`

4. **Deprecated scripts**: Any still needed?
   - `ealion-sagemaker-deploy`: Old deployment method
   - `extract_pdf_content.py`: PDF extraction utility
   - `sagemaker-sealion`: Empty file (safe to delete)
   - `claude-bed`: Superseded by `.claude-aliases.sh`

---

## Summary

**Current Status:** ✅ Repository is production-ready
**Cleanup Impact:** Minimal (~1 MB) with high organization benefit
**Medical Safety:** ✅ All medical device code preserved
**Estimated Time:** 5-25 minutes (depending on priority level)

**Recommended:** Execute High Priority actions (Steps 1-3) immediately.

---

**Full Audit Report:** `/home/runner/workspace/docs/archived/REPOSITORY-CLEANUP-AUDIT-2025-12-02.md`
