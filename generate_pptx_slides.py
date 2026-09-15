import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_pptx_presentation(output_path):
    prs = Presentation()

    # Set 16:9 Widescreen dimensions (13.333 x 7.5 inches)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6] # Blank slide layout

    # Color Palette Definitions
    BG_DARK = RGBColor(0x0F, 0x17, 0x2A)      # Slate 900 (Navy Dark)
    CARD_DARK = RGBColor(0x1E, 0x29, 0x3B)    # Slate 800
    TEXT_LIGHT = RGBColor(0xF8, 0xFA, 0xFC)   # Slate 50
    TEXT_MUTED_LIGHT = RGBColor(0x94, 0xA3, 0xB8) # Slate 400
    ACCENT_BLUE = RGBColor(0x25, 0x63, 0xEB)  # Royal Blue 600
    ACCENT_TEAL = RGBColor(0x0D, 0x94, 0x88)  # Teal 600
    ACCENT_CYAN = RGBColor(0x06, 0xB6, 0xD4)  # Cyan 500
    
    BG_LIGHT = RGBColor(0xF8, 0xFA, 0xFC)     # Light Slate
    CARD_LIGHT = RGBColor(0xFF, 0xFF, 0xFF)   # Pure White Card
    TEXT_DARK = RGBColor(0x0F, 0x17, 0x2A)    # Navy Dark Text
    TEXT_MUTED_DARK = RGBColor(0x47, 0x55, 0x69) # Slate 600
    PRIMARY_BLUE = RGBColor(0x1E, 0x3A, 0x8A) # Navy Blue 900
    BORDER_LIGHT = RGBColor(0xE2, 0xE8, 0xF0) # Slate 200

    def add_bg(slide, color):
        shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        shape.fill.solid()
        shape.fill.fore_color.rgb = color
        shape.line.fill.background()
        return shape

    def add_card(slide, left, top, width, height, bg_color, border_color=None):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        if border_color:
            shape.line.color.rgb = border_color
            shape.line.width = Pt(1.5)
        else:
            shape.line.fill.background()
        return shape

    # ==========================================
    # SLIDE 1: TITLE SLIDE (Dark Theme)
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    add_bg(slide1, BG_DARK)

    # Decorative Card Header
    add_card(slide1, Inches(1.5), Inches(1.2), Inches(10.333), Inches(5.1), CARD_DARK, ACCENT_BLUE)

    # Title Text Frame
    txBox = slide1.shapes.add_textbox(Inches(2.0), Inches(1.6), Inches(9.333), Inches(4.3))
    tf = txBox.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "BLUEHOUSE JOBS"
    p0.font.name = "Arial"
    p0.font.size = Pt(40)
    p0.font.bold = True
    p0.font.color.rgb = ACCENT_CYAN
    p0.alignment = PP_ALIGN.CENTER
    p0.space_after = Pt(8)

    p1 = tf.add_paragraph()
    p1.text = "Smart Job Matching Platform for Fresh Graduates & Employers"
    p1.font.name = "Arial"
    p1.font.size = Pt(20)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_LIGHT
    p1.alignment = PP_ALIGN.CENTER
    p1.space_after = Pt(24)

    p2 = tf.add_paragraph()
    p2.text = "Project Presentation: Sections 1 & 2\n(Introduction, Objectives, Technologies & Architecture)"
    p2.font.name = "Arial"
    p2.font.size = Pt(15)
    p2.font.color.rgb = TEXT_MUTED_LIGHT
    p2.alignment = PP_ALIGN.CENTER
    p2.space_after = Pt(28)

    p3 = tf.add_paragraph()
    p3.text = "Digital Technology Project v2.5  |  Team BlueHouse Jobs  |  GitHub: Dpopeyes/job-matching"
    p3.font.name = "Arial"
    p3.font.size = Pt(12)
    p3.font.bold = True
    p3.font.color.rgb = ACCENT_TEAL
    p3.alignment = PP_ALIGN.CENTER

    # Notes for Slide 1
    slide1.notes_slide.notes_text_frame.text = (
        "--- ENGLISH SPEECH SCRIPT ---\n"
        "Good morning/afternoon, respected committee members and audience. Welcome to our presentation.\n\n"
        "Today, we are excited to introduce our project called 'BlueHouse Jobs'—a Smart Job Matching Platform designed specifically for fresh graduates and employers.\n\n"
        "--- THAI TRANSLATION & VOCAL TIPS ---\n"
        "คำแปล: สวัสดีครับ/ค่ะ ท่านกรรมการและผู้ฟังทุกท่าน ขอต้อนรับสู่การนำเสนอโครงงาน วันนี้พวกเรามีความยินดีอย่างยิ่งที่จะมานำเสนอโครงการ 'BlueHouse Jobs' แพลตฟอร์มคัดกรองจัดหางานอัจฉริยะสำหรับนักศึกษาจบใหม่และองค์กรนายจ้าง\n"
        "เทคนิค: พูดด้วยน้ำเสียงแจ่มใส มั่นใจ สบตากรรมการ และเน้นเสียงคำว่า 'BlueHouse Jobs' และ 'Smart Job Matching Platform'"
    )

    # ==========================================
    # SLIDE 2: SECTION 1 - PROJECT ORIGIN (Light Theme)
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_bg(slide2, BG_LIGHT)

    # Slide Header
    tb_hdr = slide2.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.0))
    tf_h = tb_hdr.text_frame
    tf_h.word_wrap = True
    p_h = tf_h.paragraphs[0]
    p_h.text = "01 | Project Origin & Problem Statement"
    p_h.font.name = "Arial"
    p_h.font.size = Pt(26)
    p_h.font.bold = True
    p_h.font.color.rgb = PRIMARY_BLUE
    p_h.space_after = Pt(2)

    p_sub = tf_h.add_paragraph()
    p_sub.text = "Addressing core challenges in modern job search & candidate selection for fresh graduates"
    p_sub.font.name = "Arial"
    p_sub.font.size = Pt(13)
    p_sub.font.color.rgb = TEXT_MUTED_DARK

    # Left Card: The Challenge
    add_card(slide2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0), CARD_LIGHT, RGBColor(0xFC, 0xA5, 0xA5))
    tb_left = slide2.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.6))
    tf_l = tb_left.text_frame
    tf_l.word_wrap = True
    
    pl0 = tf_l.paragraphs[0]
    pl0.text = "⚠️ Key Industry Challenges"
    pl0.font.name = "Arial"
    pl0.font.size = Pt(18)
    pl0.font.bold = True
    pl0.font.color.rgb = RGBColor(0xDC, 0x26, 0x26)
    pl0.space_after = Pt(14)

    challenges = [
        ("Cluttered & Complex UI", "Traditional job sites have overwhelming layouts that confuse fresh graduates."),
        ("Skill Mismatch Problem", "Lack of intelligent screening causes gap between student skills & employer needs."),
        ("Slow Interaction", "Complicated application processes delay communication between HR & applicants.")
    ]

    for title, desc in challenges:
        p_t = tf_l.add_paragraph()
        p_t.text = f"• {title}"
        p_t.font.name = "Arial"
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_DARK
        
        p_d = tf_l.add_paragraph()
        p_d.text = f"   {desc}"
        p_d.font.name = "Arial"
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = TEXT_MUTED_DARK
        p_d.space_after = Pt(10)

    # Right Card: The Solution
    add_card(slide2, Inches(6.9), Inches(1.8), Inches(5.6), Inches(5.0), CARD_LIGHT, RGBColor(0x6E, 0xE7, 0xB7))
    tb_right = slide2.shapes.add_textbox(Inches(7.1), Inches(2.0), Inches(5.2), Inches(4.6))
    tf_r = tb_right.text_frame
    tf_r.word_wrap = True
    
    pr0 = tf_r.paragraphs[0]
    pr0.text = "🚀 BlueHouse Jobs Solution"
    pr0.font.name = "Arial"
    pr0.font.size = Pt(18)
    pr0.font.bold = True
    pr0.font.color.rgb = RGBColor(0x05, 0x96, 0x69)
    pr0.space_after = Pt(14)

    solutions = [
        ("Smart Job Matching Platform", "Centralized, intuitive web portal connecting Applicants, Employers & Admins."),
        ("Dynamic Match Rate %", "Automated AI semantic engine calculating skill-to-job compatibility."),
        ("Role-Based Ecosystem", "Tailored interfaces for Job Seekers, Employers & Admin Moderation Dashboard.")
    ]

    for title, desc in solutions:
        p_t = tf_r.add_paragraph()
        p_t.text = f"✔ {title}"
        p_t.font.name = "Arial"
        p_t.font.size = Pt(14)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_DARK
        
        p_d = tf_r.add_paragraph()
        p_d.text = f"   {desc}"
        p_d.font.name = "Arial"
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = TEXT_MUTED_DARK
        p_d.space_after = Pt(10)

    # Notes for Slide 2
    slide2.notes_slide.notes_text_frame.text = (
        "--- ENGLISH SPEECH SCRIPT ---\n"
        "Let us start with Section 1: The background and origin of our project.\n\n"
        "In today's digital era, finding a job is a critical milestone for fresh graduates. However, many job seekers face two major problems: first, traditional platforms have cluttered, complicated interfaces; and second, there is a mismatch between students' actual skills and employer requirements.\n\n"
        "To solve these challenges, we developed BlueHouse Jobs as a centralized, intuitive web platform that connects job seekers, employers, and administrators seamlessly.\n\n"
        "--- THAI TRANSLATION & VOCAL TIPS ---\n"
        "คำแปล: ขอเริ่มต้นที่ข้อ 1 ที่มาและความสำคัญของโครงการ ในยุคดิจิทัล การหางานเป็นก้าวสำคัญของนักศึกษาจบใหม่ แต่หลายคนเจอปัญหาใหญ่ 2 ข้อ คือ เว็บเดิมๆ ใช้งานยากซับซ้อน และทักษะของผู้สมัครไม่ตรงกับที่นายจ้างต้องการ เราจึงพัฒนา BlueHouse Jobs ขึ้นมาเพื่อเป็นศูนย์กลางที่ใช้งานง่ายและเชื่อมโยงทุกคนเข้าด้วยกัน\n"
        "เทคนิค: เน้นเสียงหนักแน่นตรงคำว่า 'two major problems', 'cluttered interfaces', และ 'mismatch' เพื่อชี้ให้เห็นปัญหาที่ระบบเราเข้ามาแก้ไข"
    )

    # ==========================================
    # SLIDE 3: SECTION 1.1 - OBJECTIVES (4 Grid Layout)
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_bg(slide3, BG_LIGHT)

    # Header
    tb_hdr3 = slide3.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.0))
    tf_h3 = tb_hdr3.text_frame
    tf_h3.word_wrap = True
    ph3 = tf_h3.paragraphs[0]
    ph3.text = "01.1 | Primary Project Objectives"
    ph3.font.name = "Arial"
    ph3.font.size = Pt(26)
    ph3.font.bold = True
    ph3.font.color.rgb = PRIMARY_BLUE
    ph3.space_after = Pt(2)

    psub3 = tf_h3.add_paragraph()
    psub3.text = "Four core goals driving the design and technical development of BlueHouse Jobs"
    psub3.font.name = "Arial"
    psub3.font.size = Pt(13)
    psub3.font.color.rgb = TEXT_MUTED_DARK

    # 4 Grid Box positions
    boxes = [
        (Inches(0.8), Inches(1.8), "01", "Modern & Responsive Web Application", "Create an intuitive Single Page Application accessible seamlessly from desktop and mobile devices."),
        (Inches(6.9), Inches(1.8), "02", "Job Seeker Experience", "Help fresh graduates filter jobs by location, salary, & category with dynamic match rate evaluation."),
        (Inches(0.8), Inches(4.4), "03", "Employer Post & Applicant Selection", "Enable organization employers to post job vacancies, manage listings, and review candidate profiles."),
        (Inches(6.9), Inches(4.4), "04", "Admin Moderation System", "Provide a secure Admin Dashboard to oversee content, verify users, manage posts, and ensure safety.")
    ]

    for left, top, num, title, desc in boxes:
        add_card(slide3, left, top, Inches(5.6), Inches(2.4), CARD_LIGHT, BORDER_LIGHT)
        tb_b = slide3.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), Inches(5.2), Inches(2.0))
        tf_b = tb_b.text_frame
        tf_b.word_wrap = True

        pb0 = tf_b.paragraphs[0]
        pb0.text = f"Goal {num}: {title}"
        pb0.font.name = "Arial"
        pb0.font.size = Pt(14)
        pb0.font.bold = True
        pb0.font.color.rgb = ACCENT_BLUE
        pb0.space_after = Pt(6)

        pb1 = tf_b.add_paragraph()
        pb1.text = desc
        pb1.font.name = "Arial"
        pb1.font.size = Pt(11)
        pb1.font.color.rgb = TEXT_MUTED_DARK

    # Notes for Slide 3
    slide3.notes_slide.notes_text_frame.text = (
        "--- ENGLISH SPEECH SCRIPT ---\n"
        "Based on these problems, our project has four primary objectives:\n\n"
        "1. First, to create a modern, responsive web application accessible from any device.\n"
        "2. Second, to help fresh graduates easily search for jobs based on location, salary, and categories, and submit applications effortlessly.\n"
        "3. Third, to enable employers to post job vacancies, manage listings, and review applicants systematically.\n"
        "4. And fourth, to provide an efficient Admin Moderation System to ensure platform safety and content quality.\n\n"
        "--- THAI TRANSLATION & VOCAL TIPS ---\n"
        "คำแปล: จากปัญหาข้างต้น โครงการเรามีวัตถุประสงค์หลัก 4 ข้อ ได้แก่: 1) สร้างเว็บแอปพลิเคชันที่ทันสมัยรองรับทุกอุปกรณ์ 2) ช่วยให้นักศึกษาค้นหางานตามเงื่อนไขและยื่นใบสมัครได้สะดวก 3) ช่วยให้นายจ้างลงประกาศและคัดเลือกผู้สมัครได้อย่างเป็นระบบ 4) ให้บริการระบบผู้ดูแลระบบ (Admin) เพื่อกำกับดูแลความปลอดภัยของแพลตฟอร์ม\n"
        "เทคนิค: ใช้นิ้วมือช่วยนับตามลำดับ 1, 2, 3, 4 ช่วยให้ฟังง่ายและกรรมการติดตามเนื้อหาได้ทัน"
    )

    # ==========================================
    # SLIDE 4: SECTION 2 - TECH STACK (3 Column Layout)
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_bg(slide4, BG_LIGHT)

    # Header
    tb_hdr4 = slide4.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.0))
    tf_h4 = tb_hdr4.text_frame
    tf_h4.word_wrap = True
    ph4 = tf_h4.paragraphs[0]
    ph4.text = "02 | Technologies & Tools Used (Full-Stack Architecture)"
    ph4.font.name = "Arial"
    ph4.font.size = Pt(26)
    ph4.font.bold = True
    ph4.font.color.rgb = PRIMARY_BLUE
    ph4.space_after = Pt(2)

    psub4 = tf_h4.add_paragraph()
    psub4.text = "Industry-standard web technology stack powering BlueHouse Jobs"
    psub4.font.name = "Arial"
    psub4.font.size = Pt(13)
    psub4.font.color.rgb = TEXT_MUTED_DARK

    # 3 Columns
    cols = [
        (Inches(0.8), "Frontend Stack", ACCENT_BLUE, [
            ("React.js (Vite Core)", "Single Page Application (SPA) for fast dynamic state rendering & seamless UX."),
            ("Vanilla CSS3 System", "Custom glassmorphic card design system, dynamic gradients & clean typography."),
            ("Lucide-React Icons", "Modern vector icons for clear user action cues and visual hierarchy.")
        ]),
        (Inches(4.9), "Backend Web Server", ACCENT_TEAL, [
            ("Node.js + Express.js", "High-performance JavaScript runtime powering RESTful API endpoints."),
            ("Role-Based Security", "RBAC middleware enforcing strict permissions for User, Employer & Admin."),
            ("Universal REST Routes", "Modular API routes for Jobs, Applications, Users & Chat interactions.")
        ]),
        (Inches(9.0), "Database & DevOps", PRIMARY_BLUE, [
            ("Universal SQLite3", "Relational database storing Users, Jobs, Applications & Chat logs safely."),
            ("Git & GitHub Cloud", "Version control & repository collaboration at Dpopeyes/job-matching."),
            ("Deployment Ready", "Vite build pipeline & Node server configuration for production readiness.")
        ])
    ]

    for left, title, color, items in cols:
        add_card(slide4, left, Inches(1.8), Inches(3.6), Inches(5.0), CARD_LIGHT, color)
        tb_c = slide4.shapes.add_textbox(left + Inches(0.15), Inches(2.0), Inches(3.3), Inches(4.6))
        tf_c = tb_c.text_frame
        tf_c.word_wrap = True

        pc0 = tf_c.paragraphs[0]
        pc0.text = title
        pc0.font.name = "Arial"
        pc0.font.size = Pt(16)
        pc0.font.bold = True
        pc0.font.color.rgb = color
        pc0.space_after = Pt(12)

        for item_title, item_desc in items:
            pit = tf_c.add_paragraph()
            pit.text = f"▪ {item_title}"
            pit.font.name = "Arial"
            pit.font.size = Pt(12)
            pit.font.bold = True
            pit.font.color.rgb = TEXT_DARK

            pid = tf_c.add_paragraph()
            pid.text = f"  {item_desc}"
            pid.font.name = "Arial"
            pid.font.size = Pt(10)
            pid.font.color.rgb = TEXT_MUTED_DARK
            pid.space_after = Pt(8)

    # Notes for Slide 4
    slide4.notes_slide.notes_text_frame.text = (
        "--- ENGLISH SPEECH SCRIPT ---\n"
        "Moving on to Section 2: Technologies and tools used in development.\n\n"
        "BlueHouse Jobs is built using a modern Full-Stack Web Development architecture:\n\n"
        "- On the Frontend, we use React.js powered by Vite as a Single Page Application, providing lightning-fast rendering and smooth dynamic navigation without page reloads.\n"
        "- For Styling, we implemented a custom Vanilla CSS3 design system with dynamic gradients, combined with Lucide-React icons for a clean, modern user experience.\n"
        "- On the Backend, we built a Node.js and Express.js RESTful API to handle business logic, role-based access control, and server authentication.\n\n"
        "--- THAI TRANSLATION & VOCAL TIPS ---\n"
        "คำแปล: มาต่อกันที่ข้อ 2 เทคโนโลยีและเครื่องมือที่ใช้พัฒนา ระบบเราพัฒนาด้วยสถาปัตยกรรม Full-Stack Web: ฝั่ง Frontend ใช้ React.js ร่วมกับ Vite ให้ความเร็วสูง โหลดหน้าเว็บแบบ SPA ไม่ต้องรีเฟรช / ส่วนดีไซน์ใช้ Vanilla CSS3 แบบ Custom พร้อมไอคอน Lucide-React / ฝั่ง Backend ใช้ Node.js และ Express.js ทำหน้าที่เป็น RESTful API จัดการสิทธิ์และตรรกะการทำงาน\n"
        "เทคนิค: ออกเสียงคำศัพท์เทคนิคให้ชัดเจน: React.js (รีแอค-เจเอส), Vite (วีท), Single Page Application (ซิงเกิล-เพจ-แอปพลิเคชัน), RESTful API (เรสต์ฟูล-เอพีไอ)"
    )

    # ==========================================
    # SLIDE 5: SECTION 2 - AI MATCHING ENGINE (Highlight Slide)
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_bg(slide5, BG_LIGHT)

    # Header
    tb_hdr5 = slide5.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.0))
    tf_h5 = tb_hdr5.text_frame
    tf_h5.word_wrap = True
    ph5 = tf_h5.paragraphs[0]
    ph5.text = "02.1 | Intelligent AI Matching & Candidate Analysis"
    ph5.font.name = "Arial"
    ph5.font.size = Pt(26)
    ph5.font.bold = True
    ph5.font.color.rgb = PRIMARY_BLUE
    ph5.space_after = Pt(2)

    psub5 = tf_h5.add_paragraph()
    psub5.text = "Smart candidate evaluation powered by custom AI algorithm & Google Gemini AI API"
    psub5.font.name = "Arial"
    psub5.font.size = Pt(13)
    psub5.font.color.rgb = TEXT_MUTED_DARK

    # Top Feature Box: Dynamic AI Match Engine Formula
    add_card(slide5, Inches(0.8), Inches(1.8), Inches(11.733), Inches(2.2), CARD_LIGHT, ACCENT_BLUE)
    tb_ai = slide5.shapes.add_textbox(Inches(1.0), Inches(1.95), Inches(11.3), Inches(1.9))
    tf_ai = tb_ai.text_frame
    tf_ai.word_wrap = True

    pai0 = tf_ai.paragraphs[0]
    pai0.text = "🤖 Dynamic AI Matching Engine Formula"
    pai0.font.name = "Arial"
    pai0.font.size = Pt(16)
    pai0.font.bold = True
    pai0.font.color.rgb = ACCENT_BLUE
    pai0.space_after = Pt(6)

    pai1 = tf_ai.add_paragraph()
    pai1.text = "Match Rate (%) = (Skill Score × 70%) + (Major Score × 30%)"
    pai1.font.name = "Arial"
    pai1.font.size = Pt(15)
    pai1.font.bold = True
    pai1.font.color.rgb = PRIMARY_BLUE
    pai1.space_after = Pt(6)

    pai2 = tf_ai.add_paragraph()
    pai2.text = "• Multi-Source Skill Extractor: Parses applicant skills, project tags (#React, #JavaScript), and bio descriptions automatically.\n• Taxonomy Distance Engine: Evaluates major compatibility (Tech ↔ Web Dev = 100%, Design = 50%, Unrelated = 0%)."
    pai2.font.name = "Arial"
    pai2.font.size = Pt(11)
    pai2.font.color.rgb = TEXT_MUTED_DARK

    # Bottom Left Box: Google Gemini API
    add_card(slide5, Inches(0.8), Inches(4.3), Inches(5.7), Inches(2.5), CARD_LIGHT, ACCENT_TEAL)
    tb_g = slide5.shapes.add_textbox(Inches(1.0), Inches(4.45), Inches(5.3), Inches(2.2))
    tf_g = tb_g.text_frame
    tf_g.word_wrap = True

    pg0 = tf_g.paragraphs[0]
    pg0.text = "✨ Real-Time Google Gemini AI Analysis"
    pg0.font.name = "Arial"
    pg0.font.size = Pt(15)
    pg0.font.bold = True
    pg0.font.color.rgb = ACCENT_TEAL
    pg0.space_after = Pt(6)

    pg1 = tf_g.add_paragraph()
    pg1.text = "• Integrated Google Gemini API (gemini-3.6-flash) on Node.js backend.\n• Generates real-time Thai language candidate analysis summarizing candidate strengths and recommendations for HR."
    pg1.font.name = "Arial"
    pg1.font.size = Pt(11)
    pg1.font.color.rgb = TEXT_MUTED_DARK

    # Bottom Right Box: Universal SQLite Database
    add_card(slide5, Inches(6.833), Inches(4.3), Inches(5.7), Inches(2.5), CARD_LIGHT, PRIMARY_BLUE)
    tb_db = slide5.shapes.add_textbox(Inches(7.033), Inches(4.45), Inches(5.3), Inches(2.2))
    tf_db = tb_db.text_frame
    tf_db.word_wrap = True

    pdb0 = tf_db.paragraphs[0]
    pdb0.text = "💾 Universal Shared SQLite Database"
    pdb0.font.name = "Arial"
    pdb0.font.size = Pt(15)
    pdb0.font.bold = True
    pdb0.font.color.rgb = PRIMARY_BLUE
    pdb0.space_after = Pt(6)

    pdb1 = tf_db.add_paragraph()
    pdb1.text = "• Centralized relational database engine storing Users, Job Vacancies, Applications, Portfolios, and Real-Time Chat messages.\n• Ensures zero mock data and instant real-time synchronization."
    pdb1.font.name = "Arial"
    pdb1.font.size = Pt(11)
    pdb1.font.color.rgb = TEXT_MUTED_DARK

    # Notes for Slide 5
    slide5.notes_slide.notes_text_frame.text = (
        "--- ENGLISH SPEECH SCRIPT ---\n"
        "For data management and intelligent features:\n\n"
        "- We use SQLite3 as our universal relational database to safely store user profiles, job posts, applications, and chat messages.\n"
        "- Furthermore, we developed a Dynamic AI Matching Engine that calculates a personalized Match Rate percentage based on applicant majors and specialized skills.\n"
        "- We also integrated the Google Gemini AI API to provide real-time, in-depth Thai language candidate analysis.\n"
        "- Finally, Git and GitHub Cloud were used for version control and source code collaboration.\n\n"
        "--- THAI TRANSLATION & VOCAL TIPS ---\n"
        "คำแปล: ในส่วนการจัดการข้อมูลและฟีเจอร์อัจฉริยะ: เราใช้ SQLite3 เป็นฐานข้อมูลจัดเก็บข้อมูลผู้ใช้ โพสต์งาน ใบสมัคร และแชท / นอกจากนี้ เราได้พัฒนาระบบ AI Matching คำนวณเปอร์เซ็นต์ Match Rate % ตามสาขาวิชาและทักษะจริง / พร้อมเชื่อมต่อ Google Gemini AI API เพื่อวิเคราะห์ผู้สมัครเป็นภาษาไทยแบบเรียลไทม์ / และใช้ Git/GitHub ควบคุมเวอร์ชันซอร์สโค้ด\n"
        "เทคนิค: เน้นฟีเจอร์ไฮไลท์ตรง 'Dynamic AI Matching Engine' และ 'Google Gemini AI API' เพราะเป็นจุดเด่นสำคัญของงานเรา"
    )

    # ==========================================
    # SLIDE 6: SUMMARY & DEMO TRANSITION (Dark Theme)
    # ==========================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_bg(slide6, BG_DARK)

    # Card
    add_card(slide6, Inches(1.5), Inches(1.2), Inches(10.333), Inches(5.1), CARD_DARK, ACCENT_CYAN)

    tb_s6 = slide6.shapes.add_textbox(Inches(1.8), Inches(1.5), Inches(9.733), Inches(4.5))
    tf_s6 = tb_s6.text_frame
    tf_s6.word_wrap = True

    ps0 = tf_s6.paragraphs[0]
    ps0.text = "SUMMARY & DEMO TRANSITION"
    ps0.font.name = "Arial"
    ps0.font.size = Pt(32)
    ps0.font.bold = True
    ps0.font.color.rgb = ACCENT_CYAN
    ps0.alignment = PP_ALIGN.CENTER
    ps0.space_after = Pt(16)

    ps1 = tf_s6.add_paragraph()
    ps1.text = "BlueHouse Jobs bridges the gap between fresh graduates and employers through a modern, secure, and AI-powered platform."
    ps1.font.name = "Arial"
    ps1.font.size = Pt(18)
    ps1.font.color.rgb = TEXT_LIGHT
    ps1.alignment = PP_ALIGN.CENTER
    ps1.space_after = Pt(28)

    ps2 = tf_s6.add_paragraph()
    ps2.text = "🎬 Next Step: Live Application Demonstration"
    ps2.font.name = "Arial"
    ps2.font.size = Pt(22)
    ps2.font.bold = True
    ps2.font.color.rgb = ACCENT_TEAL
    ps2.alignment = PP_ALIGN.CENTER
    ps2.space_after = Pt(14)

    ps3 = tf_s6.add_paragraph()
    ps3.text = "Thank you very much for your time. We are ready for your questions!"
    ps3.font.name = "Arial"
    ps3.font.size = Pt(15)
    ps3.font.italic = True
    ps3.font.color.rgb = TEXT_MUTED_LIGHT
    ps3.alignment = PP_ALIGN.CENTER

    # Notes for Slide 6
    slide6.notes_slide.notes_text_frame.text = (
        "--- ENGLISH SPEECH SCRIPT ---\n"
        "In summary, BlueHouse Jobs effectively addresses the gap between fresh graduates and employers through a modern, secure, and AI-powered platform.\n\n"
        "Now, we would like to invite you to watch a live demonstration of our application in action. Thank you very much, and we are ready for your questions.\n\n"
        "--- THAI TRANSLATION & VOCAL TIPS ---\n"
        "คำแปล: โดยสรุปแล้ว BlueHouse Jobs ตอบโจทย์การเชื่อมโยงนักศึกษาจบใหม่กับนายจ้างด้วยแพลตฟอร์มที่ทันสมัย ปลอดภัย และมีระบบ AI ช่วยแมตช์งาน ลำดับต่อไป ขอเชิญรับชมการสาธิตการใช้งานระบบจริง (Live Demo) ขอบคุณครับ/ค่ะ และพร้อมรับคำถามจากคณะกรรมการครับ/ค่ะ\n"
        "เทคนิค: กล่าวโค้งขอบคุณอย่างสุภาพ ผายมือไปที่หน้าจอสำหรับการสาธิตระบบจริง (Live Demo)"
    )

    # Save presentation
    prs.save(output_path)
    print("SUCCESS: PowerPoint presentation slides generated at " + output_path)

if __name__ == "__main__":
    create_pptx_presentation("d:/work90/bluehouse/BlueHouse_Jobs_Presentation_Slides.pptx")
