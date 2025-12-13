# SIMISAI Pitch Deck Automation - Quick Start Guide
## From Markdown to Professional Slides in 20 Minutes

**Status**: Ready to implement (November 2025)
**Prerequisites**: Node.js, Claude Code, Internet connection
**Cost**: $0 (free trial) or $29/month (SlideSpeak paid plan)

---

## FASTEST PATH TO AUTOMATED SLIDES (20 MINUTES TOTAL)

### Step 1: Get SlideSpeak API Key (5 minutes)

1. Visit: https://slidespeak.co/slidespeak-api/
2. Click "Sign Up" (free trial available)
3. Create account with email
4. Navigate to "API Keys" in dashboard
5. Click "Generate New API Key"
6. Copy the key (starts with `sk-proj-`)
   - Example: `sk-proj-abc123xyz789...`
   - Save it securely (you'll need it next)

### Step 2: Install SlideSpeak MCP in Claude Code (3 minutes)

Open your terminal and run:

```bash
# Verify Node.js is installed
node --version
# Should show v18.x or higher. If not, install from nodejs.org

# Add SlideSpeak MCP server to Claude Code
claude mcp add-json "slidespeak" '{
  "command": "npx",
  "args": [
    "mcp-remote",
    "https://mcp.slidespeak.co/mcp",
    "--header",
    "Authorization: Bearer sk-proj-YOUR-ACTUAL-API-KEY-HERE"
  ],
  "timeout": 300000
}'

# Verify installation
claude mcp list
# You should see "slidespeak" in the output
```

**IMPORTANT**: Replace `sk-proj-YOUR-ACTUAL-API-KEY-HERE` with your real API key from Step 1

### Step 3: Generate Your Pitch Deck (2 minutes)

Start Claude Code and paste this prompt:

```
Using the SlideSpeak MCP server, create a professional 10-slide investor pitch deck.

Source: /home/runner/workspace/docs/investor/SIMISAI-5MIN-PITCH-DECK.md

Design:
- Professional investor style
- Blue (#0066CC) and white color scheme
- Modern sans-serif fonts
- Include all charts and data visualizations

Create these 10 slides:
1. Opening Hook (title + AI Singapore badge)
2. The Problem ($50B market pain)
3. The Solution (3-step workflow)
4. Proof of Technology (government validation)
5. Market Opportunity (TAM/SAM/SOM circles)
6. Business Model (revenue streams + chart)
7. Go-to-Market (3-phase timeline)
8. Competitive Advantage (2x2 matrix)
9. Traction & Roadmap (milestones)
10. Team & The Ask (funding pie chart)

Output: SIMISAI-Investor-Pitch-Nov-2025.pptx

Include speaker notes from the markdown "Recommended Speech" sections.
```

Claude Code will:
- Read your markdown file
- Call SlideSpeak API via MCP
- Generate professional slides
- Download the .pptx file

### Step 4: Review & Refine (10 minutes)

Open the generated `SIMISAI-Investor-Pitch-Nov-2025.pptx` and:

1. **Add Team Photos** (Slide 10)
   - Replace placeholder images with actual headshots
   - Ensure professional quality (headshot style, consistent background)

2. **Insert SIMISAI Logo**
   - Add to title slide (Slide 1)
   - Add to footer on all slides (optional)

3. **Verify Data Accuracy**
   - Check revenue numbers (Slide 6)
   - Confirm market sizes (Slide 5)
   - Validate funding ask amount (Slide 10)

4. **Final Polish**
   - Adjust font sizes if needed (18pt+ for body text)
   - Check all slides in presentation mode
   - Add slide transitions (optional)

5. **Export PDF Version**
   - File → Export → PDF
   - Save as: `SIMISAI-Investor-Pitch-Nov-2025.pdf`
   - Use for email distribution

**Done!** You now have a professional 10-slide pitch deck.

---

## ALTERNATIVE: FREE OPEN-SOURCE METHOD (40 MINUTES)

If you prefer no subscription costs:

### Option B: Office-PowerPoint-MCP-Server (Free)

```bash
# Install Python dependencies
pip install python-pptx mcp[cli]

# Add Office-PowerPoint MCP to Claude Code
claude mcp add-json "ppt" '{
  "command": "uvx",
  "args": [
    "--from",
    "office-powerpoint-mcp-server",
    "ppt_mcp_server"
  ],
  "env": []
}'

# Verify
claude mcp list
```

**Prompt for Claude Code**:
```
Using the Office-PowerPoint MCP server, create a 10-slide pitch deck from:
/home/runner/workspace/docs/investor/SIMISAI-5MIN-PITCH-DECK.md

Use professional templates and include all data visualizations.
Output: SIMISAI-Pitch-Deck.pptx
```

**Pros**: Free, full local control, open-source
**Cons**: Slightly more setup, requires Python environment

---

## TROUBLESHOOTING

### Issue: "MCP server 'slidespeak' not found"

**Fix**:
```bash
# Check if server is registered
claude mcp list

# If not listed, re-run the add command
# Make sure to replace API key with your real key
```

### Issue: "Node.js not found"

**Fix**:
1. Download Node.js from: https://nodejs.org/
2. Install latest LTS version (v20.x or v22.x)
3. Restart terminal
4. Verify: `node --version`

### Issue: "Timeout generating slides"

**Fix**:
```bash
# Increase timeout to 10 minutes
claude mcp add-json "slidespeak" '{
  "command": "npx",
  "args": ["mcp-remote", "https://mcp.slidespeak.co/mcp", "--header", "Authorization: Bearer YOUR-KEY"],
  "timeout": 600000
}'
```

### Issue: "Charts not displaying correctly"

**Fix**:
1. Generate base slides first
2. Manually edit charts in PowerPoint
3. OR provide explicit data in prompt:
```
For Slide 6 revenue chart, use this data:
Year 1: $300,000
Year 2: $3,000,000
Year 3: $12,000,000
Create a bar chart with these exact values.
```

---

## NEXT STEPS AFTER FIRST DECK

### 1. Create Custom Template (Optional)

Design a branded PowerPoint template:
- SIMISAI logo in header/footer
- Consistent color scheme (#0066CC blue)
- Custom slide layouts
- Upload to SlideSpeak for reuse

### 2. Automate Monthly Updates

Create a workflow for investor updates:
```bash
# Save this as .claude/commands/update-deck.md
Generate updated investor pitch deck with latest metrics:
- Revenue: [fetch from AWS CloudWatch]
- Users: [query RDS database]
- New features: [read from CHANGELOG.md]

Use SlideSpeak MCP to update slides 6, 9, and 10 only.
```

### 3. Multi-Language Versions

Generate decks in different languages:
```
Create Chinese version of pitch deck for Singapore investors.
Translate all content while maintaining visual design.
Output: SIMISAI-Investor-Pitch-CN.pptx
```

### 4. Export Variations

Create different formats:
- **PDF**: For email distribution
- **16:9**: For screen presentations
- **4:3**: For older projectors
- **Video**: Convert to MP4 for social media

---

## COST COMPARISON

### Manual Creation
- Designer time: 4-6 hours @ $100/hr = **$400-600**
- Revisions: $100-200 per update
- Total first deck: **$400-800**

### Automated with MCP
- Setup time: 20 minutes (one-time)
- Generation time: 2 minutes
- Refinement: 10 minutes
- SlideSpeak subscription: $29/month
- Total first deck: **$29-87**

**Savings**: 85% time reduction, $313-713 cost savings

---

## RECOMMENDED WORKFLOW FOR REGULAR USE

### Monthly Investor Update Deck

1. **Update Markdown** (5 mins)
   - Edit `SIMISAI-5MIN-PITCH-DECK.md`
   - Update revenue numbers (Slide 6)
   - Add new milestones (Slide 9)
   - Refresh traction metrics

2. **Regenerate Slides** (2 mins)
   - Run same Claude Code prompt
   - SlideSpeak creates new deck

3. **Review Changes** (5 mins)
   - Compare with previous month
   - Verify data accuracy
   - Export PDF

**Total**: 12 minutes per monthly update (vs 2-4 hours manual)

### Pitch Variations for Different Audiences

Create audience-specific decks:

**VC Investors** (Current deck):
- Focus: Scalability, market size, returns
- Length: 10 slides

**Corporate Partners** (Modified):
```
Create 7-slide partnership deck focused on:
- Technology capabilities (Slides 3-4)
- Enterprise use cases (Slide 2)
- Integration options (new slide)
- Case studies (Slide 9)
Output: SIMISAI-Partnership-Deck.pptx
```

**Government Grants** (Singapore I2Start):
```
Create 12-slide grant application deck emphasizing:
- AI Singapore validation (Slide 4)
- Local impact (Singapore manufacturing)
- Technical innovation (Slide 3)
- Job creation (add to Slide 10)
Output: SIMISAI-Grant-Application.pptx
```

---

## ADVANCED TIPS

### Tip 1: Use Markdown Variables for Dynamic Content

Create variables in markdown:
```markdown
<!-- Variables -->
[REVENUE_Y1]: $300,000
[REVENUE_Y2]: $3,000,000
[USERS_CURRENT]: 500
[USERS_TARGET_6M]: 1,000

<!-- Use in slides -->
**Current Traction**: [USERS_CURRENT] active users
**6-Month Goal**: [USERS_TARGET_6M] enterprise users
```

Claude Code will replace these when generating slides.

### Tip 2: Template Reuse

After first successful deck:
```
Save the design of SIMISAI-Investor-Pitch-Nov-2025.pptx as a template.
Use this template for all future deck generations.
Maintain consistent branding and style.
```

### Tip 3: Batch Generation

Create multiple decks at once:
```
Generate 3 deck variations:
1. SIMISAI-Investor-Pitch.pptx (10 slides, VC audience)
2. SIMISAI-Partnership-Deck.pptx (7 slides, corporate audience)
3. SIMISAI-Grant-Application.pptx (12 slides, government grant)

All use same source markdown but different slide selection and emphasis.
```

### Tip 4: Version Control

Track deck versions:
```bash
# Save generated decks with date
SIMISAI-Investor-Pitch-2025-11-11.pptx
SIMISAI-Investor-Pitch-2025-12-01.pptx

# Track in git (optional)
git add docs/investor/decks/
git commit -m "docs: Add November 2025 investor pitch deck"
```

---

## SUCCESS METRICS

Track automation effectiveness:

### Time Savings
- **Manual**: 4-6 hours per deck
- **Automated**: 20 minutes per deck
- **Improvement**: 92% time reduction

### Cost Savings
- **Manual**: $400-600 per deck
- **Automated**: $29-87 per deck (including subscription)
- **ROI**: 5-20x return on investment

### Quality Consistency
- **Manual**: Variable (depends on designer availability)
- **Automated**: Consistent branding and formatting
- **Revisions**: Instant (regenerate in 2 minutes)

### Iteration Speed
- **Manual**: 1-2 days for revisions
- **Automated**: 2 minutes for regeneration
- **Flexibility**: Update anytime, anywhere

---

## WHEN TO USE MANUAL vs AUTOMATED

### Use Automation For:
- Monthly investor updates
- Pitch variations for different audiences
- Quick prototypes for feedback
- Data-heavy presentations (charts auto-generate)
- Multilingual versions
- Consistent branding enforcement

### Use Manual Design For:
- Final polish before major pitch (Sequoia, a16z, etc.)
- Custom infographics beyond standard charts
- Brand photoshoots and professional imagery
- Highly artistic/creative presentations
- Unique one-off designs

### Hybrid Approach (Recommended):
1. **Generate base with MCP** (90% done in 2 minutes)
2. **Manually polish critical elements** (team photos, logo, final design tweaks)
3. **Total time**: 20-30 minutes for professional quality

---

## GETTING HELP

### Resources
- **This guide**: `/home/runner/workspace/SIMISAI-PITCH-DECK-AUTOMATION-QUICKSTART.md`
- **Full research**: `/home/runner/workspace/CLAUDE-CODE-MCP-SLIDE-GENERATION-RESEARCH.md`
- **SlideSpeak docs**: https://slidespeak.co/docs/
- **MCP Registry**: https://registry.modelcontextprotocol.io

### Support Channels
- **SlideSpeak**: support@slidespeak.co
- **MCP Community**: GitHub Discussions
- **Claude Code**: Anthropic documentation

### Common Questions

**Q: Can I use this for investor meetings?**
A: Yes! SlideSpeak generates professional-quality slides suitable for VC pitches.

**Q: What if I need custom designs?**
A: Generate base slides with MCP, then manually refine in PowerPoint.

**Q: How often should I update my deck?**
A: Monthly for active fundraising, quarterly for general updates.

**Q: Can I share slides with co-founders?**
A: Yes, .pptx files work in PowerPoint, Google Slides, Keynote.

**Q: What about presenter notes?**
A: Automatically included from markdown "Recommended Speech" sections.

---

## CHECKLIST: YOUR FIRST AUTOMATED DECK

Use this checklist for your first generation:

### Pre-Generation
- [ ] Node.js installed and verified
- [ ] Claude Code CLI working
- [ ] SlideSpeak account created
- [ ] API key obtained and saved
- [ ] MCP server added to Claude Code
- [ ] Verified with `claude mcp list`
- [ ] Markdown file reviewed and ready

### Generation
- [ ] Claude Code session started
- [ ] Prompt pasted with correct file path
- [ ] Design preferences specified
- [ ] Generation completed successfully
- [ ] .pptx file downloaded

### Post-Generation
- [ ] All 10 slides present
- [ ] Content matches markdown
- [ ] Charts displaying correctly
- [ ] Speaker notes included
- [ ] Team photos added (Slide 10)
- [ ] SIMISAI logo inserted
- [ ] Data accuracy verified
- [ ] Tested in presentation mode
- [ ] PDF version exported
- [ ] Saved with version number

### Next Steps
- [ ] Share with co-founders for feedback
- [ ] Test pitch with timer (6.5 minutes target)
- [ ] Practice with speaker notes
- [ ] Prepare demo for 3-4 minute segment
- [ ] Ready for investor meetings

---

## FINAL TIPS FOR SUCCESS

1. **Start Simple**: Generate basic deck first, refine later
2. **Iterate Quickly**: Don't aim for perfection on first try
3. **Save Templates**: Reuse successful designs
4. **Track Versions**: Date all deck files
5. **Get Feedback**: Share early drafts with advisors
6. **Practice Timing**: 6.5 minutes for 10 slides = 39 seconds per slide
7. **Backup Plans**: Keep PDF version on phone for spontaneous pitches
8. **Update Regularly**: Refresh metrics monthly during fundraising

---

**Created**: November 11, 2025
**For**: SIMISAI Investor Pitch Automation
**Maintained By**: SIMISAI Team
**Next Review**: When MCP ecosystem updates (check quarterly)

**Questions?** Refer to full research document: `CLAUDE-CODE-MCP-SLIDE-GENERATION-RESEARCH.md`

---

**Ready to start?** Follow Step 1 above and you'll have your first automated pitch deck in 20 minutes!
