// Render a sample pentest report PDF using node to verify the new layout
// without spinning up the dev server. Saves to /tmp/pentest-report-new.pdf.
//
// Usage:  node scripts/render-pdf-sample.mjs

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

// Use plain absolute file-system paths so @react-pdf/font reads them via
// fs instead of fetch (node's undici doesn't implement file:// URLs).
process.env.PUBLIC_FONT_ROOT = path.join(ROOT, 'public', 'fonts');

// Stub `window` minimally so Intl.Segmenter check passes.
globalThis.window ??= {};

const { Font, pdf } = await import('@react-pdf/renderer');
const React = (await import('react')).default;

// Register fonts using local file:// URLs.
Font.register({
  family: 'Sarabun',
  fonts: [
    { src: `${process.env.PUBLIC_FONT_ROOT}/Sarabun-Regular.ttf`, fontWeight: 400 },
    { src: `${process.env.PUBLIC_FONT_ROOT}/Sarabun-Medium.ttf`, fontWeight: 500 },
    { src: `${process.env.PUBLIC_FONT_ROOT}/Sarabun-SemiBold.ttf`, fontWeight: 600 },
    { src: `${process.env.PUBLIC_FONT_ROOT}/Sarabun-Bold.ttf`, fontWeight: 700 },
  ],
});

// Reuse the same Thai segmenter behaviour as the app.
Font.registerHyphenationCallback((word) => {
  if (!/[฀-๿]/.test(word)) return [word];
  try {
    const seg = new Intl.Segmenter('th', { granularity: 'word' });
    return [...seg.segment(word)].map((s) => s.segment);
  } catch {
    return [word];
  }
});

// Mark pdfFonts as already-registered so the dynamic import doesn't try
// to re-register with /fonts/* (server) paths.
globalThis.__PDF_FONTS_REGISTERED__ = true;

// Patch the source-level register to be a no-op for this script.
// We do this by importing the module after blowing away its register fn —
// trick is to set a flag the module respects. Our module gates on a
// module-local `registered` boolean we can't reach, so instead intercept by
// monkey-patching Font.register to no-op after first call (already done above).
const origRegister = Font.register;
Font.register = () => {}; // app's registerPdfFonts() now becomes a no-op.

// Now import the PDF component (registers fonts internally — now no-op).
const { default: PentestReportPdf } = await import(
  `${path.join(ROOT, 'src/components/PentestReport/PentestReportPdf.tsx')}`
);
Font.register = origRegister; // restore

