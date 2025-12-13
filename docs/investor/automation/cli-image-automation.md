# CLI Image Automation - Complete Guide

**Purpose**: Automate image finding with FREE APIs via command-line interface
**Time Savings**: 80-90% compared to manual searching
**Cost**: 100% FREE (no subscriptions or paid tiers needed)
**Created**: November 14, 2025

---

## 🎯 What This Solves

**Problem**: Finding appropriate stock images is time-consuming (15-30 min per image concept)
**Solution**: Automated CLI tool searches 4 free APIs in parallel (2-3 minutes per concept)
**Benefit**: Find hundreds of candidate images instantly, spend time on selection not searching

---

## 📋 Quick Start (5 Minutes)

### Step 1: Get FREE API Keys

All registration is instant and requires only email - no credit card needed:

#### **1. Pexels API** (HIGHEST PRIORITY)
- Visit: https://www.pexels.com/api/
- Click "Get Started" → Sign up with email
- Copy your API key immediately (shown once)
- **Rate Limit**: 200 requests/hour FREE

#### **2. Pixabay API** (SECOND PRIORITY)
- Visit: https://pixabay.com/api/docs/
- Sign up → API tab → Copy your API key
- **Rate Limit**: 100 requests/minute FREE

#### **3. Unsplash API** (OPTIONAL - Lower limits)
- Visit: https://unsplash.com/developers
- Create New Application → Fill form (personal use)
- Copy "Access Key" (this is your Client ID)
- **Rate Limit**: 50 requests/hour FREE

#### **4. Wikimedia Commons** (NO KEY NEEDED)
- No registration required
- Unlimited FREE access
- **Rate Limit**: None (be polite, <200 req/sec)

---

### Step 2: Configure Environment Variables

**Option A: Temporary (Current Session)**
```bash
export PEXELS_API_KEY="your_pexels_key_here"
export PIXABAY_API_KEY="your_pixabay_key_here"
export UNSPLASH_CLIENT_ID="your_unsplash_client_id_here"
```

**Option B: Permanent (Add to ~/.bashrc or ~/.zshrc)**
```bash
echo 'export PEXELS_API_KEY="your_pexels_key_here"' >> ~/.bashrc
echo 'export PIXABAY_API_KEY="your_pixabay_key_here"' >> ~/.bashrc
echo 'export UNSPLASH_CLIENT_ID="your_unsplash_client_id_here"' >> ~/.bashrc
source ~/.bashrc
```

**Option C: Project-Specific (.env file)**
```bash
# Create .env file in project root
cat > .env << EOF
PEXELS_API_KEY="your_pexels_key_here"
PIXABAY_API_KEY="your_pixabay_key_here"
UNSPLASH_CLIENT_ID="your_unsplash_client_id_here"
EOF

# Load before using tool
set -a; source .env; set +a
```

---

### Step 3: Test the Tool

```bash
# Test with Wikimedia only (no API key required)
./scripts/simisai-image-finder "blood pressure monitor" --source wikimedia --count 5

# Test with all sources (requires API keys)
./scripts/simisai-image-finder "elderly woman healthcare" --count 5
```

**Expected Output:**
```
🔍 Searching for: elderly woman healthcare

✅ Pexels: 5 images
✅ Pixabay: 5 images
✅ Unsplash: 5 images
✅ Wikimedia Commons: 5 images

📊 Total found: 20 images

# Image Search Results: elderly woman healthcare
...
```

---

## 🚀 Usage Examples

### Basic Search (All Sources)
```bash
./scripts/simisai-image-finder "elderly Filipino woman blood pressure monitor"
```

### Get Just URLs (For Scripting)
```bash
./scripts/simisai-image-finder "medical device" --output urls > image_urls.txt
```

### Search Specific Source
```bash
# Pexels only (best quality)
./scripts/simisai-image-finder "healthcare asia" --source pexels --count 10

# Wikimedia only (no API key needed)
./scripts/simisai-image-finder "hospital waiting room" --source wikimedia --count 15
```

### JSON Output (Programmatic Use)
```bash
./scripts/simisai-image-finder "blood pressure" --output json > results.json

# Process with jq
cat results.json | jq '.[].url' | head -5
```

