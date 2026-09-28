import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_enhanced_presentation(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Premium Color Palette
    COLOR_NAVY_DARK    = RGBColor(0x0F, 0x17, 0x2A) # Slate 900
    COLOR_CARD_DARK    = RGBColor(0x1E, 0x29, 0x3B) # Slate 800
    COLOR_WHITE        = RGBColor(0xFF, 0xFF, 0xFF)
    COLOR_BG_LIGHT     = RGBColor(0xF1, 0xF5, 0xF9) # Slate 100
    COLOR_TEXT_MAIN    = RGBColor(0x0F, 0x17, 0x2A) # Slate 900 Text
    COLOR_TEXT_MUTED   = RGBColor(0x47, 0x55, 0x69) # Slate 600
    COLOR_BLUE_MAIN    = RGBColor(0x1E, 0x3A, 0x8A) # Navy Blue
    COLOR_BLUE_ACCENT  = RGBColor(0x25, 0x63, 0xEB) # Electric Royal Blue
    COLOR_TEAL_ACCENT  = RGBColor(0x0D, 0x94, 0x88) # Emerald Teal
    COLOR_CYAN_ACCENT  = RGBColor(0x02, 0x84, 0xC7) # Cyan Accent
    COLOR_RED_ACCENT   = RGBColor(0xDC, 0x26, 0x26) # Red Accent
    COLOR_GREEN_ACCENT = RGBColor(0x05, 0x96, 0x69) # Green Accent
    COLOR_BORDER_LIGHT = RGBColor(0xCB, 0xD5, 0xE1) # Slate 300

    def add_bg(slide, color):
        shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        shape.fill.solid()
        shape.fill.fore_color.rgb = color
        shape.line.fill.background()
        return shape

    def add_pill_tag(slide, left, top, text, bg_color, text_color=COLOR_WHITE, width=Inches(2.5), height=Inches(0.4)):
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = bg_color
        shape.line.fill.background()
        tf = shape.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = text
        p.font.name = "Arial"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = text_color
        p.alignment = PP_ALIGN.CENTER
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

    def add_slide_header(slide, tag_text, title_text, subtitle_text):
        add_pill_tag(slide, Inches(0.8), Inches(0.4), tag_text, COLOR_BLUE_MAIN, COLOR_WHITE, Inches(3.2), Inches(0.38))
        
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.733), Inches(0.9))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = title_text
        p0.font.name = "Arial"
        p0.font.size = Pt(24)
        p0.font.bold = True
        p0.font.color.rgb = COLOR_BLUE_MAIN
        p0.space_after = Pt(2)

        p1 = tf.add_paragraph()
        p1.text = subtitle_text
        p1.font.name = "Arial"
        p1.font.size = Pt(13)
        p1.font.color.rgb = COLOR_TEXT_MUTED

    # ==========================================
    # SLIDE 1: TITLE SLIDE (Modern Dark Aesthetic)
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)
    add_bg(slide1, COLOR_NAVY_DARK)

    # Main Center Hero Card
    add_card(slide1, Inches(1.2), Inches(1.0), Inches(10.933), Inches(5.5), COLOR_CARD_DARK, COLOR_BLUE_ACCENT)

    # Decorative Top Badge
    add_pill_tag(slide1, Inches(4.666), Inches(1.35), "PROJECT PRESENTATION • SECTIONS 1 & 2", COLOR_BLUE_ACCENT, COLOR_WHITE, Inches(4.0), Inches(0.42))

    tb1 = slide1.shapes.add_textbox(Inches(1.6), Inches(2.0), Inches(10.133), Inches(4.2))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "BLUEHOUSE JOBS"
    p0.font.name = "Arial"
    p0.font.size = Pt(44)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_CYAN_ACCENT
    p0.alignment = PP_ALIGN.CENTER
    p0.space_after = Pt(6)

    p1 = tf1.add_paragraph()
    p1.text = "Smart Job Matching Platform for Fresh Graduates & Employers"
    p1.font.name = "Arial"
    p1.font.size = Pt(20)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_WHITE
    p1.alignment = PP_ALIGN.CENTER
    p1.space_after = Pt(20)

    p2 = tf1.add_paragraph()
    p2.text = "📘 Scope: Project Background, Core Objectives & Full-Stack Technology Architecture"
    p2.font.name = "Arial"
    p2.font.size = Pt(14)
    p2.font.color.rgb = RGBColor(0xCB, 0xD5, 0xE1)
    p2.alignment = PP_ALIGN.CENTER
    p2.space_after = Pt(26)

    p3 = tf1.add_paragraph()
    p3.text = "Digital Technology Project v2.5   |   Team BlueHouse Jobs   |   GitHub: Dpopeyes/job-matching"
    p3.font.name = "Arial"
    p3.font.size = Pt(12)
    p3.font.bold = True
    p3.font.color.rgb = COLOR_TEAL_ACCENT
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
    # SLIDE 2: SECTION 1 - ORIGIN & CHALLENGES (Light Theme)
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_bg(slide2, COLOR_BG_LIGHT)
    add_slide_header(slide2, "SECTION 1: INTRODUCTION", "01 | Project Origin & Problem Statement", "Addressing key challenges in modern graduate job seeking and recruitment")

    # Left Card: The Problem
    add_card(slide2, Inches(0.8), Inches(1.85), Inches(5.6), Inches(5.1), COLOR_WHITE, COLOR_RED_ACCENT)
    add_pill_tag(slide2, Inches(1.1), Inches(2.1), "PROBLEM STATEMENT (ปัญหาที่พบ)", COLOR_RED_ACCENT, COLOR_WHITE, Inches(3.2), Inches(0.36))

    tb_l = slide2.shapes.add_textbox(Inches(1.0), Inches(2.6), Inches(5.2), Inches(4.2))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True

    problems = [
        ("❌ Cluttered & Complicated UI", "Traditional job search platforms feature overcrowded, difficult-to-navigate layouts that overwhelm fresh graduates."),
        ("❌ Severe Skill Mismatch", "Applicants apply for roles without clear skill alignment, causing high rejection rates and wasted HR evaluation time."),
        ("❌ Slow Feedback & Communication", "Lack of integrated candidate management and messaging systems delays recruitment decisions.")
    ]

    for i, (head, text) in enumerate(problems):
        p_h = tf_l.paragraphs[0] if i == 0 else tf_l.add_paragraph()
        p_h.text = head
        p_h.font.name = "Arial"
        p_h.font.size = Pt(14)
        p_h.font.bold = True
        p_h.font.color.rgb = COLOR_TEXT_MAIN

        p_t = tf_l.add_paragraph()
        p_t.text = text
        p_t.font.name = "Arial"
        p_t.font.size = Pt(11)
        p_t.font.color.rgb = COLOR_TEXT_MUTED
        p_t.space_after = Pt(10)

    # Right Card: The Solution
    add_card(slide2, Inches(6.9), Inches(1.85), Inches(5.6), Inches(5.1), COLOR_WHITE, COLOR_GREEN_ACCENT)
    add_pill_tag(slide2, Inches(7.2), Inches(2.1), "BLUEHOUSE JOBS SOLUTION (วิธีแก้ปัญหา)", COLOR_GREEN_ACCENT, COLOR_WHITE, Inches(3.4), Inches(0.36))

    tb_r = slide2.shapes.add_textbox(Inches(7.1), Inches(2.6), Inches(5.2), Inches(4.2))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True

    solutions = [
        ("✅ Modern & Clean Interface", "Designed with modern card layout, dynamic search filtering, and responsive mobile-first accessibility."),
        ("✅ Dynamic AI Match Rate %", "Automated AI matching engine evaluating candidate skill-to-job compatibility instantly (15% to 100%)."),
        ("✅ 3-Role Integrated Platform", "Unified ecosystem empowering Job Seekers, Organization Employers, and Admin Moderation seamlessly.")
    ]

    for i, (head, text) in enumerate(solutions):
        p_h = tf_r.paragraphs[0] if i == 0 else tf_r.add_paragraph()
        p_h.text = head
        p_h.font.name = "Arial"
        p_h.font.size = Pt(14)
        p_h.font.bold = True
        p_h.font.color.rgb = COLOR_TEXT_MAIN

        p_t = tf_r.add_paragraph()
        p_t.text = text
        p_t.font.name = "Arial"
        p_t.font.size = Pt(11)
        p_t.font.color.rgb = COLOR_TEXT_MUTED
        p_t.space_after = Pt(10)

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
    # SLIDE 3: SECTION 1.1 - OBJECTIVES (4 Easy-to-Read Cards)
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_bg(slide3, COLOR_BG_LIGHT)
    add_slide_header(slide3, "SECTION 1.1: OBJECTIVES", "01.1 | Four Primary Core Objectives", "Specific goals guiding the architectural design and features of BlueHouse Jobs")

    cards_obj = [
        (Inches(0.8), Inches(1.85), "🎯 Objective 1", "Modern & Responsive Web Portal", "Develop an intuitive, Single Page Application accessible seamlessly from desktop computers, tablets, and smartphones."),
        (Inches(6.9), Inches(1.85), "🎓 Objective 2", "Streamlined Job Seeker Experience", "Enable fresh graduates to search jobs by location, salary range, & category, while viewing dynamic skill match compatibility."),
        (Inches(0.8), Inches(4.5), "🏢 Objective 3", "Systematic Employer Recruitment", "Empower organization employers to post job vacancies, manage listings, and review candidate applications efficiently."),
        (Inches(6.9), Inches(4.5), "🛡️ Objective 4", "Secure Admin Moderation Control", "Provide an Admin Moderation System to verify users, monitor job posts, and enforce platform security standards.")
    ]

    for left, top, tag, title, desc in cards_obj:
        add_card(slide3, left, top, Inches(5.6), Inches(2.4), COLOR_WHITE, COLOR_BORDER_LIGHT)
        
        tb = slide3.shapes.add_textbox(left + Inches(0.25), top + Inches(0.2), Inches(5.1), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = tag
        p0.font.name = "Arial"
        p0.font.size = Pt(13)
        p0.font.bold = True
        p0.font.color.rgb = COLOR_BLUE_ACCENT
        p0.space_after = Pt(2)

        p1 = tf.add_paragraph()
        p1.text = title
        p1.font.name = "Arial"
        p1.font.size = Pt(15)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_TEXT_MAIN
        p1.space_after = Pt(6)

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = "Arial"
        p2.font.size = Pt(11)
        p2.font.color.rgb = COLOR_TEXT_MUTED

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
    # SLIDE 4: SECTION 2 - TECH STACK (3 Vertical Cards)
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_bg(slide4, COLOR_BG_LIGHT)
    add_slide_header(slide4, "SECTION 2: TECHNOLOGIES & TOOLS", "02 | Full-Stack Development Architecture", "Modern web technologies chosen for performance, scalability, and security")

    columns_tech = [
        (Inches(0.8), "FRONTEND STACK", COLOR_BLUE_ACCENT, [
            ("⚡ React.js (Vite Core)", "Single Page Application (SPA) architecture for ultra-fast rendering without page reloads."),
            ("🎨 Custom Vanilla CSS3", "Modern glassmorphic card design system, dynamic gradients & clean typography."),
            ("✨ Lucide-React Icons", "Vector iconography providing clear visual cues for user interactions.")
        ]),
        (Inches(4.9), "BACKEND WEB SERVER", COLOR_TEAL_ACCENT, [
            ("🚀 Node.js + Express.js", "High-performance asynchronous JavaScript runtime serving RESTful API routes."),
            ("🔒 Role-Based Security", "RBAC middleware enforcing strict permissions for User, Employer & Admin."),
            ("🌐 Modular REST Routes", "Structured API endpoints for Jobs, Applications, Users & Chat services.")
        ]),
        (Inches(9.0), "DATABASE & DEVOPS", COLOR_BLUE_MAIN, [
            ("💾 Universal SQLite3", "Relational database storing Users, Jobs, Applications & Chat logs safely."),
            ("☁️ Git & GitHub Cloud", "Version control & repository collaboration at Dpopeyes/job-matching."),
            ("📦 Production Ready", "Vite build pipeline & Node server configuration for production readiness.")
        ])
    ]

    for left, col_tag, col_color, items in columns_tech:
        add_card(slide4, left, Inches(1.85), Inches(3.6), Inches(5.1), COLOR_WHITE, col_color)
        add_pill_tag(slide4, left + Inches(0.3), Inches(2.05), col_tag, col_color, COLOR_WHITE, Inches(3.0), Inches(0.36))

        tb = slide4.shapes.add_textbox(left + Inches(0.2), Inches(2.55), Inches(3.2), Inches(4.3))
        tf = tb.text_frame
        tf.word_wrap = True

        for i, (title, desc) in enumerate(items):
            pt = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            pt.text = title
            pt.font.name = "Arial"
            pt.font.size = Pt(13)
            pt.font.bold = True
            pt.font.color.rgb = COLOR_TEXT_MAIN

            pd = tf.add_paragraph()
            pd.text = desc
            pd.font.name = "Arial"
            pd.font.size = Pt(10.5)
            pd.font.color.rgb = COLOR_TEXT_MUTED
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
    # SLIDE 5: SECTION 2 - SMART AI ENGINE (Feature Focus Slide)
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_bg(slide5, COLOR_BG_LIGHT)
    add_slide_header(slide5, "SECTION 2: AI & DATABASE ENGINE", "02.1 | Intelligent AI Matching & Database", "Advanced candidate screening algorithm & real-time Google Gemini AI integration")

    # Top Hero Feature Card: AI Formula
    add_card(slide5, Inches(0.8), Inches(1.85), Inches(11.733), Inches(2.2), COLOR_WHITE, COLOR_BLUE_ACCENT)
    add_pill_tag(slide5, Inches(1.1), Inches(2.05), "AI MATCH RATE FORMULA (สูตรคำนวณ)", COLOR_BLUE_ACCENT, COLOR_WHITE, Inches(3.2), Inches(0.35))

    tb_formula = slide5.shapes.add_textbox(Inches(1.0), Inches(2.45), Inches(11.3), Inches(1.5))
    tf_f = tb_formula.text_frame
    tf_f.word_wrap = True

    pf0 = tf_f.paragraphs[0]
    pf0.text = "🎯 Match Rate (%) = (Skill Score × 70%) + (Major Score × 30%)"
    pf0.font.name = "Arial"
    pf0.font.size = Pt(16)
    pf0.font.bold = True
    pf0.font.color.rgb = COLOR_BLUE_MAIN
    pf0.space_after = Pt(4)

    pf1 = tf_f.add_paragraph()
    pf1.text = "• Multi-Source Profile Extractor: Parses skills, project tags (#React, #JavaScript), & bio descriptions automatically.\n• Taxonomy Cluster Distance: Computes major compatibility (Tech ↔ Web Dev = 100%, Design = 50%, Unrelated = 0%)."
    pf1.font.name = "Arial"
    pf1.font.size = Pt(11)
    pf1.font.color.rgb = COLOR_TEXT_MUTED

    # Bottom Left Card: Gemini AI
    add_card(slide5, Inches(0.8), Inches(4.3), Inches(5.6), Inches(2.6), COLOR_WHITE, COLOR_TEAL_ACCENT)
    add_pill_tag(slide5, Inches(1.1), Inches(4.5), "GOOGLE GEMINI AI API", COLOR_TEAL_ACCENT, COLOR_WHITE, Inches(2.8), Inches(0.35))

    tb_gemini = slide5.shapes.add_textbox(Inches(1.0), Inches(4.9), Inches(5.2), Inches(1.9))
    tf_g = tb_gemini.text_frame
    tf_g.word_wrap = True

    pg0 = tf_g.paragraphs[0]
    pg0.text = "🤖 Real-Time Candidate Analysis"
    pg0.font.name = "Arial"
    pg0.font.size = Pt(14)
    pg0.font.bold = True
    pg0.font.color.rgb = COLOR_TEXT_MAIN
    pg0.space_after = Pt(4)

    pg1 = tf_g.add_paragraph()
    pg1.text = "Integrated Google Gemini API (gemini-3.6-flash) on Express backend to generate real-time Thai language candidate summaries for HR."
    pg1.font.name = "Arial"
    pg1.font.size = Pt(11)
    pg1.font.color.rgb = COLOR_TEXT_MUTED

    # Bottom Right Card: SQLite DB
    add_card(slide5, Inches(6.9), Inches(4.3), Inches(5.6), Inches(2.6), COLOR_WHITE, COLOR_BLUE_MAIN)
    add_pill_tag(slide5, Inches(7.2), Inches(4.5), "SHARED SQLITE3 DATABASE", COLOR_BLUE_MAIN, COLOR_WHITE, Inches(3.0), Inches(0.35))

    tb_sqlite = slide5.shapes.add_textbox(Inches(7.1), Inches(4.9), Inches(5.2), Inches(1.9))
    tf_sq = tb_sqlite.text_frame
    tf_sq.word_wrap = True

    psq0 = tf_sq.paragraphs[0]
    psq0.text = "💾 Centralized Shared Relational DB"
    psq0.font.name = "Arial"
    psq0.font.size = Pt(14)
    psq0.font.bold = True
    psq0.font.color.rgb = COLOR_TEXT_MAIN
    psq0.space_after = Pt(4)

    psq1 = tf_sq.add_paragraph()
    psq1.text = "Central database storing Users, Job Vacancies, Applications, Portfolios, & Chat messages with zero mock data and instant sync."
    psq1.font.name = "Arial"
    psq1.font.size = Pt(11)
    psq1.font.color.rgb = COLOR_TEXT_MUTED

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
    add_bg(slide6, COLOR_NAVY_DARK)

    # Card Panel
    add_card(slide6, Inches(1.2), Inches(1.0), Inches(10.933), Inches(5.5), COLOR_CARD_DARK, COLOR_CYAN_ACCENT)

    tb6 = slide6.shapes.add_textbox(Inches(1.6), Inches(1.4), Inches(10.133), Inches(4.7))
    tf6 = tb6.text_frame
    tf6.word_wrap = True

    p0 = tf6.paragraphs[0]
    p0.text = "SUMMARY & DEMO TRANSITION"
    p0.font.name = "Arial"
    p0.font.size = Pt(36)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_CYAN_ACCENT
    p0.alignment = PP_ALIGN.CENTER
    p0.space_after = Pt(14)

    p1 = tf6.add_paragraph()
    p1.text = "BlueHouse Jobs effectively bridges the gap between fresh graduates and employers through a modern, secure, and AI-powered platform."
    p1.font.name = "Arial"
    p1.font.size = Pt(18)
    p1.font.color.rgb = COLOR_WHITE
    p1.alignment = PP_ALIGN.CENTER
    p1.space_after = Pt(28)

    p2 = tf6.add_paragraph()
    p2.text = "🎬 Next Step: Live Application Demonstration"
    p2.font.name = "Arial"
    p2.font.size = Pt(22)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEAL_ACCENT
    p2.alignment = PP_ALIGN.CENTER
    p2.space_after = Pt(16)

    p3 = tf6.add_paragraph()
    p3.text = "Thank you very much for your time and attention. We are now ready for your questions!"
    p3.font.name = "Arial"
    p3.font.size = Pt(15)
    p3.font.italic = True
    p3.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)
    p3.alignment = PP_ALIGN.CENTER

    slide6.notes_slide.notes_text_frame.text = (
        "--- ENGLISH SPEECH SCRIPT ---\n"
        "In summary, BlueHouse Jobs effectively addresses the gap between fresh graduates and employers through a modern, secure, and AI-powered platform.\n\n"
        "Now, we would like to invite you to watch a live demonstration of our application in action. Thank you very much, and we are ready for your questions.\n\n"
        "--- THAI TRANSLATION & VOCAL TIPS ---\n"
        "คำแปล: โดยสรุปแล้ว BlueHouse Jobs ตอบโจทย์การเชื่อมโยงนักศึกษาจบใหม่กับนายจ้างด้วยแพลตฟอร์มที่ทันสมัย ปลอดภัย และมีระบบ AI ช่วยแมตช์งาน ลำดับต่อไป ขอเชิญรับชมการสาธิตการใช้งานระบบจริง (Live Demo) ขอบคุณครับ/ค่ะ และพร้อมรับคำถามจากคณะกรรมการครับ/ค่ะ\n"
        "เทคนิค: กล่าวโค้งขอบคุณอย่างสุภาพ ผายมือไปที่หน้าจอสำหรับการสาธิตระบบจริง (Live Demo)"
    )

    prs.save(output_path)
    print("SUCCESS: Enhanced PowerPoint presentation slides saved at " + output_path)

if __name__ == "__main__":
    create_enhanced_presentation("d:/work90/bluehouse/BlueHouse_Jobs_Presentation_Slides.pptx")
