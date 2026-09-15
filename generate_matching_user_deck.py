import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_matching_user_deck(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Exact Color Palette matching user's reference screenshot (Soft Pastel Canvas & Crisp Cards)
    COLOR_BG_PASTEL    = RGBColor(0xF0, 0xF7, 0xFF) # Soft Gradient Light Ice-Blue (#F0F7FF)
    COLOR_CANVAS_WHITE = RGBColor(0xFA, 0xFC, 0xFF) # Soft White Inner Canvas
    COLOR_CARD_PURE    = RGBColor(0xFF, 0xFF, 0xFF) # Pure White Card
    COLOR_HEADER_NAVY  = RGBColor(0x1E, 0x29, 0x3B) # Slate 800 Header
    COLOR_TITLE_DARK   = RGBColor(0x0F, 0x17, 0x2A) # Slate 900 Text
    COLOR_NAVY_MAIN    = RGBColor(0x1E, 0x3A, 0x8A) # Deep Navy Title (20pt+)
    COLOR_TEXT_BODY    = RGBColor(0x33, 0x41, 0x55) # Slate 700 Body (16pt)
    COLOR_TEXT_MUTED   = RGBColor(0x64, 0x74, 0x8B) # Slate 500 Subtitle

    # Accent Colors matching screenshot's 4 cards
    COLOR_ACCENT_BLUE   = RGBColor(0x25, 0x63, 0xEB) # Blue #2563EB (Card 1)
    COLOR_ACCENT_GREEN  = RGBColor(0x05, 0x96, 0x69) # Emerald #059669 (Card 2)
    COLOR_ACCENT_ORANGE = RGBColor(0xD9, 0x77, 0x06) # Amber/Orange #D97706 (Card 3)
    COLOR_ACCENT_PURPLE = RGBColor(0x7C, 0x3A, 0xED) # Purple #7C3AED (Card 4)
    COLOR_BORDER_LIGHT  = RGBColor(0xE2, 0xE8, 0xF0) # Soft Slate Border

    def add_bg(slide):
        # Soft pastel base background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG_PASTEL
        bg.line.fill.background()

        # Rounded Inner Canvas Container (matching screenshot frame)
        canvas = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.4), Inches(0.4), Inches(12.533), Inches(6.7))
        canvas.fill.solid()
        canvas.fill.fore_color.rgb = COLOR_CANVAS_WHITE
        canvas.line.color.rgb = RGBColor(0xDB, 0xEA, 0xFE)
        canvas.line.width = Pt(1.5)
        return canvas

    def add_slide_header(slide, title_text, subtitle_text=None):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.65), Inches(11.733), Inches(0.9))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = title_text
        p0.font.name = "Arial"
        p0.font.size = Pt(22) # Main Heading 22pt
        p0.font.bold = True
        p0.font.color.rgb = COLOR_NAVY_MAIN

        if subtitle_text:
            p1 = tf.add_paragraph()
            p1.text = subtitle_text
            p1.font.name = "Arial"
            p1.font.size = Pt(16) # Subtitle 16pt
            p1.font.color.rgb = COLOR_TEXT_MUTED
            p1.space_before = Pt(2)

    def add_card(slide, left, top, width, height, bg_color=COLOR_CARD_PURE, border_color=COLOR_BORDER_LIGHT):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        if border_color:
            shape.line.color.rgb = border_color
            shape.line.width = Pt(1.5)
        else:
            shape.line.fill.background()
        return shape

    def add_top_accent_bar(slide, left, top, width, color):
        bar = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, Inches(0.12))
        bar.fill.solid()
        bar.fill.fore_color.rgb = color
        bar.line.fill.background()
        return bar

    def add_icon_badge(slide, left, top, text, bg_color, width=Inches(0.65), height=Inches(0.65)):
        badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        badge.fill.solid()
        badge.fill.fore_color.rgb = bg_color
        badge.line.fill.background()
        tf = badge.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = text
        p.font.name = "Arial"
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = COLOR_CARD_PURE
        p.alignment = PP_ALIGN.CENTER
        return badge

    # ==========================================
    # SLIDE 1: TITLE SLIDE (Bluehouse Jobs Cover)
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    add_bg(slide1)

    # Hero Cover Container Card
    add_card(slide1, Inches(1.2), Inches(1.0), Inches(10.933), Inches(5.5), COLOR_CARD_PURE, COLOR_ACCENT_BLUE)
    add_top_accent_bar(slide1, Inches(1.2), Inches(1.0), Inches(10.933), COLOR_ACCENT_BLUE)

    tb1 = slide1.shapes.add_textbox(Inches(1.5), Inches(1.6), Inches(10.333), Inches(4.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "Bluehouse Jobs"
    p0.font.name = "Arial"
    p0.font.size = Pt(40)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_NAVY_MAIN
    p0.alignment = PP_ALIGN.CENTER
    p0.space_after = Pt(8)

    p1 = tf1.add_paragraph()
    p1.text = "Smart Job Matching Platform for Fresh Graduates & Employers"
    p1.font.name = "Arial"
    p1.font.size = Pt(20) # หัวข้อใหญ่ 20pt
    p1.font.bold = True
    p1.font.color.rgb = COLOR_ACCENT_BLUE
    p1.alignment = PP_ALIGN.CENTER
    p1.space_after = Pt(22)

    p2 = tf1.add_paragraph()
    p2.text = "📘 Scope: Project Background, Objectives & Full-Stack Technology Architecture"
    p2.font.name = "Arial"
    p2.font.size = Pt(16) # คำบรรยาย 16pt
    p2.font.color.rgb = COLOR_TEXT_BODY
    p2.alignment = PP_ALIGN.CENTER
    p2.space_after = Pt(26)

    p3 = tf1.add_paragraph()
    p3.text = "Digital Technology Project v2.5   |   Developer Team: BlueHouse Jobs   |   GitHub: Dpopeyes/job-matching"
    p3.font.name = "Arial"
    p3.font.size = Pt(16) # คำบรรยาย 16pt
    p3.font.bold = True
    p3.font.color.rgb = COLOR_ACCENT_GREEN
    p3.alignment = PP_ALIGN.CENTER

    slide1.notes_slide.notes_text_frame.text = (
        "--- ENGLISH SPEECH SCRIPT ---\n"
        "Good morning/afternoon, respected committee members and audience. Welcome to our presentation.\n\n"
        "Today, we are excited to introduce our project called 'BlueHouse Jobs'—a Smart Job Matching Platform designed specifically for fresh graduates and employers.\n\n"
        "--- THAI TRANSLATION & VOCAL TIPS ---\n"
        "คำแปล: สวัสดีครับ/ค่ะ ท่านกรรมการและผู้ฟังทุกท่าน ขอต้อนรับสู่การนำเสนอโครงงาน วันนี้พวกเรามีความยินดีอย่างยิ่งที่จะมานำเสนอโครงการ 'BlueHouse Jobs' แพลตฟอร์มคัดกรองจัดหางานอัจฉริยะสำหรับนักศึกษาจบใหม่และองค์กรนายจ้าง\n"
        "เทคนิค: พูดด้วยน้ำเสียงแจ่มใส มั่นใจ สบตากรรมการ และเน้นเสียงคำว่า 'BlueHouse Jobs' และ 'Smart Job Matching Platform'"
    )

    # ==========================================
    # SLIDE 2: BACKGROUND & THE CHALLENGE
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_bg(slide2)
    add_slide_header(slide2, "Part 1: Background & The Challenge", "Key challenges in modern graduate recruitment and our software solution")

    # Left Card: Problem Statement
    add_card(slide2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.1), COLOR_CARD_PURE, COLOR_BORDER_LIGHT)
    add_top_accent_bar(slide2, Inches(0.8), Inches(1.8), Inches(5.6), RGBColor(0xDC, 0x26, 0x26))

    tb_l = slide2.shapes.add_textbox(Inches(1.0), Inches(2.05), Inches(5.2), Inches(4.6))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True

    p0 = tf_l.paragraphs[0]
    p0.text = "❌ Problem Statement (ปัญหาที่พบ)"
    p0.font.name = "Arial"
    p0.font.size = Pt(18) # หัวข้อ 18pt
    p0.font.bold = True
    p0.font.color.rgb = RGBColor(0xDC, 0x26, 0x26)
    p0.space_after = Pt(14)

    probs = [
        ("Cluttered & Complex UI", "Traditional job sites feature overcrowded, difficult layouts that confuse fresh graduates."),
        ("Severe Skill Mismatch", "Lack of intelligent screening causes gap between student skills & employer needs."),
        ("Slow Recruitment Flow", "Complicated application flows delay HR feedback & candidate selection.")
    ]

    for title, desc in probs:
        pt = tf_l.add_paragraph()
        pt.text = f"▪ {title}"
        pt.font.name = "Arial"
        pt.font.size = Pt(18) # หัวข้อ 18pt
        pt.font.bold = True
        pt.font.color.rgb = COLOR_NAVY_MAIN

        pd = tf_l.add_paragraph()
        pd.text = desc
        pd.font.name = "Arial"
        pd.font.size = Pt(16) # คำบรรยาย 16pt
        pd.font.color.rgb = COLOR_TEXT_BODY
        pd.space_after = Pt(12)

    # Right Card: Solution
    add_card(slide2, Inches(6.9), Inches(1.8), Inches(5.6), Inches(5.1), COLOR_CARD_PURE, COLOR_BORDER_LIGHT)
    add_top_accent_bar(slide2, Inches(6.9), Inches(1.8), Inches(5.6), COLOR_ACCENT_GREEN)

    tb_r = slide2.shapes.add_textbox(Inches(7.1), Inches(2.05), Inches(5.2), Inches(4.6))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True

    p0 = tf_r.paragraphs[0]
    p0.text = "✅ BlueHouse Jobs Solution (วิธีแก้)"
    p0.font.name = "Arial"
    p0.font.size = Pt(18) # หัวข้อ 18pt
    p0.font.bold = True
    p0.font.color.rgb = COLOR_ACCENT_GREEN
    p0.space_after = Pt(14)

    sols = [
        ("Modern & Clean Interface", "Designed with card layout, dynamic search filtering, and mobile responsiveness."),
        ("Dynamic AI Match Rate %", "Automated AI matching engine evaluating candidate skill compatibility (15%-100%)."),
        ("Integrated 3-Role System", "Unified platform empowering Job Seekers, Employers, and Admin Moderation.")
    ]

    for title, desc in sols:
        pt = tf_r.add_paragraph()
        pt.text = f"✔ {title}"
        pt.font.name = "Arial"
        pt.font.size = Pt(18) # หัวข้อ 18pt
        pt.font.bold = True
        pt.font.color.rgb = COLOR_NAVY_MAIN

        pd = tf_r.add_paragraph()
        pd.text = desc
        pd.font.name = "Arial"
        pd.font.size = Pt(16) # คำบรรยาย 16pt
        pd.font.color.rgb = COLOR_TEXT_BODY
        pd.space_after = Pt(12)

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
    # SLIDE 3: MAIN PROJECT OBJECTIVES (EXACT 4-CARD SIDE-BY-SIDE LAYOUT AS IN SCREENSHOT)
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_bg(slide3)
    add_slide_header(slide3, "Part 1: Main Project Objectives", "Four core goals driving the design and architecture of BlueHouse Jobs")

    # 4 Horizontal Side-by-Side Cards (matching reference image)
    # Card Width: 2.75 in, Height: 5.0 in, Gap: 0.24 in
    card_data = [
        (
            Inches(0.8), COLOR_ACCENT_BLUE, "< />",
            "Modern SPA",
            "Build an intuitive, responsive Single Page Application optimized for mobile and desktop screens."
        ),
        (
            Inches(3.79), COLOR_ACCENT_GREEN, "Y",
            "Effortless Search",
            "Empower candidates to filter listings by location, salary range, and category with fast 1-click apply."
        ),
        (
            Inches(6.78), COLOR_ACCENT_ORANGE, "🏢",
            "Employer Hub",
            "Equip hiring organizations with tools to publish vacancies, manage listings, and inspect applicants."
        ),
        (
            Inches(9.77), COLOR_ACCENT_PURPLE, "🛡️",
            "Admin Safety",
            "Provide moderation controls to review job postings, eliminate spam, and ensure community safety."
        )
    ]

    for left, accent_color, icon_symbol, title, desc in card_data:
        # Card Container
        add_card(slide3, left, Inches(1.8), Inches(2.75), Inches(5.0), COLOR_CARD_PURE, COLOR_BORDER_LIGHT)
        # Top Colored Accent Bar (matches screenshot)
        add_top_accent_bar(slide3, left, Inches(1.8), Inches(2.75), accent_color)

        # Filled Icon Badge (matches screenshot)
        add_icon_badge(slide3, left + Inches(0.25), Inches(2.15), icon_symbol, accent_color, Inches(0.65), Inches(0.65))

        # Text Frame
        tb = slide3.shapes.add_textbox(left + Inches(0.2), Inches(3.0), Inches(2.35), Inches(3.6))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = title
        p0.font.name = "Arial"
        p0.font.size = Pt(18) # Card Title 18pt bold
        p0.font.bold = True
        p0.font.color.rgb = COLOR_TITLE_DARK
        p0.space_after = Pt(10)

        p1 = tf.add_paragraph()
        p1.text = desc
        p1.font.name = "Arial"
        p1.font.size = Pt(16) # Description 16pt
        p1.font.color.rgb = COLOR_TEXT_BODY

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
    # SLIDE 4: TECH STACK & ARCHITECTURE
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_bg(slide4)
    add_slide_header(slide4, "Part 2: Tech Stack & Architecture", "Industry-standard technology stack chosen for high performance & security")

    stacks = [
        (Inches(0.8), "FRONTEND STACK", COLOR_ACCENT_BLUE, [
            ("⚡ React.js (Vite Core)", "Single Page Application (SPA) architecture for ultra-fast rendering without page reloads."),
            ("🎨 Custom Vanilla CSS3", "Modern glassmorphic card design system, dynamic gradients & clean typography."),
            ("✨ Lucide-React Icons", "Vector iconography providing clear visual cues for user interactions.")
        ]),
        (Inches(4.9), "BACKEND WEB SERVER", COLOR_ACCENT_GREEN, [
            ("🚀 Node.js + Express.js", "High-performance asynchronous JavaScript runtime serving RESTful API routes."),
            ("🔒 Role-Based Security", "RBAC middleware enforcing strict permissions for User, Employer & Admin."),
            ("🌐 Modular REST Routes", "Structured API endpoints for Jobs, Applications, Users & Chat services.")
        ]),
        (Inches(9.0), "DATABASE & DEVOPS", COLOR_NAVY_MAIN, [
            ("💾 Universal SQLite3", "Relational database storing Users, Jobs, Applications & Chat logs safely."),
            ("☁️ Git & GitHub Cloud", "Version control & repository collaboration at Dpopeyes/job-matching."),
            ("📦 Production Ready", "Vite build pipeline & Node server configuration for production readiness.")
        ])
    ]

    for left, col_tag, col_color, items in stacks:
        add_card(slide4, left, Inches(1.8), Inches(3.6), Inches(5.1), COLOR_CARD_PURE, COLOR_BORDER_LIGHT)
        add_top_accent_bar(slide4, left, Inches(1.8), Inches(3.6), col_color)

        tb = slide4.shapes.add_textbox(left + Inches(0.2), Inches(2.1), Inches(3.2), Inches(4.6))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = col_tag
        p0.font.name = "Arial"
        p0.font.size = Pt(18) # หัวข้อ 18pt
        p0.font.bold = True
        p0.font.color.rgb = col_color
        p0.space_after = Pt(12)

        for i, (title, desc) in enumerate(items):
            pt = tf.add_paragraph()
            pt.text = f"▪ {title}"
            pt.font.name = "Arial"
            pt.font.size = Pt(18) # หัวข้อ 18pt
            pt.font.bold = True
            pt.font.color.rgb = COLOR_NAVY_MAIN

            pd = tf.add_paragraph()
            pd.text = f"  {desc}"
            pd.font.name = "Arial"
            pd.font.size = Pt(16) # คำบรรยาย 16pt
            pd.font.color.rgb = COLOR_TEXT_BODY
            pd.space_after = Pt(10)

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
    # SLIDE 5: AI ENGINE & DATABASE PLATFORM
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_bg(slide5)
    add_slide_header(slide5, "Part 2: AI Engine & Database Platform", "Advanced candidate screening algorithm & real-time Google Gemini AI evaluation")

    # Formula Card Top
    add_card(slide5, Inches(0.8), Inches(1.8), Inches(11.733), Inches(2.35), COLOR_CARD_PURE, COLOR_BORDER_LIGHT)
    add_top_accent_bar(slide5, Inches(0.8), Inches(1.8), Inches(11.733), COLOR_ACCENT_BLUE)

    tb_f = slide5.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.3), Inches(2.05))
    tf_f = tb_f.text_frame
    tf_f.word_wrap = True

    pf0 = tf_f.paragraphs[0]
    pf0.text = "🎯 AI Match Rate Formula (สูตรคำนวณอัตโนมัติ)"
    pf0.font.name = "Arial"
    pf0.font.size = Pt(18) # หัวข้อ 18pt
    pf0.font.bold = True
    pf0.font.color.rgb = COLOR_ACCENT_BLUE
    pf0.space_after = Pt(4)

    pf1 = tf_f.add_paragraph()
    pf1.text = "Match Rate (%) = (Skill Score × 70%) + (Major Score × 30%)"
    pf1.font.name = "Arial"
    pf1.font.size = Pt(20) # หัวข้อใหญ่ 20pt
    pf1.font.bold = True
    pf1.font.color.rgb = COLOR_NAVY_MAIN
    pf1.space_after = Pt(6)

    pf2 = tf_f.add_paragraph()
    pf2.text = "• Multi-Source Profile Extractor: Parses skills, project tags (#React, #JavaScript), & bio text.\n• Taxonomy Distance Engine: Evaluates major compatibility (Tech ↔ Web Dev = 100%, Design = 50%, Unrelated = 0%)."
    pf2.font.name = "Arial"
    pf2.font.size = Pt(16) # คำบรรยาย 16pt
    pf2.font.color.rgb = COLOR_TEXT_BODY

    # Gemini Card Bottom Left
    add_card(slide5, Inches(0.8), Inches(4.35), Inches(5.6), Inches(2.65), COLOR_CARD_PURE, COLOR_BORDER_LIGHT)
    add_top_accent_bar(slide5, Inches(0.8), Inches(4.35), Inches(5.6), COLOR_ACCENT_GREEN)

    tb_g = slide5.shapes.add_textbox(Inches(1.0), Inches(4.55), Inches(5.2), Inches(2.3))
    tf_g = tb_g.text_frame
    tf_g.word_wrap = True

    pg0 = tf_g.paragraphs[0]
    pg0.text = "🤖 Real-Time Google Gemini AI API"
    pg0.font.name = "Arial"
    pg0.font.size = Pt(18) # หัวข้อ 18pt
    pg0.font.bold = True
    pg0.font.color.rgb = COLOR_ACCENT_GREEN
    pg0.space_after = Pt(6)

    pg1 = tf_g.add_paragraph()
    pg1.text = "Integrated Google Gemini API (gemini-3.6-flash) on Node.js backend to generate real-time Thai language candidate summaries for HR."
    pg1.font.name = "Arial"
    pg1.font.size = Pt(16) # คำบรรยาย 16pt
    pg1.font.color.rgb = COLOR_TEXT_BODY

    # SQLite Card Bottom Right
    add_card(slide5, Inches(6.9), Inches(4.35), Inches(5.6), Inches(2.65), COLOR_CARD_PURE, COLOR_BORDER_LIGHT)
    add_top_accent_bar(slide5, Inches(6.9), Inches(4.35), Inches(5.6), COLOR_ACCENT_PURPLE)

    tb_db = slide5.shapes.add_textbox(Inches(7.1), Inches(4.55), Inches(5.2), Inches(2.3))
    tf_db = tb_db.text_frame
    tf_db.word_wrap = True

    pdb0 = tf_db.paragraphs[0]
    pdb0.text = "💾 Universal SQLite3 Relational DB"
    pdb0.font.name = "Arial"
    pdb0.font.size = Pt(18) # หัวข้อ 18pt
    pdb0.font.bold = True
    pdb0.font.color.rgb = COLOR_ACCENT_PURPLE
    pdb0.space_after = Pt(6)

    pdb1 = tf_db.add_paragraph()
    pdb1.text = "Central database storing Users, Job Vacancies, Applications, Portfolios, & Chat logs safely with zero mock data and instant real-time sync."
    pdb1.font.name = "Arial"
    pdb1.font.size = Pt(16) # คำบรรยาย 16pt
    pdb1.font.color.rgb = COLOR_TEXT_BODY

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
    # SLIDE 6: CONCLUSION & CLOSING (UPDATED CLOSING TEXT)
    # ==========================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_bg(slide6)

    # Closing Hero Card
    add_card(slide6, Inches(1.2), Inches(1.0), Inches(10.933), Inches(5.5), COLOR_CARD_PURE, COLOR_ACCENT_BLUE)
    add_top_accent_bar(slide6, Inches(1.2), Inches(1.0), Inches(10.933), COLOR_ACCENT_BLUE)

    tb6 = slide6.shapes.add_textbox(Inches(1.5), Inches(1.5), Inches(10.333), Inches(4.6))
    tf6 = tb6.text_frame
    tf6.word_wrap = True

    p0 = tf6.paragraphs[0]
    p0.text = "Part 2: Conclusion & Presentation Closing"
    p0.font.name = "Arial"
    p0.font.size = Pt(36)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_NAVY_MAIN
    p0.alignment = PP_ALIGN.CENTER
    p0.space_after = Pt(16)

    p1 = tf6.add_paragraph()
    p1.text = "BlueHouse Jobs effectively bridges the gap between fresh graduates and employers through a modern, secure, and AI-powered platform."
    p1.font.name = "Arial"
    p1.font.size = Pt(20) # หัวข้อใหญ่ 20pt
    p1.font.bold = True
    p1.font.color.rgb = COLOR_ACCENT_BLUE
    p1.alignment = PP_ALIGN.CENTER
    p1.space_after = Pt(26)

    p2 = tf6.add_paragraph()
    p2.text = "🎓 Thank You For Your Time & Attention"
    p2.font.name = "Arial"
    p2.font.size = Pt(20) # หัวข้อใหญ่ 20pt
    p2.font.bold = True
    p2.font.color.rgb = COLOR_ACCENT_GREEN
    p2.alignment = PP_ALIGN.CENTER
    p2.space_after = Pt(16)

    p3 = tf6.add_paragraph()
    p3.text = "That concludes our presentation for today. We are now ready for your questions!"
    p3.font.name = "Arial"
    p3.font.size = Pt(16) # คำบรรยาย 16pt
    p3.font.italic = True
    p3.font.color.rgb = COLOR_TEXT_MUTED
    p3.alignment = PP_ALIGN.CENTER

    slide6.notes_slide.notes_text_frame.text = (
        "--- ENGLISH SPEECH SCRIPT ---\n"
        "In summary, BlueHouse Jobs effectively addresses the gap between fresh graduates and employers through a modern, secure, and AI-powered platform.\n\n"
        "That concludes our presentation for today. Thank you very much for your time and attention, and we are now ready for your questions.\n\n"
        "--- THAI TRANSLATION & VOCAL TIPS ---\n"
        "คำแปล: โดยสรุปแล้ว BlueHouse Jobs ตอบโจทย์การเชื่อมโยงนักศึกษาจบใหม่กับนายจ้างด้วยแพลตฟอร์มที่ทันสมัย ปลอดภัย และมีระบบ AI ช่วยแมตช์งาน พวกเราขอจบการนำเสนอเพียงเท่านี้ ขอบคุณครับ/ค่ะ สำหรับการรับฟัง และพร้อมรับคำถามจากคณะกรรมการครับ/ค่ะ\n"
        "เทคนิค: กล่าวโค้งขอบคุณอย่างสุภาพและสบตากรรมการ"
    )

    try:
        prs.save(output_path)
        print("SUCCESS: Matching user deck presentation slides saved at " + output_path)
    except PermissionError:
        alt_path = output_path.replace(".pptx", "_ExactMatch.pptx")
        prs.save(alt_path)
        print("SUCCESS: Matching user deck presentation slides saved at " + alt_path)

if __name__ == "__main__":
    create_matching_user_deck("d:/work90/bluehouse/BlueHouse_Jobs_Presentation_Slides.pptx")