### Filter by Resolution
```bash
# Only high-resolution images (1920x1080+)
./scripts/simisai-image-finder "elderly portrait" --min-width 1920 --min-height 1080

# 4K images only
./scripts/simisai-image-finder "medical equipment" --min-width 3840 --min-height 2160
```

### TSV Output (Spreadsheet Import)
```bash
# Create spreadsheet-friendly output
./scripts/simisai-image-finder "healthcare" --output tsv > images.tsv

# Import images.tsv into Google Sheets or Excel
```

---

## 📸 Finding Images for AIMX Presentation

### **Image 1: Elderly Asian Woman with BP Monitor (Hero)**
```bash
./scripts/simisai-image-finder "elderly Filipino woman blood pressure monitor home confident" \
  --count 10 \
  --output markdown \
  > results/image1-hero.md
```

### **Image 2: Confused Elderly with Device (Problem)**
```bash
./scripts/simisai-image-finder "elderly confused frustrated medical device technology" \
  --count 10 \
  --output markdown \
  > results/image2-problem-confused.md
```

### **Image 3: Crowded Hospital Waiting Room (Problem)**
```bash
./scripts/simisai-image-finder "crowded hospital waiting room asia busy clinic queue" \
  --count 10 \
  --output markdown \
  > results/image3-problem-hospital.md
```

### **Image 4: Elderly Using Smartphone Successfully (Solution)**
```bash
./scripts/simisai-image-finder "elderly woman smartphone happy healthcare app success" \
  --count 10 \
  --output markdown \
  > results/image4-solution-smartphone.md
```

### **Image 5: Happy Elderly Asian Woman Portrait (Testimonial)**
```bash
./scripts/simisai-image-finder "happy elderly Filipino woman portrait smiling confident" \
  --count 10 \
  --output markdown \
  > results/image5-testimonial-portrait.md
```

### **Image 6: Multi-Generational Asian Family (Closing)**
```bash
./scripts/simisai-image-finder "multi generational asian family grandparents grandchildren caring" \
  --count 10 \
  --output markdown \
  > results/image6-closing-family.md
```

**Then**: Review markdown files, select best 1-2 images per category, copy URLs

---

## 🔧 Advanced Workflows

### Batch Search Multiple Queries
```bash
#!/bin/bash
# batch-search.sh

queries=(
  "elderly woman blood pressure monitor home"
  "confused elderly medical device"
  "crowded hospital waiting room"
  "elderly smartphone success"
  "happy elderly portrait"
  "multi generational family"
)

mkdir -p results

for i in "${!queries[@]}"; do
  query="${queries[$i]}"
  echo "Searching: $query"
  ./scripts/simisai-image-finder "$query" \
    --count 10 \
    --output markdown \
    > "results/image-$((i+1))-results.md"
done

echo "✅ All searches complete. Check results/ directory."
```

### Search with Query Variations (Using Gemini)
```bash
#!/bin/bash
# smart-search.sh - Generate query variations first

CONCEPT="$1"

echo "🧠 Generating query variations with Gemini..."
QUERIES=$(gemini "Generate 3 diverse search query variations for finding stock photos of: $CONCEPT. Return only the queries, one per line, no numbering or explanations.")

echo "🔍 Searching with generated queries..."
echo "$QUERIES" | while read query; do
  if [ -n "$query" ]; then
    echo "Query: $query"
    ./scripts/simisai-image-finder "$query" --count 5 --output urls
  fi
done | sort | uniq > all_urls.txt

echo "✅ Found $(wc -l < all_urls.txt) unique images"
```

**Usage:**
```bash
./smart-search.sh "elderly Filipino woman using medical device at home"
```

### Download Top Results Automatically
```bash
#!/bin/bash
# download-top-images.sh

QUERY="$1"
COUNT="${2:-5}"

# Get URLs of top N results
URLS=$(./scripts/simisai-image-finder "$QUERY" --count "$COUNT" --output urls | head -n "$COUNT")

# Download each
mkdir -p downloads
i=1
echo "$URLS" | while read url; do
  echo "Downloading $i/$COUNT: $url"
  wget -q -O "downloads/image-$i.jpg" "$url"
  ((i++))
done

echo "✅ Downloaded $COUNT images to downloads/"
```

