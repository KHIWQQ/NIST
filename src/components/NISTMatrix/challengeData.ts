// ── Security Tool/Module definitions grouped by category ────

export interface ToolEntry {
  id: string;       // abbreviation e.g. "CSAM"
  fullName: string;  // full name for tooltip
}

export interface ToolGroup {
  group: string;     // e.g. "Asset Management"
  color: string;     // group header color
  tools: ToolEntry[];
}

export const TOOL_GROUPS: ToolGroup[] = [
  {
    group: 'Asset Management',
    color: '#f59e0b',
    tools: [
      { id: 'CSAM', fullName: 'Cyber Security Asset Management' },
      { id: 'GAV', fullName: 'Global Asset View' },
      { id: 'CRI', fullName: 'Cyber Risk Intelligence' },
    ],
  },
  {
    group: 'IT Security',
    color: '#38bdf8',
    tools: [
      { id: 'VMDR', fullName: 'Vulnerability Management Detection & Response' },
      { id: 'TP', fullName: 'Threat Protection' },
      { id: 'CM', fullName: 'Continuous Monitoring' },
      { id: 'PM', fullName: 'Patch Management' },
      { id: 'EDR', fullName: 'Endpoint Detection & Response' },
      { id: 'CAR', fullName: 'Cyber Asset Reduction' },
      { id: 'CRA', fullName: 'Cyber Risk Assessment' },
      { id: 'SDR', fullName: 'Security Detection & Response' },
      { id: 'XDR', fullName: 'Extended Detection & Response' },
    ],
  },
  {
    group: 'Cloud Container',
    color: '#34d399',
    tools: [
      { id: 'TC', fullName: 'TotalCloud' },
      { id: 'CI', fullName: 'Container Inspection' },
      { id: 'CSA', fullName: 'Cloud Security Assessment' },
      { id: 'PC', fullName: 'Policy Compliance' },
    ],
  },
  {
    group: 'Compliance',
    color: '#a78bfa',
    tools: [
      { id: 'SCA', fullName: 'Security Configuration Assessment' },
      { id: 'PCI', fullName: 'PCI DSS Compliance' },
      { id: 'FIM', fullName: 'File Integrity Monitoring' },
      { id: 'SAQ', fullName: 'Self-Assessment Questionnaire' },
      { id: 'OC', fullName: 'Out-of-Compliance' },
    ],
  },
];

// Flat list of all tool IDs for convenience
export const ALL_TOOLS = TOOL_GROUPS.flatMap((g) => g.tools);

// ── NIST ↔ Tool Mappings ────────────────────────────────────
// key = NIST subcategory ID, value = array of tool IDs that cover it

