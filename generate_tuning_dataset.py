import json
import os

# Dataset entries for Fine-Tuning AI specifically for Career Path Matching & Job Recommendation
dataset_entries = [
    {
        "text_input": "ข้อมูลผู้สมัคร: นายสมชาย ชัยชนะ | สาขา: วิทยาการคอมพิวเตอร์ | ทักษะ: React, JavaScript, HTML/CSS, Git, Tailwind CSS | Bio: สนใจพัฒนาเว็บแอปพลิเคชันฝั่ง Frontend",
        "output": json.dumps({
            "suggestedCareerPath": "Web & Software Development (สายงานพัฒนาเว็บและซอฟต์แวร์)",
            "alternativeCareerPath": "UI/UX & Product Design (สายงานออกแบบอินเทอร์เฟซ)",
            "recommendedJobTitles": ["Junior Frontend Developer", "React Developer", "Full Stack Developer Intern"],
            "careerMatchReason": "ผู้สมัครจบตรงสายวิทยาการคอมพิวเตอร์ และมีทักษะการสร้าง Web Application ด้วย React และ Tailwind CSS โดดเด่น เหมาะสมกับสายงาน Frontend Developer 100%"
        }, ensure_ascii=False)
    },
    {
        "text_input": "ข้อมูลผู้สมัคร: นางสาววิภาดา วงศ์สว่าง | สาขา: เทคโนโลยีมัลติมีเดีย | ทักษะ: Figma, UI/UX Design, Adobe Photoshop, Wireframing | Bio: ชอบออกแบบ User Interface และวิเคราะห์พฤติกรรมผู้ใช้",
        "output": json.dumps({
            "suggestedCareerPath": "UI/UX & Graphic Design (สายงานออกแบบประสบการณ์และอินเทอร์เฟซ)",
            "alternativeCareerPath": "Digital Product Management (สายงานบริหารผลิตภัณฑ์ดิจิทัล)",
            "recommendedJobTitles": ["UX/UI Designer Junior", "Product Designer", "Graphic & Media Specialist"],
            "careerMatchReason": "จบสายมัลติมีเดียและมีทักษะ Figma กับ Wireframing ครบถ้วน เหมาะสมกับสายงานออกแบบ UX/UI และวางระบบดีไซน์ดิจิทัลเป็นอย่างยิ่ง"
        }, ensure_ascii=False)
    },
    {
        "text_input": "ข้อมูลผู้สมัคร: นายณัฐพงษ์ สุขเจริญ | สาขา: วิทยาการข้อมูล (Data Science) | ทักษะ: Python, SQL, Power BI, Pandas, Machine Learning | Bio: ชอบวิเคราะห์ตัวเลขและสร้าง Dashboard สรุปผลข้อมูล",
        "output": json.dumps({
            "suggestedCareerPath": "Data & Analytics (สายงานวิเคราะห์ข้อมูลและสารสนเทศ)",
            "alternativeCareerPath": "Business Intelligence & Data Engineering (สายงานวิศวกรรมข้อมูล)",
            "recommendedJobTitles": ["Junior Data Analyst", "BI Developer", "Data Engineer Trainee"],
            "careerMatchReason": "จบตรงสายวิทยาการข้อมูล และมีทักษะภาษา Python และ SQL ในระดับใช้งานได้จริง เหมาะกับสายงานวิเคราะห์ข้อมูลเชิงลึกเป็นพิเศษ"
        }, ensure_ascii=False)
    },
    {
        "text_input": "ข้อมูลผู้สมัคร: นางสาวธนพร อรุณศรี | สาขา: บริหารธุรกิจ (การตลาด) | ทักษะ: Digital Marketing, Content Writing, SEO, Facebook Ads, Google Analytics | Bio: สนใจทำแคมเปญการตลาดออนไลน์",
        "output": json.dumps({
            "suggestedCareerPath": "Digital Marketing & Business (สายงานการตลาดดิจิทัลและบริหารธุรกิจ)",
            "alternativeCareerPath": "Content Strategy & Brand Management (สายงานบริหารแบรนด์)",
            "recommendedJobTitles": ["Digital Marketing Specialist", "Content Marketer", "E-commerce Executive"],
            "careerMatchReason": "จบตรงสายการตลาดและมีทักษะเครื่องมือโฆษณาออนไลน์ครบถ้วน เหมาะสมกับสายงานวางแผนการตลาดดิจิทัลและบริหารแบรนด์"
        }, ensure_ascii=False)
    },
    {
        "text_input": "ข้อมูลผู้สมัคร: นายกิตติศักดิ์ มีสุข | สาขา: วิศวกรรมเครื่องกล | ทักษะ: AutoCAD, SolidWorks, MATLAB, เครื่องจักรโรงงาน | Bio: สนใจงานคุมเครื่องจักรและออกแบบระบบวิศวกรรม",
        "output": json.dumps({
            "suggestedCareerPath": "Engineering & Production (สายงานวิศวกรรมศาสตร์และคุมการผลิต)",
            "alternativeCareerPath": "Industrial Management (สายงานบริหารการจัดการอุตสาหกรรม)",
            "recommendedJobTitles": ["วิศวกรเครื่องกล Junior", "วิศวกรฝ่ายผลิต", "Plant Technician"],
            "careerMatchReason": "จบตรงสายวิศวกรรมเครื่องกล และมีทักษะซอฟต์แวร์ออกแบบ 3D AutoCAD/SolidWorks เหมาะสมกับงานวิศวกรโรงงานและการผลิตอย่างสมบูรณ์"
        }, ensure_ascii=False)
    }
]

output_path = "d:/work90/bluehouse/gemini_fine_tune_dataset.jsonl"

with open(output_path, "w", encoding="utf-8") as f:
    for entry in dataset_entries:
        json_line = json.dumps({
            "input_text": entry["text_input"],
            "output_text": entry["output"]
        }, ensure_ascii=False)
        f.write(json_line + "\n")

print(f"SUCCESS: Generated {len(dataset_entries)} Career Path Matching tuning lines at {output_path}")
