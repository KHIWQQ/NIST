# NIST API Stage

ไฟล์ทั้งหมดที่ต้องเอาไปใส่ใน `rtaf-api` เพื่อรองรับการแท็ก NIST CSF 2.0 ให้ Challenge

โครงสร้างและ pattern mirror ของ `mitre-data` ที่มีอยู่แล้วใน rtaf-api ทุกประการ

## ภาพรวม

| ไฟล์ใน stage | ปลายทางใน `rtaf-api` | ประเภท |
|---|---|---|
| `nist-data/` ทั้งโฟลเดอร์ | `src/api/nist-data/` | **คัดลอกใหม่ทั้งโฟลเดอร์** |
| `nahee/nist.csf2.json` | `src/nahee/nist.csf2.json` | **คัดลอกไฟล์ใหม่** |
| `patches/challenge-schema.patch.md` | `src/api/challenge/content-types/challenge/schema.json` | **แก้ไฟล์เดิม** (เพิ่ม relation) |
| `patches/index.ts.patch.md` | `src/index.ts` | **แก้ไฟล์เดิม** (เพิ่ม seed) |

## API Endpoints ที่จะได้

| Method | Path | Body | คำอธิบาย |
|---|---|---|---|
| `GET` | `/nist-data/matrix` | – | ดึง matrix NIST ทั้งหมด (function → category → sub + challenges ที่ผูก) |
| `PUT` | `/nist-data/challenge/:challengeDocumentId/link` | `{ nistDocumentIds: string[] }` | ติด tag NIST ให้โจทย์ (replace ทั้งหมด) |
| `DELETE` | `/nist-data/challenge/:challengeDocumentId/unlink` | `{ nistDocumentIds: string[] }` | ปลด tag NIST ที่ระบุ |

## ขั้นตอน Merge เข้า `rtaf-api`

```bash
# 1. คัดลอกโฟลเดอร์ nist-data ทั้งดุ้น
cp -r /Users/khiwqq/Documents/Todigi/NIST/api-stage/nist-data \
      /Users/khiwqq/Documents/Todigi/rtaf-api/src/api/

# 2. คัดลอก seed JSON
cp /Users/khiwqq/Documents/Todigi/NIST/api-stage/nahee/nist.csf2.json \
   /Users/khiwqq/Documents/Todigi/rtaf-api/src/nahee/

# 3. แก้ไฟล์เดิม 2 ที่ (ตาม patch ด้านล่าง)
#    - src/api/challenge/content-types/challenge/schema.json
#    - src/index.ts
```

ดูรายละเอียดแต่ละ patch ที่:
- `patches/challenge-schema.patch.md`
- `patches/index.ts.patch.md`

## การทดสอบ

```bash
# Start Strapi (จะ seed อัตโนมัติครั้งแรก)
cd /Users/khiwqq/Documents/Todigi/rtaf-api
yarn develop

# ทดสอบดึง matrix
curl http://localhost:1337/api/nist-data/matrix

# ทดสอบ link tag (สมมุติ challenge มี documentId = "abc123",
# NIST sub "DE.CM-01" มี documentId = "xyz789")
curl -X PUT http://localhost:1337/api/nist-data/challenge/abc123/link \
  -H "Content-Type: application/json" \
  -d '{"nistDocumentIds":["xyz789"]}'

# ทดสอบ unlink
curl -X DELETE http://localhost:1337/api/nist-data/challenge/abc123/unlink \
  -H "Content-Type: application/json" \
  -d '{"nistDocumentIds":["xyz789"]}'
```

## หมายเหตุเรื่อง Permission

Strapi 5 default ตั้ง endpoint custom เป็น **public off** ต้องไปเปิดที่:

```
Admin Panel → Settings → Users & Permissions Plugin → Roles → Public (หรือ Authenticated)
  → ขยายส่วน Nist-data → ติ๊ก getNistMatrix, linkNistToChallenge, unlinkNistFromChallenge
```

(เหมือน workflow ที่ทำกับ mitre-data ตอนแรก)

## Frontend Integration

หลัง merge เสร็จและทดสอบ endpoint ผ่านแล้ว:

1. เปิดไฟล์ `NIST/src/services/nistChallengeService.ts`
2. เปลี่ยน `const USE_REAL_API = false` → `true`
3. ตรวจสอบ `VITE_API_BASE_URL` ใน `.env` ของ NIST frontend ให้ชี้ที่ `http://localhost:1337/api`
4. อัปเดต `RemoteChallengeAdapter` ให้เรียก `/nist-data/matrix` แทน `/nist/challenges`
   (ผมจะแก้ให้ในเฟส 3)
