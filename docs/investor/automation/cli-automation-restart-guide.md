# Quick Start After Session Restart

**Goal**: Find 6 images for AIMX presentation in 15 minutes

---

## ⚡ STEP 1: Set API Key (30 seconds)

```bash
# Replace with your actual Unsplash Access Key
export UNSPLASH_CLIENT_ID="paste_your_unsplash_access_key_here"

# Verify it's set
echo $UNSPLASH_CLIENT_ID
```

---

## ⚡ STEP 2: Run All 6 Searches (5 minutes)

Copy-paste these 6 commands:

```bash
# Image 1: Hero
./scripts/simisai-image-finder "elderly Filipino woman blood pressure monitor home confident" --source unsplash --count 10 --output markdown > docs/investor/image-search-results/image1-hero-elderly-bp.md

# Image 2: Problem - Confused
./scripts/simisai-image-finder "elderly confused frustrated medical device technology" --source unsplash --count 10 --output markdown > docs/investor/image-search-results/image2-problem-confused.md

# Image 3: Problem - Hospital
./scripts/simisai-image-finder "crowded hospital waiting room asia busy clinic queue" --source unsplash --count 10 --output markdown > docs/investor/image-search-results/image3-problem-hospital.md

# Image 4: Solution
./scripts/simisai-image-finder "elderly woman smartphone happy healthcare app success" --source unsplash --count 10 --output markdown > docs/investor/image-search-results/image4-solution-smartphone.md

# Image 5: Testimonial
./scripts/simisai-image-finder "happy elderly Filipino woman portrait smiling confident" --source unsplash --count 10 --output markdown > docs/investor/image-search-results/image5-testimonial-portrait.md

# Image 6: Closing
./scripts/simisai-image-finder "multi generational asian family grandparents grandchildren caring" --source unsplash --count 10 --output markdown > docs/investor/image-search-results/image6-closing-family.md
```

---

## ⚡ STEP 3: Extract All URLs (30 seconds)

```bash
# Get all image URLs from search results
grep "Direct URL" docs/investor/image-search-results/*.md | \
  awk -F'`' '{print $2}' > docs/investor/all_image_urls.txt

# View them
cat docs/investor/all_image_urls.txt
```

---

## ⚡ STEP 4: Review Results (5 minutes)

```bash
# View each result file
cat docs/investor/image-search-results/image1-hero-elderly-bp.md

# Or open all in editor
code docs/investor/image-search-results/
```

**Select 1-2 best images per search** based on:
- Southeast Asian subjects
- Confident elderly (not frail)
- High resolution
- Natural lighting

---

## ⚡ STEP 5: Download Selected (5 minutes)

```bash
# Option A: Manual download (copy specific URLs)
wget "https://images.unsplash.com/photo-..." -O docs/investor/images/slide-01-hero.jpg

# Option B: Use URLs directly in Gamma.app
# (Paste URLs when replacing auto-sourced images)
```

---

## 🆘 Troubleshooting

**"No API keys configured"**
```bash
echo $UNSPLASH_CLIENT_ID  # Should show your key
export UNSPLASH_CLIENT_ID="your_key"  # If empty
```

**"No images found"**
```bash
# Test with simple query
./scripts/simisai-image-finder "elderly" --source unsplash --count 3
```

**"Rate limit exceeded"**
- Wait 1 hour OR
- Use Wikimedia: `--source wikimedia` (unlimited)

---

## 📋 API Usage

- 6 searches = 6 API requests
- Limit: 50 requests/hour
- Usage: 12% (SAFE ✅)

---

## 📂 Results Location

All results saved to:
`/home/runner/workspace/docs/investor/image-search-results/`

---

## 📖 Full Documentation

See `/docs/investor/SESSION_HANDOFF_IMAGE_AUTOMATION.md` for complete details.

---

**Total Time: 15-20 minutes** 🚀
