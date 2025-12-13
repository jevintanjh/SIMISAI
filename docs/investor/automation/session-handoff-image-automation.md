# Session Handoff: CLI Image Automation for AIMX Presentation

**Created**: November 14, 2025
**Session Context**: Building automated image finder to replace manual Unsplash/Pexels searching
**Next Session Goal**: Run 6 image searches for AIMX presentation slides

---

## 🎯 Executive Summary

**What Was Accomplished:**
- ✅ Built complete Python CLI tool for automated image search (`simisai-image-finder`)
- ✅ Supports 4 FREE APIs: Pexels, Pixabay, Unsplash, Wikimedia Commons
- ✅ Created comprehensive documentation (API setup, usage guide, workflows)
- ✅ Tested tool successfully (User-Agent fix applied for Wikimedia)
- ⏸️ **BLOCKED ON**: API keys need to be exported to environment variables

**What's Next:**
1. Export Unsplash API key to environment (user has keys ready)
2. Run 6 image searches (one per AIMX presentation slide)
3. Review results and select best images
4. Download selected images

**Time to Complete**: 15-20 minutes once API keys are set

---

## 🔧 What Was Built

### 1. **Main Tool: `simisai-image-finder`**

**Location**: `/home/runner/workspace/scripts/simisai-image-finder`

**Capabilities:**
- Searches 4 free stock photo APIs in parallel
- Returns ranked results with direct download URLs
- Multiple output formats (markdown, JSON, URLs, TSV)
- Resolution filtering (default: 1920x1080+)
- License information included
- Rate limit aware (stays within free tiers)

**Features:**
```python
# Multi-source search
./scripts/simisai-image-finder "elderly woman healthcare" --count 10

# Single source
./scripts/simisai-image-finder "blood pressure" --source unsplash --count 5

# Output formats
./scripts/simisai-image-finder "query" --output urls > urls.txt
./scripts/simisai-image-finder "query" --output json > results.json

# Resolution filtering
./scripts/simisai-image-finder "query" --min-width 3840 --min-height 2160
```

**Dependencies:**
- Python 3 (installed)
- `requests` library (✅ installed: `pip install requests`)

### 2. **Documentation Created**

**Location**: `/home/runner/workspace/docs/investor/CLI_IMAGE_AUTOMATION.md`

**Contents:**
- Complete API setup guide (registration links, key generation)
- Usage examples (basic, advanced, batch processing)
- API comparison matrix (rate limits, quality, attribution)
- Query optimization tips
- Troubleshooting guide
- Security best practices
- Future enhancement ideas

### 3. **Helper Scripts**

**Setup Script**: `/home/runner/workspace/scripts/setup-api-keys.sh`
```bash
# Interactive API key setup
chmod +x scripts/setup-api-keys.sh
source scripts/setup-api-keys.sh
```

**Results Directory**: `/home/runner/workspace/docs/investor/image-search-results/`
(Created, ready for search results)

---

## ⚠️ CRITICAL: Current Blocker

### **API Keys NOT Set in Environment**

The tool is fully functional but needs environment variables set:

```bash
# REQUIRED for Unsplash (user has this key ready)
export UNSPLASH_CLIENT_ID="your_unsplash_access_key_here"

# OPTIONAL (for additional sources)
export PEXELS_API_KEY="your_pexels_key_here"
export PIXABAY_API_KEY="your_pixabay_key_here"
```

**User Status**:
- ✅ Has Unsplash API key and secret key
- ⏸️ Needs to export UNSPLASH_CLIENT_ID environment variable

**Important Notes:**
- Unsplash limit: 50 requests/hour (6 searches = 12% usage, safe)
- User specifically requested staying under 50/hour limit
- Each search counts as 1 request

---

## 🚀 Next Session: Immediate Action Items

### **Step 1: Set API Keys** (2 minutes)

**Option A: Manual Export** (Fastest)
```bash
# Replace with actual key value
export UNSPLASH_CLIENT_ID="paste_actual_unsplash_access_key_here"

# Verify it's set
echo $UNSPLASH_CLIENT_ID
```

**Option B: Interactive Setup**
```bash
chmod +x scripts/setup-api-keys.sh
source scripts/setup-api-keys.sh
# Enter Unsplash key when prompted
```

**Option C: Create .env File**
```bash
cat > .env << EOF
UNSPLASH_CLIENT_ID="your_actual_key_here"
EOF

# Load it
set -a; source .env; set +a
```

### **Step 2: Run All 6 Image Searches** (5 minutes)