// Build a richly-populated sample report so every panel renders.
const sample = {
  orgName: 'กรมเทคโนโลยีสารสนเทศและการสื่อสาร (ตัวอย่าง)',
  reportTitle: 'รายงานผลการตรวจสอบการรักษาความมั่นคงปลอดภัยทางไซเบอร์เชิงเทคนิค',
  logo: null,
  team: [
    { name: 'นาย ก. ข.', position: 'หัวหน้าทีมทดสอบเจาะระบบ' },
    { name: 'น.ส. ค. ง.', position: 'ผู้เชี่ยวชาญด้านความมั่นคงปลอดภัย' },
    { name: 'นาย จ. ฉ.', position: 'นักวิเคราะห์ช่องโหว่' },
  ],
  execSummary:
    'การประเมินครั้งนี้ดำเนินการต่อระบบสารสนเทศภายในขององค์กรในช่วงเดือนพฤษภาคม พ.ศ. 2568 ' +
    'ทีมงานได้ทดสอบโดยใช้ทั้งวิธีการอัตโนมัติและการทดสอบเชิงลึกแบบ manual ' +
    'ครอบคลุมระบบเว็บแอปพลิเคชัน เซิร์ฟเวอร์ และอุปกรณ์เครือข่ายตามขอบเขตที่ได้รับอนุญาต\n\n' +
    'ผลการทดสอบพบช่องโหว่ระดับวิกฤตจำนวน 2 รายการ ระดับสูง 3 รายการ และระดับกลาง 4 รายการ ' +
    'ซึ่งทั้งหมดได้รับการวิเคราะห์อย่างละเอียดพร้อมข้อเสนอแนะเชิงปฏิบัติการในรายงานฉบับนี้',
  methodologyIntro:
    'รายงานฉบับนี้จัดทำขึ้นตามแนวทางการประเมินความมั่นคงปลอดภัยเชิงรุก โดยใช้กระบวนการทำงานแบบเป็นขั้นตอน ' +
    'ตั้งแต่การกำหนดขอบเขตและข้อตกลงในการทดสอบ การสำรวจและเก็บข้อมูล การระบุช่องโหว่ การยืนยันผล และการจัดทำ' +
    'ข้อเสนอแนะเพื่อการแก้ไขปรับปรุง ทั้งนี้ การดำเนินงานจะยึดตามขอบเขตที่ได้รับอนุญาตเท่านั้น และมุ่งลดผลกระทบ' +
    'ต่อระบบงานจริงให้น้อยที่สุด',
  objective:
    'การประเมินครั้งนี้มีวัตถุประสงค์เพื่อระบุความเสี่ยงและช่องโหว่ที่อาจถูกนำไปใช้โจมตีได้ รวมถึงประเมินผลกระทบต่อ' +
    'ความลับ (Confidentiality) ความถูกต้อง (Integrity) และความพร้อมใช้งาน (Availability) ของระบบที่อยู่ในขอบเขต ' +
    'และจัดทำข้อเสนอแนะเชิงปฏิบัติการเพื่อสนับสนุนการลดความเสี่ยงและการปรับปรุงมาตรการป้องกัน',
  findings: [
    {
      uid: 'f1',
      severity: 'Critical',
      title: 'Cisco IOS XE — Authentication Bypass (CVE-2023-20198)',
      cvss: '10.0',
      vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
      target: '10.0.10.5, 10.0.10.6',
      references: 'https://nvd.nist.gov/vuln/detail/CVE-2023-20198',
      overview:
        'พบช่องโหว่ความรุนแรงระดับวิกฤตบนอุปกรณ์ Cisco IOS XE ซึ่งเปิด Web UI ไว้สาธารณะ ทำให้ผู้โจมตีจากระยะไกล' +
        'สามารถสร้างบัญชีผู้ใช้ระดับ privilege 15 และเข้าควบคุมอุปกรณ์ได้ทันที',
      detail:
        'การทดสอบยืนยันว่าสามารถส่ง HTTP request ไปยัง endpoint /webui/logoutconfirm.html?logon_hash=1 ' +
        'และได้รับการตอบกลับโดยไม่ผ่านการตรวจสอบสิทธิ์ จากนั้นสร้างบัญชี admin ใหม่และล็อกอินเข้าผ่าน SSH ได้\n\n' +
        'ผลกระทบ: ผู้โจมตีสามารถเปลี่ยนการตั้งค่าเครือข่าย ดักจับการจราจร และเคลื่อนที่ไปยังระบบภายในอื่นได้',
      recommendations: [
        'อัปเดต Cisco IOS XE เป็นเวอร์ชันที่แก้ไขช่องโหว่ตามคำแนะนำของผู้ผลิตทันที',
        'ปิด Web UI ที่ไม่จำเป็น หรือจำกัดการเข้าถึงเฉพาะ management network',
        'ตรวจสอบ log หา indicators of compromise (IoC) ที่เกี่ยวข้องกับช่องโหว่ดังกล่าว',
      ],
      evidence: [],
    },
    {
      uid: 'f2',
      severity: 'Critical',
      title: 'SQL Injection ในระบบยืนยันตัวตน',
      cvss: '9.8',
      vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
      target: 'https://app.example.local/login',
      references: 'OWASP A03:2021 — Injection',
      overview:
        'พบช่องโหว่ SQL Injection ในแบบฟอร์มล็อกอิน ทำให้ข้ามการยืนยันตัวตนและเข้าถึงบัญชีผู้ดูแลระบบได้',
      detail:
        "ส่ง payload ' OR 1=1 -- ในฟิลด์ username สามารถเข้าระบบในฐานะผู้ใช้รายแรกของฐานข้อมูลได้ทันที",
      recommendations: [
        'ใช้ parameterized query หรือ ORM แทนการต่อสตริงโดยตรง',
        'ทำ input validation และจำกัด character set ที่อนุญาต',
        'เพิ่ม WAF rule ดักจับ SQLi pattern',
      ],
      evidence: [],
    },
    {
      uid: 'f3',
      severity: 'High',
      title: 'Outdated TLS Configuration (TLS 1.0/1.1 enabled)',
      cvss: '7.5',
      vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
      target: 'mail.example.local',
      references: 'NIST SP 800-52r2',
      overview:
        'เซิร์ฟเวอร์เปิดใช้งาน TLS 1.0 และ 1.1 ซึ่งมีช่องโหว่ทราบกันทั่วไป',
      detail: '',
      recommendations: [
        'ปิด TLS 1.0/1.1 และเปิดเฉพาะ TLS 1.2 ขึ้นไป',
        'เลือก cipher suite ที่รองรับ Perfect Forward Secrecy',
      ],
      evidence: [],
    },
    {
      uid: 'f4',
      severity: 'Medium',
      title: 'Missing HTTP Security Headers',
      cvss: '5.3',
      vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N',
      target: 'https://app.example.local/*',
      references: 'OWASP Secure Headers Project',
      overview:
        'เว็บไซต์ไม่ได้ตั้งค่า HTTP security headers ที่สำคัญ เช่น Content-Security-Policy, ' +
        'Strict-Transport-Security และ X-Frame-Options',
      detail: '',
      recommendations: [
        'เพิ่ม Content-Security-Policy ที่เข้มงวด',
        'เปิด HSTS พร้อม max-age อย่างน้อย 6 เดือน',
        'ตั้งค่า X-Frame-Options: DENY หรือใช้ frame-ancestors ใน CSP',
      ],
      evidence: [],
    },
    {
      uid: 'f5',
      severity: 'Low',
      title: 'Verbose Error Messages',
      cvss: '3.7',
      vector: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N',
      target: 'https://app.example.local',
      references: '',
      overview: 'ระบบแสดง stack trace เต็มในหน้า error',
      detail: '',
      recommendations: ['ปิดการแสดง stack trace ใน production'],
      evidence: [],
    },
    {
      uid: 'f6',
      severity: 'Info',
      title: 'Server Banner Disclosure',
      cvss: '0.0',
      vector: '',
      target: 'mail.example.local:25',
      references: '',
      overview: 'เซิร์ฟเวอร์แสดง banner ของซอฟต์แวร์และเวอร์ชันที่ใช้',
      detail: '',
      recommendations: ['ซ่อนข้อมูล banner ออกจากการตอบกลับ'],
      evidence: [],
    },
  ],
  disclaimer:
    'รายงานฉบับนี้จัดทำขึ้นเพื่อวัตถุประสงค์ในการประเมินความมั่นคงปลอดภัยตามขอบเขต ระยะเวลา และเงื่อนไขที่ได้รับ' +
    'อนุญาตจากผู้เข้ารับการตรวจเท่านั้น ผลการทดสอบเป็นข้อมูล ณ ช่วงเวลาที่ดำเนินการทดสอบ และอาจเปลี่ยนแปลงได้' +
    'ตามการปรับปรุงระบบ การตั้งค่า สภาพแวดล้อม เครือข่าย และปัจจัยอื่น ๆ ภายหลัง\n\n' +
    'การนำผลการทดสอบ แนวทางการโจมตี หรือรายละเอียดเชิงเทคนิคในรายงานไปใช้นอกเหนือจากวัตถุประสงค์และ' +
    'ขอบเขตที่ได้รับอนุญาต อาจก่อให้เกิดผลกระทบต่อระบบหรือเครือข่ายการใช้งานที่ไม่เหมาะสม ผู้จัดทำรายงานไม่รับผิดชอบ' +
    'ต่อความเสียหายใด ๆ ที่เกิดจากการนำรายงานไปใช้งานผิดวัตถุประสงค์',
  appendix: [
    {
      uid: 'r1',
      title: 'OWASP Top 10 (2021)',
      url: 'https://owasp.org/Top10/',
      description: 'รายการช่องโหว่เว็บแอปพลิเคชันที่พบบ่อยที่สุด 10 อันดับ',
    },
    {
      uid: 'r2',
      title: 'NIST SP 800-115',
      url: 'https://csrc.nist.gov/publications/detail/sp/800-115/final',
      description: 'แนวทางการทดสอบความมั่นคงปลอดภัยของระบบสารสนเทศ',
    },
  ],
};

const out = path.join(os.tmpdir(), 'pentest-report-new.pdf');
const buf = await pdf(React.createElement(PentestReportPdf, { report: sample })).toBuffer();
const chunks = [];
for await (const chunk of buf) chunks.push(chunk);
await writeFile(out, Buffer.concat(chunks));
console.log(`Wrote ${out}`);
