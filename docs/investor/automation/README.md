# Automation - Slide Creation & CLI Tools

Scripts and prompts for automating presentation creation, image sourcing, and session management.

## 📋 Files in This Directory

### **Gamma.app Slide Creation**

| File | Purpose | Best For |
|------|---------|----------|
| **gamma-app-slide-prompts.md** ⭐ | Comprehensive slide-by-slide prompts (1000+ lines) | Slide-by-slide generation (recommended) |

### **CLI & Automation Tools**

| File | Purpose | When to Use |
|------|---------|-------------|
| **cli-image-automation.md** | CLI tools for image search automation | Finding images at scale |
| **session-handoff-image-automation.md** | Image automation workflow & handoff instructions | Session transitions, AI assistant handoffs |
| **cli-automation-restart-guide.md** | Quick start after system restart | CLI troubleshooting, environment setup |

### **Presentation Management**

| File | Purpose | When to Use |
|------|---------|-------------|
| **presentation-update-checklist.md** | Action checklist for presentation updates | Content refresh, version updates |

---

## 🎨 Creating Slides on Gamma.app

### **Method 1: Slide-by-Slide (Recommended)**

**Best for:** Maximum control, custom adjustments per slide

1. Open Gamma.app and create new presentation
2. Use `gamma-app-slide-prompts.md`
3. Copy each slide prompt (Slide 1, Slide 2, etc.)
4. Generate slide, review, adjust
5. Move to next slide
6. Find images using [`../image-sourcing/image-sourcing-guide.md`](../image-sourcing/image-sourcing-guide.md)

**Pros:**
- Full control over each slide
- Easy to adjust individual slides
- Better quality output

**Cons:**
- Takes longer (10-15 minutes per slide)
- More manual work

---

### **Method 2: Bulk Generation**

**Best for:** Speed, initial draft

1. Open Gamma.app
2. Use [`../aimx-conference/gamma-app-aimx-showcase-prompt.md`](../aimx-conference/gamma-app-aimx-showcase-prompt.md)
3. Paste entire prompt
4. Generate all slides at once
5. Review and adjust as needed
6. Use pre-researched images from [`../image-sourcing/search-results/`](../image-sourcing/search-results/)

**Pros:**
- Very fast (5-10 minutes total)
- Good starting point

**Cons:**
- Less control over individual slides
- May need more post-generation editing
- Gamma may struggle with long prompts

---

## 🖼️ Image Automation Workflow

### **Quick Image Search**

For fast image finding, use the CLI tools in `cli-image-automation.md`:

```bash
# Example: Search for elderly person using blood pressure monitor
./scripts/simisai-image-finder "elderly person using blood pressure monitor"
```

### **Comprehensive Image Guide**

For detailed image sourcing instructions, see:
- [`../image-sourcing/image-sourcing-guide.md`](../image-sourcing/image-sourcing-guide.md) - Complete guide
- [`../image-sourcing/search-results/`](../image-sourcing/search-results/) - Pre-researched options

---

## 🔄 Session Handoff & Restarts

### **When Claude Code Session Restarts**

Follow `cli-automation-restart-guide.md` to:
1. Verify environment setup
2. Check API keys and credentials
3. Resume automation workflows
4. Continue where you left off

### **When Handing Off to Another AI Assistant**

Use `session-handoff-image-automation.md` for:
1. Context transfer to new session
2. Current progress summary
3. Next steps and continuation plan
4. File locations and workflow state

---

## 🛠️ Presentation Update Workflow

When updating existing presentations, follow `presentation-update-checklist.md`:

**Before Starting:**
- [ ] Review current presentation
- [ ] Identify sections to update
- [ ] Gather new content/metrics

**During Update:**
- [ ] Update markdown files
- [ ] Regenerate affected slides
- [ ] Replace outdated images
- [ ] Update speaker notes

**After Update:**
- [ ] Full presentation review
- [ ] Practice with new content
- [ ] Update version numbers
- [ ] Archive old versions

---

## 💡 Best Practices

### **Gamma Slide Generation**
✅ Start with slide-by-slide method for first version
✅ Use bulk method for rapid iterations
✅ Always review and adjust Gamma output
✅ Test on actual presentation device
✅ Keep markdown source files updated

### **Image Automation**
✅ Use pre-researched images when available
✅ Verify licensing before using images
✅ Keep attribution information
✅ Download high-resolution versions (1920x1080+)
✅ Maintain organized image library

### **Session Management**
✅ Document progress before ending sessions
✅ Use handoff documents for context transfer
✅ Keep automation scripts up to date
✅ Test CLI tools after system restarts

---

## 📞 Related Resources

- **Main README**: [`../readme-presentation-materials.md`](../readme-presentation-materials.md)
- **Pitch Materials**: [`../pitch-materials/`](../pitch-materials/)
- **Image Sourcing**: [`../image-sourcing/`](../image-sourcing/)
- **AIMX Conference**: [`../aimx-conference/`](../aimx-conference/)

---

## 🚀 Quick Start

**Creating slides on Gamma?**
→ Start with `gamma-app-slide-prompts.md` (slide-by-slide method)

**Finding images?**
→ See `cli-image-automation.md` or [`../image-sourcing/image-sourcing-guide.md`](../image-sourcing/image-sourcing-guide.md)

**Session restarted?**
→ Follow `cli-automation-restart-guide.md`

**Updating presentation?**
→ Use `presentation-update-checklist.md`

---

**Ready to automate? Choose your workflow above and get started!**