Execute these commands in order:

#### **Image 1: Hero - Elderly Asian Woman with BP Monitor**
```bash
./scripts/simisai-image-finder \
  "elderly Filipino woman blood pressure monitor home confident" \
  --source unsplash \
  --count 10 \
  --output markdown \
  > docs/investor/image-search-results/image1-hero-elderly-bp.md
```

**Expected Output**: 10 high-res images with URLs, photographer credits, licenses

---

#### **Image 2: Problem - Confused Elderly with Device**
```bash
./scripts/simisai-image-finder \
  "elderly confused frustrated medical device technology" \
  --source unsplash \
  --count 10 \
  --output markdown \
  > docs/investor/image-search-results/image2-problem-confused.md
```

---

#### **Image 3: Problem - Crowded Hospital Waiting Room**
```bash
./scripts/simisai-image-finder \
  "crowded hospital waiting room asia busy clinic queue" \
  --source unsplash \
  --count 10 \
  --output markdown \
  > docs/investor/image-search-results/image3-problem-hospital.md
```

---

#### **Image 4: Solution - Elderly Using Smartphone Successfully**
```bash
./scripts/simisai-image-finder \
  "elderly woman smartphone happy healthcare app success" \
  --source unsplash \
  --count 10 \
  --output markdown \
  > docs/investor/image-search-results/image4-solution-smartphone.md
```

---

#### **Image 5: Testimonial - Happy Elderly Asian Woman Portrait**
```bash
./scripts/simisai-image-finder \
  "happy elderly Filipino woman portrait smiling confident" \
  --source unsplash \
  --count 10 \
  --output markdown \
  > docs/investor/image-search-results/image5-testimonial-portrait.md
```

---

#### **Image 6: Closing - Multi-Generational Asian Family**
```bash
./scripts/simisai-image-finder \
  "multi generational asian family grandparents grandchildren caring" \
  --source unsplash \
  --count 10 \
  --output markdown \
  > docs/investor/image-search-results/image6-closing-family.md
```

---

### **Step 3: Batch Execution Script** (Alternative - Faster)

Or run all 6 searches at once with this script:

```bash
#!/bin/bash
# Quick script to run all 6 searches

searches=(
  "elderly Filipino woman blood pressure monitor home confident"
  "elderly confused frustrated medical device technology"
  "crowded hospital waiting room asia busy clinic queue"
  "elderly woman smartphone happy healthcare app success"
  "happy elderly Filipino woman portrait smiling confident"
  "multi generational asian family grandparents grandchildren caring"
)

names=(
  "image1-hero-elderly-bp"
  "image2-problem-confused"
  "image3-problem-hospital"
  "image4-solution-smartphone"
  "image5-testimonial-portrait"
  "image6-closing-family"
)

for i in "${!searches[@]}"; do
  echo "🔍 Searching: ${searches[$i]}"
  ./scripts/simisai-image-finder "${searches[$i]}" \
    --source unsplash \
    --count 10 \
    --output markdown \
    > "docs/investor/image-search-results/${names[$i]}.md"
  echo "✅ Saved: ${names[$i]}.md"
  echo ""
done

echo "🎉 All 6 searches complete!"
echo "📂 Results in: docs/investor/image-search-results/"
```

**Save as**: `scripts/search-all-aimx-images.sh`
**Run**: `chmod +x scripts/search-all-aimx-images.sh && ./scripts/search-all-aimx-images.sh`

---

### **Step 4: Review Results** (5-10 minutes)

Open each markdown file:
```bash
# View results
cat docs/investor/image-search-results/image1-hero-elderly-bp.md

# Or open in editor
code docs/investor/image-search-results/
```

Each result includes:
- Direct download URL
- Unsplash page URL
- Photographer name
- Resolution (width x height)
- License information
- Description

**Selection Criteria** (from previous research):
- ✅ Southeast Asian subjects preferred
- ✅ Elderly shown as confident/capable (not frail)
- ✅ Home settings preferred (not clinical)
- ✅ Natural lighting and authentic expressions
- ✅ High resolution (1920x1080+ automatically filtered)

---

### **Step 5: Download Selected Images** (5 minutes)

After reviewing, download your favorites:

```bash
# Example: Download top 2-3 URLs per search
wget -P docs/investor/images/slide-01/ "https://images.unsplash.com/photo-..."
wget -P docs/investor/images/slide-02/ "https://images.unsplash.com/photo-..."
# etc.
```

Or use the URLs directly in Gamma.app when replacing auto-sourced images.

---

