# Image Sourcing - Presentation Images & Attribution

Complete guides for finding, downloading, and attributing presentation images.

## 📋 Files in This Directory

### **Primary Guides**

| File | Purpose | When to Use |
|------|---------|-------------|
| **image-sourcing-guide.md** ⭐ | Complete guide to finding presentation images | Primary reference for image sourcing |
| **image-sourcing-working-guide.md** | Troubleshooting & advanced techniques | When basic search fails |
| **image-download-instructions.md** | Step-by-step download & attribution | After finding images |
| **wikimedia-commons-image-guide.md** | Specialized Wikimedia Commons guide | Free, properly licensed images |

### **Pre-Researched Images**

| Directory | Contains |
|-----------|----------|
| **search-results/** | Pre-researched image options for 6 key slides |

---

## 🖼️ Image Requirements

### **6 Images Needed for Pitch Deck**

1. **Slide 1 (Hero)**: Elderly person using blood pressure monitor successfully
2. **Slide 2 (Problem)**: Confused elderly person with medical device
3. **Slide 3 (Problem Context)**: Hospital/clinical setting, medication management
4. **Slide 4 (Solution)**: Smartphone showing guidance interface
5. **Slide 5 (Testimonial)**: Professional elderly portrait (trust, confidence)
6. **Slide 10 (Closing)**: Multi-generational family or caregiver scene

### **Technical Specifications**

- **Resolution**: Minimum 1920x1080 (Full HD)
- **Aspect Ratio**: 16:9 preferred
- **Format**: JPG or PNG
- **Licensing**: Free for commercial use (Unsplash, Pexels, Pixabay, Wikimedia Commons)
- **Quality**: High-resolution, professional photography

---

## 🚀 Quick Start Guide

### **Method 1: Use Pre-Researched Images (Fastest)**

1. Browse `search-results/` directory:
   - `image1-hero-elderly-bp.md` - Slide 1 options
   - `image2-problem-confused.md` - Slide 2 options
   - `image3-problem-hospital.md` - Slide 3 options
   - `image4-solution-smartphone.md` - Slide 4 options
   - `image5-testimonial-portrait.md` - Slide 5 options
   - `image6-closing-family.md` - Slide 10 options

2. Each file contains:
   - Direct image URLs
   - Thumbnail previews
   - Licensing information
   - Download instructions

3. Follow `image-download-instructions.md` to download and attribute

**Time**: 15-30 minutes for all 6 images

---

### **Method 2: Manual Search (Most Control)**

1. Read `image-sourcing-guide.md` (comprehensive instructions)
2. Search recommended platforms:
   - **Unsplash**: https://unsplash.com/
   - **Pexels**: https://www.pexels.com/
   - **Pixabay**: https://pixabay.com/
   - **Wikimedia Commons**: See `wikimedia-commons-image-guide.md`

3. Use recommended search queries from guide:
   - "elderly Asian man blood pressure monitor"
   - "senior woman confused medication"
   - "hospital elderly patient care"
   - etc.

4. Download high-resolution versions
5. Follow attribution requirements in `image-download-instructions.md`

**Time**: 1-2 hours for all 6 images

---

### **Method 3: CLI Automation (Most Efficient for Large Scale)**

Use automation tools from [`../automation/cli-image-automation.md`](../automation/cli-image-automation.md):

```bash
# Search and download images automatically
./scripts/simisai-image-finder "elderly person blood pressure monitor"
```

Follow [`../automation/session-handoff-image-automation.md`](../automation/session-handoff-image-automation.md) for workflow details.

**Time**: 10-20 minutes setup + 5 minutes per image

---

## 🔍 Recommended Search Platforms

### **Unsplash** ⭐ (Best for professional photography)
- URL: https://unsplash.com/
- License: Free for commercial use, attribution appreciated
- Best for: High-quality, professional lifestyle photos
- Search tips: Use specific demographics ("Asian elderly", "Southeast Asian senior")

### **Pexels** ⭐ (Best for diverse, modern imagery)
- URL: https://www.pexels.com/
- License: Free for commercial use, no attribution required
- Best for: Modern, diverse, natural scenes
- Search tips: Use action-based queries ("using smartphone", "checking blood pressure")

### **Pixabay** (Good for general-purpose images)
- URL: https://pixabay.com/
- License: Pixabay License (free for commercial use)
- Best for: Wide variety of subjects, illustrations
- Search tips: Filter by "Photos" and "High Resolution"

### **Wikimedia Commons** (Best for free, openly licensed)
- URL: https://commons.wikimedia.org/
- License: Various Creative Commons licenses
- Best for: Historical images, educational content
- Special Guide: See `wikimedia-commons-image-guide.md`

---

## ⚠️ Common Pitfalls & Solutions

### **Problem**: Can't find diverse elderly representation
**Solution**: Search with specific demographics:
- "Asian elderly person"
- "Southeast Asian senior"
- "Filipino grandmother"
- "Thai elderly man"

### **Problem**: Images look too clinical/sterile
**Solution**: Add lifestyle context to searches:
- "elderly person home healthcare"
- "senior using device at home"
- "grandmother kitchen blood pressure"

### **Problem**: Low resolution images
**Solution**:
- Always download "Original" or highest resolution
- Minimum 1920x1080 (Full HD)
- Avoid thumbnail or preview sizes
- See `image-download-instructions.md` for detailed steps

### **Problem**: Licensing unclear
**Solution**:
- Stick to Unsplash, Pexels, Pixabay (clear free licenses)
- For Wikimedia Commons, check individual license
- When in doubt, choose different image
- See `image-sourcing-guide.md` licensing section

---

## 📋 Image Checklist

Before using any image, verify:

- [ ] Resolution is 1920x1080 or higher
- [ ] License allows commercial use
- [ ] Attribution requirements understood (if any)
- [ ] Image aligns with slide message and tone
- [ ] Diversity and representation appropriate
- [ ] Image quality is professional (sharp, well-lit)
- [ ] File saved with descriptive name (e.g., `slide1-hero-elderly-bp.jpg`)

---

## 💡 Best Practices

### **Search Strategy**
✅ Start with pre-researched options in `search-results/`
✅ Use multiple platforms (compare quality)
✅ Search with specific demographics and context
✅ Look for natural, authentic moments (not staged stock photos)
✅ Consider emotional resonance with target audience

### **Download & Organization**
✅ Download highest resolution available
✅ Use descriptive file names (slide number + content)
✅ Keep attribution information in separate text file
✅ Organize by slide number or category
✅ Maintain backup copies

### **Quality Control**
✅ Review images at full presentation size
✅ Test on projector/large screen if possible
✅ Ensure text overlays are readable
✅ Check for visual consistency across all slides
✅ Get feedback from others before finalizing

---

## 🚨 Troubleshooting

### **Search Not Returning Good Results?**
See `image-sourcing-working-guide.md` for advanced techniques:
- Alternative search queries
- Platform-specific tips
- Reverse image search
- Custom filters and settings

### **Download Issues?**
See `image-download-instructions.md` for:
- Step-by-step download process per platform
- Browser troubleshooting
- File format conversions
- Resolution verification

### **Wikimedia Commons Confusion?**
See `wikimedia-commons-image-guide.md` for:
- License types explained
- Attribution requirements
- Advanced search filters
- Download and credit properly

---

## 📞 Related Resources

- **Main README**: [`../readme-presentation-materials.md`](../readme-presentation-materials.md)
- **Create Slides**: [`../automation/gamma-app-slide-prompts.md`](../automation/gamma-app-slide-prompts.md)
- **CLI Automation**: [`../automation/cli-image-automation.md`](../automation/cli-image-automation.md)
- **Pitch Materials**: [`../pitch-materials/`](../pitch-materials/)

---

## 🎯 Recommended Workflow

**For your first time:**
1. Start with `search-results/` pre-researched options (fastest)
2. Download using `image-download-instructions.md`
3. If you need different images, use `image-sourcing-guide.md`

**For subsequent presentations:**
1. Review `search-results/` for reusable options
2. Use CLI automation if finding many images
3. Build your own image library for future use

---

**Ready to find images? Start with `search-results/` for pre-researched options, or dive into `image-sourcing-guide.md` for comprehensive instructions!**