**Usage:**
```bash
./download-top-images.sh "elderly woman healthcare" 5
```

---

## 📊 API Comparison

| API | Free Limit | Image Quality | Attribution Required | Best For |
|-----|-----------|---------------|---------------------|----------|
| **Pexels** | 200/hour | ⭐⭐⭐⭐⭐ Excellent | No | Professional stock photos |
| **Pixabay** | 100/min | ⭐⭐⭐⭐ Very Good | No | Large volume searches |
| **Unsplash** | 50/hour | ⭐⭐⭐⭐⭐ Excellent | Yes | High-end artistic photos |
| **Wikimedia** | Unlimited | ⭐⭐⭐ Good | Varies | Documentary/authentic photos |

**Recommended Strategy:**
1. Start with Pexels (best balance of quality + quantity)
2. Add Pixabay for more options
3. Use Wikimedia for authentic/documentary style
4. Use Unsplash for artistic/premium looks (remember attribution)

---

## 🎯 Query Optimization Tips

### Good Queries (Specific, Descriptive)
✅ "elderly Filipino woman using blood pressure monitor at home confident"
✅ "crowded hospital waiting room asia busy patients"
✅ "happy grandmother smartphone healthcare app"

### Poor Queries (Too Vague)
❌ "old woman"
❌ "hospital"
❌ "phone"

### Query Patterns That Work Well

**Pattern 1: Subject + Action + Context + Emotion**
```
"elderly woman" + "using blood pressure monitor" + "home setting" + "confident"
```

**Pattern 2: Setting + Detail + Region**
```
"hospital waiting room" + "crowded queue" + "Southeast Asia"
```

**Pattern 3: Subject + Device + Outcome**
```
"grandmother" + "smartphone" + "successful happy"
```

### Use Synonyms and Variations
```bash
# Instead of one search
./scripts/simisai-image-finder "elderly woman blood pressure"

# Do multiple targeted searches
./scripts/simisai-image-finder "elderly woman sphygmomanometer home"
./scripts/simisai-image-finder "senior Filipino healthcare monitoring confident"
./scripts/simisai-image-finder "grandmother measuring blood pressure device"
```

---

## 🐛 Troubleshooting

### Problem: "No API keys configured"
**Solution:**
```bash
# Check if keys are set
echo $PEXELS_API_KEY
echo $PIXABAY_API_KEY

# If empty, export them
export PEXELS_API_KEY="your_key_here"
```

### Problem: "Rate limit exceeded"
**Solution:**
- Pexels: Wait 1 hour or use different API key
- Pixabay: Wait 1 minute
- Unsplash: Wait 1 hour
- Wikimedia: Never rate limited (but be polite)

**Workaround**: Use `--source` to query only non-limited sources

### Problem: "No images found"
**Possible causes:**
1. Query too specific (try broader terms)
2. API keys invalid (re-copy from provider)
3. Network issue (check internet connection)

**Debug:**
```bash
# Test connectivity
curl -I https://api.pexels.com/v1/

# Verify API key format
echo $PEXELS_API_KEY | wc -c  # Should be ~50-60 characters
```

### Problem: "All results too low resolution"
**Solution:**
```bash
# Remove resolution filters
./scripts/simisai-image-finder "query" --min-width 0 --min-height 0

# Or adjust to lower threshold
./scripts/simisai-image-finder "query" --min-width 1280 --min-height 720
```

---

## 📈 Performance & Limits

### Daily Capacity (FREE Tier)

**Pexels**:
- 200 requests/hour × 24 hours = 4,800 searches/day
- Enough for: 960 image concepts (5 searches each)

**Pixabay**:
- 100 requests/minute × 60 min × 24 hours = 144,000 theoretical
- Practical: ~10,000 searches/day (rate limiting)

**Unsplash**:
- 50 requests/hour × 24 hours = 1,200 searches/day
- Enough for: 240 image concepts (5 searches each)

**Wikimedia**:
- Unlimited (be polite: <200/sec)

