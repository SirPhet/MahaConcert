# 🎫 MahaConcert - Event Ticketing System (NoSQL Project)

ระบบบริหารจัดการและจองตั๋วคอนเสิร์ตแบบ Full-stack CRUD พัฒนาขึ้นเพื่อประกอบการเรียนวิชา **Database System (NoSQL)** โดยเน้นการจัดการข้อมูลแบบ Document-oriented ด้วย MongoDB

## 🚀 ฟีเจอร์หลัก (Features)
- **Full CRUD Operations:** ระบบจัดการคอนเสิร์ตที่สมบูรณ์ (สร้าง, อ่าน, แก้ไข, ลบ)
- **Document Database Design:** ออกแบบฐานข้อมูลแบบ NoSQL (Embedding & Referencing)
- **Authentication & RBAC:** แยกสิทธิ์การใช้งานระหว่าง User (จองตั๋ว) และ Admin (จัดการระบบ)
- **Atomic Locking & TTL:** ระบบล็อกที่นั่งแบบเรียลไทม์เพื่อป้องกันการจองซ้ำ (Race Condition)
- **Dockerized:** รันทั้งระบบ (Frontend, Backend, Database) ได้ง่ายๆ ผ่าน Docker Compose
- **Self-Healing Data:** ระบบสร้างที่นั่งให้อัตโนมัติแม้จะเพิ่มข้อมูลผ่านฐานข้อมูลโดยตรง

## 🛠 Tech Stack
- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js, Express
- **Database:** MongoDB (NoSQL Document Database)
- **Infrastructure:** Docker, Docker Compose

## 📦 การติดตั้งและเริ่มต้นใช้งาน (Installation)

### วิธีที่ 1: รันผ่านไฟล์สะดวกซื้อ (Windows)
1. เปิดโฟลเดอร์โปรเจ็ค
2. ดับเบิลคลิกที่ไฟล์ **`run_app.bat`**
3. ระบบจะเปิดหน้าเว็บ `http://localhost:5173` ให้โดยอัตโนมัติ

### วิธีที่ 2: รันผ่านคำสั่ง Terminal
```bash
docker-compose up -d --build
```

## 🔐 บัญชีผู้ใช้สำหรับทดสอบ (Test Accounts)
| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **User** | `user` | `user123` |

## 📂 โครงสร้างฐานข้อมูล (NoSQL Schema)
- **Events:** เก็บข้อมูลคอนเสิร์ตและโซนที่นั่ง (Nested Document)
- **Tickets:** เก็บข้อมูลที่นั่งรายใบ สัมพันธ์กับ EventId (Referencing)
- **Users:** เก็บข้อมูลผู้ใช้และรหัสผ่านที่เข้ารหัสแล้ว (Bcrypt)
- **Orders:** เก็บประวัติการทำธุรกรรมและการชำระเงิน

---
พัฒนาโดย: [ชื่อของคุณ]
วิชา: Database System (NoSQL)
