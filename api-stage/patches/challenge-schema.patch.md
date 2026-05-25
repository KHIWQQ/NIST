# Patch: `src/api/challenge/content-types/challenge/schema.json`

เพิ่ม relation `nist_datas` เข้าไปใน `attributes` (วางตำแหน่งไหนก็ได้ แนะนำไว้ต่อท้าย `mitre_ics_datas`)

```diff
     "mitre_ics_datas": {
       "type": "relation",
       "relation": "manyToMany",
       "target": "api::mitre-ics-data.mitre-ics-data",
       "mappedBy": "challenges"
     },
+    "nist_datas": {
+      "type": "relation",
+      "relation": "manyToMany",
+      "target": "api::nist-data.nist-data",
+      "mappedBy": "challenges"
+    },
     "atdf_owner_team": {
```

## ผลกระทบ

- Strapi จะสร้าง join table `challenges_nist_datas_links` อัตโนมัติตอน startup
- ไม่กระทบ field/relation เดิม
- ไม่ต้องเขียน migration เอง