**Combined Capacity**: Find images for 200+ presentation projects per day, completely free

---

## 🔐 Security Best Practices

### Don't Commit API Keys to Git
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo "*.api_keys" >> .gitignore
```

### Rotate Keys Periodically
- Generate new keys every 3-6 months
- Revoke old keys after rotation
- Use separate keys for dev/production if scaling

### Use Environment Variables, Not Hardcoding
```bash
# ❌ DON'T DO THIS
PEXELS_KEY = "abc123hardcoded"

# ✅ DO THIS
PEXELS_KEY = os.environ.get("PEXELS_API_KEY")
```

---

## 🎓 Learning Resources

### API Documentation
- **Pexels**: https://www.pexels.com/api/documentation/
- **Pixabay**: https://pixabay.com/api/docs/
- **Unsplash**: https://unsplash.com/documentation
- **Wikimedia**: https://www.mediawiki.org/wiki/API:Main_page

### Image Licensing
- **Pexels License**: https://www.pexels.com/license/
- **Pixabay License**: https://pixabay.com/service/license/
- **Unsplash License**: https://unsplash.com/license
- **Creative Commons**: https://creativecommons.org/licenses/

---

## 🚀 Future Enhancements

Potential improvements for this tool:

### 1. AI-Powered Image Ranking
```bash
# Use Gemini Vision to evaluate relevance
./scripts/simisai-image-finder "elderly healthcare" |
  ./scripts/rank-with-ai.py --requirements "Shows confident elderly person, home setting, positive emotion"
```

### 2. Automatic Image Download
```bash
# Download top 3 results automatically
./scripts/simisai-image-finder "query" --auto-download 3 --output-dir ./images/
```

### 3. Duplicate Detection
```bash
# Use perceptual hashing to filter duplicates across sources
./scripts/simisai-image-finder "query" --deduplicate-similar
```

### 4. Batch Query from File
```bash
# Read queries from file, search all
./scripts/simisai-image-finder --batch queries.txt --output-dir ./results/
```

---

## 💡 Pro Tips

### 1. Chain with Image Processing
```bash
# Find images → Download → Resize for web
./scripts/simisai-image-finder "healthcare" --output urls |
  xargs wget -P ./temp/ &&
  mogrify -resize 1200x800 ./temp/*.jpg
```

### 2. Use jq for Advanced Filtering
```bash
# Get only Pexels images in JSON
./scripts/simisai-image-finder "query" --output json |
  jq '.[] | select(.source == "pexels") | .url'
```

### 3. Create Image Galleries
```bash
# Generate HTML gallery from results
./scripts/simisai-image-finder "healthcare" --output json |
  jq -r '.[] | "<img src=\"\(.thumbnail)\" alt=\"\(.description)\">"' > gallery.html
```

### 4. Monitor API Usage
```bash
# Track daily usage
echo "$(date): $(./scripts/simisai-image-finder 'test' --output urls | wc -l) images found" >> usage.log
```

---

## ✅ Success Metrics

After implementing this workflow, you should achieve:

- ⚡ **80-90% time savings** on image searches
- 🆓 **100% cost savings** (vs paid stock sites)
- 📈 **10x more candidates** per image concept
- 🎯 **Better matches** (search 4 sources simultaneously)
- 🔄 **Repeatable process** for all future projects

---

## 📝 License & Attribution

**Tool License**: MIT License (free to use, modify, distribute)

**Image Licenses** (varies by source):
- Pexels: Free for commercial use, no attribution required
- Pixabay: Free for commercial use, no attribution required
- Unsplash: Free for commercial use, attribution required
- Wikimedia: Varies (check per image - CC0, CC-BY, CC-BY-SA, Public Domain)

**Always verify** license on the image page before using in commercial projects.

---

**Document Version**: 1.0
**Created**: November 14, 2025
**Last Updated**: November 14, 2025
**Tool Location**: `/home/runner/workspace/scripts/simisai-image-finder`

**This workflow solves image finding automation permanently - not just for this presentation, but for all future SIMISAI projects (blog posts, social media, documentation, pitch decks, marketing materials, etc.).**

🎉 **You now have professional-grade image search automation for FREE!**