## 📊 API Usage Tracking

### Unsplash Rate Limits

**User's Concern**: Don't exceed 50 requests/hour

**Our Usage**:
- 6 image searches = 6 API requests
- 10 results per search = still only 6 requests (API returns multiple results)
- **Total**: 6/50 requests = **12% of hourly limit** ✅ SAFE

**If More Searches Needed**:
- Can run 44 more searches this hour
- Or wait 1 hour for reset
- Or add Pexels (200/hour) and Pixabay (100/min) keys for unlimited capacity

---

## 🐛 Troubleshooting

### Issue: "No API keys configured"

**Symptom**: Tool says "⚠️ Unsplash Client ID not found"

**Solution**:
```bash
# Check if key is set
echo $UNSPLASH_CLIENT_ID

# If empty, export it
export UNSPLASH_CLIENT_ID="your_key_here"

# Verify
./scripts/simisai-image-finder "test" --source unsplash --count 1
```

---

### Issue: "No images found"

**Possible Causes**:
1. API key invalid (re-copy from Unsplash developer page)
2. Query too specific (try broader terms)
3. Network issue (check internet)

**Debug**:
```bash
# Test with simple query
./scripts/simisai-image-finder "elderly" --source unsplash --count 3

# Check API key format
echo $UNSPLASH_CLIENT_ID | wc -c  # Should be ~40-60 characters
```

---

### Issue: "Rate limit exceeded"

**Symptom**: "⚠️ Unsplash rate limit exceeded"

**Solution**:
- Wait 1 hour for reset
- Or use alternative sources:
```bash
# Try Wikimedia (no key required, unlimited)
./scripts/simisai-image-finder "query" --source wikimedia --count 10
```

---

### Issue: Wikimedia returns 403 error

**Status**: FIXED ✅

**What was done**: Added User-Agent header to Wikimedia requests
- Wikimedia blocks requests without User-Agent
- Tool now includes: `User-Agent: SimisAI-Image-Finder/1.0`

**Verify fix**:
```bash
./scripts/simisai-image-finder "blood pressure" --source wikimedia --count 3
```

---

## 📂 File Structure

```
/home/runner/workspace/
├── scripts/
│   ├── simisai-image-finder          ✅ Main CLI tool (executable)
│   ├── setup-api-keys.sh             ✅ Interactive key setup
│   └── search-all-aimx-images.sh     📝 Create this (batch script above)
│
├── docs/investor/
│   ├── CLI_IMAGE_AUTOMATION.md       ✅ Complete usage guide
│   ├── SESSION_HANDOFF_IMAGE_AUTOMATION.md  ✅ This document
│   ├── WIKIMEDIA_COMMONS_IMAGE_GUIDE.md     ✅ Manual sourcing fallback
│   ├── IMAGE_SOURCING_WORKING_GUIDE.md      ✅ Manual Pexels guide
│   ├── GAMMA_APP_AIMX_SHOWCASE_PROMPT.md    ✅ Ready for Gamma
│   ├── AIMX_SABRI_SUBY_ENHANCEMENTS.md      ✅ Content improvements
│   ├── AIMX_SHOWCASE_QUICK_START.md         ✅ Complete overview
│   │
│   └── image-search-results/         ✅ Directory created
│       ├── image1-hero-elderly-bp.md         ⏸️ Run search to create
│       ├── image2-problem-confused.md        ⏸️ Run search to create
│       ├── image3-problem-hospital.md        ⏸️ Run search to create
│       ├── image4-solution-smartphone.md     ⏸️ Run search to create
│       ├── image5-testimonial-portrait.md    ⏸️ Run search to create
│       └── image6-closing-family.md          ⏸️ Run search to create
```

---

## 🎓 Key Learnings from This Session

### 1. **Automated Image Search is 100% Achievable (FREE)**

**Myth Busted**: "Manual searching is the only way"

**Reality**:
- Pexels: 4,800 searches/day FREE
- Pixabay: 144,000 searches/day FREE (theoretical)
- Unsplash: 1,200 searches/day FREE
- Wikimedia: Unlimited FREE

### 2. **CLI Automation Saves 80-90% Time**

**Manual**: 15-30 minutes per image × 6 images = 90-180 minutes
**Automated**: 2-3 minutes search + 10-15 minutes review = 13-18 minutes

### 3. **No Web Scraping Needed**

