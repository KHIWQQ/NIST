import type { NistFunction } from './types';

export const NIST_FUNCTIONS: NistFunction[] = [
  {
    id: 'GV', name: 'GOVERN', color: '#f59e0b', dim: '#f59e0b22',
    cats: [
      { id: 'GV.OC', name: 'Org Context', subs: [
        { id: 'GV.OC-01', name: 'Mission & Stakeholders' },
        { id: 'GV.OC-02', name: 'Stakeholder Needs' },
        { id: 'GV.OC-03', name: 'Legal Obligations' },
        { id: 'GV.OC-04', name: 'Critical Objectives' },
        { id: 'GV.OC-05', name: 'Tech Dependency' },
      ]},
      { id: 'GV.RM', name: 'Risk Mgmt', subs: [
        { id: 'GV.RM-01', name: 'Risk Objectives' },
        { id: 'GV.RM-02', name: 'Risk Appetite' },
        { id: 'GV.RM-03', name: 'Cyber Risk in ERM' },
        { id: 'GV.RM-04', name: 'Strategic Direction' },
        { id: 'GV.RM-05', name: 'Communication Lines' },
        { id: 'GV.RM-06', name: 'Risk Calculation' },
        { id: 'GV.RM-07', name: 'Strategic Opportunities' },
      ]},
      { id: 'GV.RR', name: 'Roles', subs: [
        { id: 'GV.RR-01', name: 'Leadership Accountability' },
        { id: 'GV.RR-02', name: 'Roles Established' },
        { id: 'GV.RR-03', name: 'Resources Allocated' },
        { id: 'GV.RR-04', name: 'Cyber in HR' },
      ]},
      { id: 'GV.PO', name: 'Policy', subs: [
        { id: 'GV.PO-01', name: 'Policy Established' },
        { id: 'GV.PO-02', name: 'Policy Enforced' },
      ]},
      { id: 'GV.OV', name: 'Oversight', subs: [
        { id: 'GV.OV-01', name: 'Strategy Monitored' },
        { id: 'GV.OV-02', name: 'Strategy Adjusted' },
        { id: 'GV.OV-03', name: 'Performance Evaluated' },
      ]},
      { id: 'GV.SC', name: 'Supply Chain', subs: [
        { id: 'GV.SC-01', name: 'SC Program' },
        { id: 'GV.SC-02', name: 'SC Roles' },
        { id: 'GV.SC-03', name: 'SC Integrated' },
        { id: 'GV.SC-04', name: 'Suppliers Prioritized' },
        { id: 'GV.SC-05', name: 'SC Requirements' },
        { id: 'GV.SC-06', name: 'Due Diligence' },
        { id: 'GV.SC-07', name: 'Supplier Risks' },
        { id: 'GV.SC-08', name: 'Suppliers in IR' },
        { id: 'GV.SC-09', name: 'SC Practices' },
        { id: 'GV.SC-10', name: 'Post-Partnership' },
      ]},
    ],
  },
  {
    id: 'ID', name: 'IDENTIFY', color: '#38bdf8', dim: '#38bdf822',
    cats: [
      { id: 'ID.AM', name: 'Asset Mgmt', subs: [
        { id: 'ID.AM-01', name: 'Hardware Inventory' },
        { id: 'ID.AM-02', name: 'Software Inventory' },
        { id: 'ID.AM-03', name: 'Network Data Flows' },
        { id: 'ID.AM-04', name: 'Supplier Services' },
        { id: 'ID.AM-05', name: 'Assets Prioritized' },
        { id: 'ID.AM-07', name: 'Data Inventory' },
        { id: 'ID.AM-08', name: 'Asset Lifecycle' },
      ]},
      { id: 'ID.RA', name: 'Risk Assessment', subs: [
        { id: 'ID.RA-01', name: 'Vulnerabilities Identified' },
        { id: 'ID.RA-02', name: 'Threat Intel Received' },
        { id: 'ID.RA-03', name: 'Threats Identified' },
        { id: 'ID.RA-04', name: 'Impact & Likelihood' },
        { id: 'ID.RA-05', name: 'Risk Response Prioritized' },
        { id: 'ID.RA-06', name: 'Risk Responses Tracked' },
        { id: 'ID.RA-07', name: 'Changes Assessed' },
        { id: 'ID.RA-08', name: 'Vuln Disclosure Process' },
        { id: 'ID.RA-09', name: 'HW/SW Authenticity' },
        { id: 'ID.RA-10', name: 'Suppliers Assessed' },
      ]},
      { id: 'ID.IM', name: 'Improvement', subs: [
        { id: 'ID.IM-01', name: 'Improvements from Eval' },
        { id: 'ID.IM-02', name: 'Improvements from Tests' },
        { id: 'ID.IM-03', name: 'Improvements from Ops' },
        { id: 'ID.IM-04', name: 'Lessons Learned' },
      ]},
    ],
  },
  {
    id: 'PR', name: 'PROTECT', color: '#34d399', dim: '#34d39922',
    cats: [
      { id: 'PR.AA', name: 'Identity & Access', subs: [
        { id: 'PR.AA-01', name: 'Identities Managed' },
        { id: 'PR.AA-02', name: 'Identities Proofed' },
        { id: 'PR.AA-03', name: 'Authentication' },
        { id: 'PR.AA-04', name: 'Identity Assertions' },
        { id: 'PR.AA-05', name: 'Access Permissions' },
        { id: 'PR.AA-06', name: 'Physical Access' },
      ]},
      { id: 'PR.AT', name: 'Training', subs: [
        { id: 'PR.AT-01', name: 'Personnel Training' },
        { id: 'PR.AT-02', name: 'Specialized Roles' },
      ]},
      { id: 'PR.DS', name: 'Data Security', subs: [
        { id: 'PR.DS-01', name: 'Data-at-Rest' },
        { id: 'PR.DS-02', name: 'Data-in-Transit' },
        { id: 'PR.DS-10', name: 'Data-in-Use' },
        { id: 'PR.DS-11', name: 'Backups' },
      ]},
      { id: 'PR.PS', name: 'Platform Security', subs: [
        { id: 'PR.PS-01', name: 'Config Management' },
        { id: 'PR.PS-02', name: 'Software Maintained' },
        { id: 'PR.PS-03', name: 'Hardware Maintained' },
        { id: 'PR.PS-04', name: 'Log Records' },
        { id: 'PR.PS-05', name: 'Unauthorized SW Prevented' },
        { id: 'PR.PS-06', name: 'Secure Development' },
      ]},
      { id: 'PR.IR', name: 'Resilience', subs: [
        { id: 'PR.IR-01', name: 'Networks Protected' },
        { id: 'PR.IR-02', name: 'Environmental Threats' },
        { id: 'PR.IR-03', name: 'Resilience Mechanisms' },
        { id: 'PR.IR-04', name: 'Resource Capacity' },
      ]},
    ],
  },
  {
    id: 'DE', name: 'DETECT', color: '#a78bfa', dim: '#a78bfa22',
    cats: [
      { id: 'DE.CM', name: 'Monitoring', subs: [
        { id: 'DE.CM-01', name: 'Networks Monitored' },
        { id: 'DE.CM-02', name: 'Physical Environment' },
        { id: 'DE.CM-03', name: 'Personnel Activity' },
        { id: 'DE.CM-06', name: 'External Providers' },
        { id: 'DE.CM-09', name: 'Computing HW/SW' },
      ]},
      { id: 'DE.AE', name: 'Event Analysis', subs: [
        { id: 'DE.AE-02', name: 'Events Analyzed' },
        { id: 'DE.AE-03', name: 'Info Correlated' },
        { id: 'DE.AE-04', name: 'Impact Understood' },
        { id: 'DE.AE-06', name: 'Info to Staff' },
        { id: 'DE.AE-07', name: 'Threat Intel Integrated' },
        { id: 'DE.AE-08', name: 'Incidents Declared' },
      ]},
    ],
  },
  {
    id: 'RS', name: 'RESPOND', color: '#f87171', dim: '#f8717122',
    cats: [
      { id: 'RS.MA', name: 'Incident Mgmt', subs: [
        { id: 'RS.MA-01', name: 'IR Plan Executed' },
        { id: 'RS.MA-02', name: 'Reports Triaged' },
        { id: 'RS.MA-03', name: 'Incidents Categorized' },
        { id: 'RS.MA-04', name: 'Incidents Escalated' },
        { id: 'RS.MA-05', name: 'Recovery Criteria' },
      ]},
      { id: 'RS.AN', name: 'Analysis', subs: [
        { id: 'RS.AN-03', name: 'Root Cause Analysis' },
        { id: 'RS.AN-06', name: 'Records Preserved' },
        { id: 'RS.AN-07', name: 'Cause Analysis' },
        { id: 'RS.AN-08', name: 'Magnitude Estimated' },
      ]},
      { id: 'RS.CO', name: 'Communication', subs: [
        { id: 'RS.CO-02', name: 'Stakeholders Notified' },
        { id: 'RS.CO-03', name: 'Info Shared' },
      ]},
      { id: 'RS.MI', name: 'Mitigation', subs: [
        { id: 'RS.MI-01', name: 'Incidents Contained' },
        { id: 'RS.MI-02', name: 'Incidents Eradicated' },
      ]},
    ],
  },
  {
    id: 'RC', name: 'RECOVER', color: '#22d3ee', dim: '#22d3ee22',
    cats: [
      { id: 'RC.RP', name: 'Recovery Plan', subs: [
        { id: 'RC.RP-01', name: 'Plan Executed' },
        { id: 'RC.RP-02', name: 'Actions Performed' },
        { id: 'RC.RP-03', name: 'Backup Integrity' },
        { id: 'RC.RP-04', name: 'Post-Incident Norms' },
        { id: 'RC.RP-05', name: 'Assets Verified' },
        { id: 'RC.RP-06', name: 'Recovery Declared' },
      ]},
      { id: 'RC.CO', name: 'Communication', subs: [
        { id: 'RC.CO-03', name: 'Progress Communicated' },
        { id: 'RC.CO-04', name: 'Public Updates' },
      ]},
    ],
  },
];

export const TOTAL_SUBCATEGORIES = NIST_FUNCTIONS.reduce(
  (acc, fn) => acc + fn.cats.reduce((a, c) => a + c.subs.length, 0),
  0
);

export const CHALLENGE_TYPES = [
  'Log Analysis',
  'Forensics',
  'Config Review',
  'PCAP Analysis',
  'Threat Hunting',
  'Incident Response',
  'Hardening',
] as const;

export const getFunctionBySubId = (subId: string): NistFunction | undefined =>
  NIST_FUNCTIONS.find((fn) => fn.cats.some((cat) => cat.subs.some((s) => s.id === subId)));

export const getSubcategoryName = (subId: string): string => {
  for (const fn of NIST_FUNCTIONS)
    for (const cat of fn.cats)
      for (const sub of cat.subs)
        if (sub.id === subId) return sub.name;
  return subId;
};