export const NIST_TOOL_MAPPINGS: Record<string, string[]> = {
  // ── GOVERN ──
  'GV.OC-01': ['CSAM', 'CRI'],
  'GV.OC-02': ['CRI'],
  'GV.OC-03': ['SCA', 'PCI', 'OC'],
  'GV.OC-04': ['CRI', 'CSAM'],
  'GV.OC-05': ['CSAM', 'GAV'],
  'GV.RM-01': ['CRI', 'CRA'],
  'GV.RM-02': ['CRI', 'CRA'],
  'GV.RM-03': ['CRI', 'CRA'],
  'GV.RM-04': ['CRI'],
  'GV.RM-05': ['SDR', 'XDR'],
  'GV.RM-06': ['CRI', 'CRA'],
  'GV.RM-07': ['CRI'],
  'GV.RR-01': ['SCA', 'OC'],
  'GV.RR-02': ['SCA', 'OC'],
  'GV.RR-03': ['CSAM', 'GAV'],
  'GV.RR-04': ['SAQ'],
  'GV.PO-01': ['SCA', 'PC', 'OC'],
  'GV.PO-02': ['SCA', 'PC', 'FIM', 'OC'],
  'GV.OV-01': ['CRI', 'SCA'],
  'GV.OV-02': ['CRI', 'CRA'],
  'GV.OV-03': ['SCA', 'OC'],
  'GV.SC-01': ['CRI', 'SCA'],
  'GV.SC-02': ['SCA'],
  'GV.SC-03': ['CRI'],
  'GV.SC-04': ['CRI', 'CSAM'],
  'GV.SC-05': ['SCA', 'PC'],
  'GV.SC-06': ['CRI', 'SCA'],
  'GV.SC-07': ['CRI', 'VMDR'],
  'GV.SC-08': ['SDR', 'XDR'],
  'GV.SC-09': ['SCA', 'OC'],
  'GV.SC-10': ['CSAM', 'GAV'],

  // ── IDENTIFY ──
  'ID.AM-01': ['CSAM', 'GAV', 'EDR'],
  'ID.AM-02': ['CSAM', 'GAV', 'VMDR'],
  'ID.AM-03': ['GAV', 'CM', 'TC'],
  'ID.AM-04': ['CSAM', 'GAV', 'CSA'],
  'ID.AM-05': ['CSAM', 'CRI', 'GAV'],
  'ID.AM-07': ['CSAM', 'GAV', 'FIM'],
  'ID.AM-08': ['CSAM', 'GAV', 'PM'],
  'ID.RA-01': ['VMDR', 'CRI', 'CRA'],
  'ID.RA-02': ['TP', 'CRI', 'XDR'],
  'ID.RA-03': ['TP', 'CRI', 'VMDR'],
  'ID.RA-04': ['CRI', 'CRA'],
  'ID.RA-05': ['CRI', 'VMDR', 'CRA'],
  'ID.RA-06': ['CRI', 'PM'],
  'ID.RA-07': ['CRI', 'CM'],
  'ID.RA-08': ['VMDR'],
  'ID.RA-09': ['CSAM', 'FIM'],
  'ID.RA-10': ['CRI', 'VMDR'],
  'ID.IM-01': ['SCA', 'OC'],
  'ID.IM-02': ['VMDR', 'CRA'],
  'ID.IM-03': ['CM', 'SDR'],
  'ID.IM-04': ['CRI'],

  // ── PROTECT ──
  'PR.AA-01': ['CSAM', 'SCA'],
  'PR.AA-02': ['SCA'],
  'PR.AA-03': ['SCA', 'PC'],
  'PR.AA-04': ['SCA'],
  'PR.AA-05': ['SCA', 'PC', 'CM'],
  'PR.AA-06': ['SCA'],
  'PR.AT-01': ['SAQ'],
  'PR.AT-02': ['SAQ'],
  'PR.DS-01': ['SCA', 'FIM', 'CSA'],
  'PR.DS-02': ['SCA', 'CM'],
  'PR.DS-10': ['EDR', 'XDR'],
  'PR.DS-11': ['SCA', 'FIM'],
  'PR.PS-01': ['CM', 'SCA', 'PC'],
  'PR.PS-02': ['PM', 'VMDR'],
  'PR.PS-03': ['CSAM', 'PM'],
  'PR.PS-04': ['CM', 'FIM', 'SDR'],
  'PR.PS-05': ['EDR', 'SCA', 'CAR'],
  'PR.PS-06': ['SCA', 'CI', 'CSA'],
  'PR.IR-01': ['CM', 'EDR', 'XDR'],
  'PR.IR-02': ['SCA'],
  'PR.IR-03': ['EDR', 'XDR', 'SDR'],
  'PR.IR-04': ['CSAM', 'TC', 'CSA'],

  // ── DETECT ──
  'DE.CM-01': ['CM', 'EDR', 'XDR', 'SDR'],
  'DE.CM-02': ['CM'],
  'DE.CM-03': ['EDR', 'XDR', 'SDR'],
  'DE.CM-06': ['CM', 'CSA', 'TC'],
  'DE.CM-09': ['EDR', 'VMDR', 'CAR'],
  'DE.AE-02': ['SDR', 'XDR', 'EDR'],
  'DE.AE-03': ['SDR', 'XDR', 'CRI'],
  'DE.AE-04': ['CRI', 'XDR', 'SDR'],
  'DE.AE-06': ['SDR', 'XDR'],
  'DE.AE-07': ['TP', 'CRI', 'XDR'],
  'DE.AE-08': ['SDR', 'XDR', 'EDR'],

  // ── RESPOND ──
  'RS.MA-01': ['SDR', 'XDR', 'EDR'],
  'RS.MA-02': ['SDR', 'XDR'],
  'RS.MA-03': ['SDR', 'XDR', 'CRI'],
  'RS.MA-04': ['SDR', 'XDR'],
  'RS.MA-05': ['SDR', 'XDR'],
  'RS.AN-03': ['SDR', 'XDR', 'EDR'],
  'RS.AN-06': ['FIM', 'SDR'],
  'RS.AN-07': ['SDR', 'XDR', 'CRI'],
  'RS.AN-08': ['CRI', 'XDR'],
  'RS.CO-02': ['SDR', 'XDR'],
  'RS.CO-03': ['SDR', 'XDR'],
  'RS.MI-01': ['EDR', 'XDR', 'SDR'],
  'RS.MI-02': ['EDR', 'XDR', 'PM'],

  // ── RECOVER ──
  'RC.RP-01': ['PM', 'CM'],
  'RC.RP-02': ['PM', 'SCA'],
  'RC.RP-03': ['FIM', 'SCA'],
  'RC.RP-04': ['SCA', 'OC'],
  'RC.RP-05': ['CSAM', 'FIM', 'VMDR'],
  'RC.RP-06': ['SDR', 'XDR'],
  'RC.CO-03': ['SDR', 'XDR'],
  'RC.CO-04': ['SDR'],
};