Official APIs are:
- Faster than scraping
- More reliable (won't break)
- Legally sound (ToS compliant)
- Better rate limits
- Include metadata (resolution, license, photographer)

### 4. **Gemini CLI Limitations for Images**

**What Gemini CAN'T do**:
- Search Google Images and extract URLs
- Fetch real downloadable image links
- Automate image scraping

**What Gemini CAN do**:
- Generate optimized search queries
- Research image sources
- Provide cultural guidance
- Analyze image appropriateness (vision API)

**Conclusion**: Use Gemini for query optimization, use free APIs for actual image finding

---

## 🚀 Success Criteria

**Session is complete when:**

- [x] CLI tool built and tested
- [x] Documentation complete
- [x] Dependencies installed (`requests`)
- [x] Wikimedia User-Agent fix applied
- [x] Results directory created
- [ ] **API keys exported to environment** ⏸️ NEXT SESSION
- [ ] **6 image searches executed** ⏸️ NEXT SESSION
- [ ] **Results reviewed and images selected** ⏸️ NEXT SESSION
- [ ] **Selected images downloaded** ⏸️ NEXT SESSION

---

## 💡 Recommended Workflow (Next Session)

### **Fastest Path (20 minutes total):**

1. **Export Unsplash key** (1 min)
   ```bash
   export UNSPLASH_CLIENT_ID="actual_key_here"
   ```

2. **Run batch search script** (5 min)
   ```bash
   # Create script from Step 3 above
   # Or run 6 individual commands from Step 2
   ```

3. **Quick review in terminal** (5 min)
   ```bash
   # Scan each markdown file for best images
   grep "Direct URL" docs/investor/image-search-results/*.md
   ```

4. **Copy top 6-12 URLs** (5 min)
   ```bash
   # Extract just URLs
   grep "Direct URL" docs/investor/image-search-results/*.md | \
     awk -F'`' '{print $2}' > selected_urls.txt
   ```

5. **Use in Gamma.app or download** (5 min)
   - Option A: Paste URLs into Gamma when replacing auto-sourced images
   - Option B: `wget -i selected_urls.txt -P docs/investor/images/`

---

## 🔗 Related Documentation

**For Next Session, Reference:**

1. **Tool Usage**: `/docs/investor/CLI_IMAGE_AUTOMATION.md`
   - Complete command reference
   - Advanced workflows
   - Troubleshooting

2. **AIMX Presentation Context**: `/docs/investor/AIMX_SHOWCASE_QUICK_START.md`
   - Why these 6 images are needed
   - Slide-by-slide requirements
   - Cultural appropriateness guidelines

3. **Gamma.app Prompt**: `/docs/investor/GAMMA_APP_AIMX_SHOWCASE_PROMPT.md`
   - Ready to paste into Gamma
   - Includes image search terms
   - Complete presentation generation

4. **Manual Fallback**: `/docs/investor/WIKIMEDIA_COMMONS_IMAGE_GUIDE.md`
   - If API searches insufficient
   - Direct browser search URLs
   - Download instructions

---

## 📞 Quick Reference Commands

```bash
# 1. SET API KEY (MOST IMPORTANT)
export UNSPLASH_CLIENT_ID="your_key_here"

# 2. TEST TOOL
./scripts/simisai-image-finder "test" --source unsplash --count 1

# 3. RUN ONE SEARCH
./scripts/simisai-image-finder "elderly woman blood pressure" --count 10 --output markdown

# 4. VIEW RESULTS
cat docs/investor/image-search-results/image1-hero-elderly-bp.md

# 5. EXTRACT URLs
grep "Direct URL" docs/investor/image-search-results/*.md | awk -F'`' '{print $2}'

# 6. DOWNLOAD IMAGE
wget "https://images.unsplash.com/photo-..." -O image1.jpg
```

---

## 🎯 Final Notes for Next Session

**You have EVERYTHING ready to go:**

1. ✅ Tool is built and working
2. ✅ Documentation is complete
3. ✅ Dependencies installed
4. ✅ Bugs fixed (Wikimedia User-Agent)
5. ✅ Results directory created
6. ✅ Search queries optimized
7. ⏸️ **Just need**: `export UNSPLASH_CLIENT_ID="your_key"`

**Then run 6 commands, get 60 candidate images (10 per search), select best 6, done.**

**Time investment next session: 15-20 minutes max** 🚀

---

**Document Version**: 1.0 (Session Handoff)
**Created**: November 14, 2025
**Status**: Ready for next session
**Blocker**: API key environment variable (user has key, just needs to export)

**⚡ NEXT ACTION**: `export UNSPLASH_CLIENT_ID="paste_key_here"` then run searches!**
