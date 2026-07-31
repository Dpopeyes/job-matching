# 💼 FreshGrad Jobs — แพลตฟอร์มหางานและลงประกาศงานทุกประเภท

แพลตฟอร์มศูนย์รวมตำแหน่งงานสำหรับผู้จบใหม่และบุคคลทั่วไป คัดกรองจากทักษะ (Skill-based) ครอบคลุมงานทุกสาขาอาชีพและทุกจังหวัดทั่วประเทศไทย พร้อมระบบให้นายจ้างลงประกาศรับสมัครงานได้จริง

---

## 🌟 คุณสมบัติเด่นของระบบ (Key Features)

- 🌐 **หางานได้ทุกประเภททุกสายอาชีพ**: ไอที, การตลาด, บัญชี/การเงิน, วิศวกรรม, HR/ธุรการ, ออกแบบกราฟิก, งานฝึกงาน/พาร์ทไทม์
- 📍 **รองรับการค้นหา 77 จังหวัดทั่วไทย**: รวมถึงตำแหน่งงานแบบ Work From Home / Remote
- 🏢 **ระบบสำหรับนายจ้าง (Employer Portal)**: สามารถลงทะเบียนเปิดเผยข้อมูลองค์กรจริง และโพสต์ประกาศรับสมัครงานลงฐานข้อมูลได้ทันที
- 🗄️ **ระบบฐานข้อมูลจริง (SQLite + Express REST API)**: จัดเก็บข้อมูลผู้ใช้, ประกาศงาน, คลังทักษะ และใบสมัครงานคงทนถาวร
- 🔑 **ระบบสมัครสมาชิก & เข้าสู่ระบบจริง**: รองรับการตรวจสอบอีเมล/รหัสผ่าน และสแกนใบหน้าเข้าสู่ระบบ (Face KYC Login)
- 📱 **โปรไฟล์ดิจิทัล & การจัดการทักษะ**: เพิ่ม/ลบ ทักษะส่วนตัวลง DB และแชร์โปรไฟล์ผ่าน QR Code & NFC Digital Card

---

## 🚀 ขั้นตอนการติดตั้งและรันใช้งาน (Installation & Setup Guide)

### 1. ดาวน์โหลดโปรเจกต์ (Clone Repository)
```bash
git clone https://github.com/Dpopeyes/job-matching.git
cd job-matching
```

### 2. ติดตั้ง Dependencies ทั้งหมด
```bash
npm install
```

### 3. รันระบบเซิร์ฟเวอร์ฐานข้อมูล (Backend REST API)
```bash
node server/index.js
```
> เซิร์ฟเวอร์จะเปิดทำงานที่: **http://localhost:3001**

### 4. รันระบบหน้าเว็บ (Frontend Vite Server)
เปิด Terminal ใหม่แล้วพิมพ์:
```bash
npm run dev
```
> เข้าใช้งานหน้าเว็บผ่านเบราว์เซอร์ได้ที่: **http://localhost:5173**

---

## 🛠️ เทคโนโลยีที่ใช้ในการพัฒนา (Tech Stack)

- **Frontend**: React 18, Vite, Lucide React Icons, Pure CSS (Glassmorphism & Responsive Design)
- **Backend**: Node.js, Express.js (RESTful API Server on Port 3001)
- **Database**: SQLite Database (`server/database.sqlite`) จัดการผ่าน `better-sqlite3`

---

© 2026 FreshGrad Jobs. All Rights Reserved.
