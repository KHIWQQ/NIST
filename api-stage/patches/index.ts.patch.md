# Patch: `src/index.ts`

เพิ่ม seed function `seedNistData` และเรียกใน `bootstrap()` (mirror ของ `seedMitreData`)

## 1. เพิ่ม import + interface (บน file)

```diff
 import mitre from "./nahee/mitre.enterprise.json";
 import mitre_ics from "./nahee/mitre.ics.json";
+import nist from "./nahee/nist.csf2.json";

 interface MitreRawItem { ... }
 interface MitreICSRawItem { ... }

+interface NistRawItem {
+  sub_id: string;
+  sub_name: string;
+  category_id: string;
+  category_name: string;
+  function_id: string;
+  function_name: string;
+}
```

## 2. เพิ่มเรียกใน `bootstrap()`

```diff
   async bootstrap({ strapi }: { strapi: any }) {
     await seedMitreData(strapi);
     await seedMitreICSData(strapi);
+    await seedNistData(strapi);
   },
```

## 3. เพิ่ม function `seedNistData` (ต่อท้ายไฟล์)

```ts
async function seedNistData(strapi: any): Promise<void> {
  const existing = await strapi.db
    .query("api::nist-data.nist-data")
    .count();
  if (existing > 0) {
    strapi.log.info("⏭️  NIST data already seeded, skipping...");
    return;
  }
  strapi.log.info("🌱 Seeding NIST CSF 2.0 data...");
  const nistData = nist as NistRawItem[];

  for (const item of nistData) {
    await strapi.db
      .query("api::nist-data.nist-data")
      .create({
        data: {
          sub_id: item.sub_id,
          sub_name: item.sub_name,
          category_id: item.category_id,
          category_name: item.category_name,
          function_id: item.function_id,
          function_name: item.function_name,
        },
      });
  }
  strapi.log.info(`✅ Inserted ${nistData.length} NIST subcategories`);
  strapi.log.info("🎉 NIST seed complete!");
}
```

## ผลกระทบ

- Idempotent ด้วย `count() > 0` check — รัน Strapi ซ้ำได้ ไม่ insert ซ้ำ
- ทำงานครั้งเดียวหลัง DB ว่าง ใช้เวลา < 1 วินาที (106 records)
- ถ้าต้องการ re-seed ต้องลบ records ด้วยตัวเอง (เหมือน mitre)
