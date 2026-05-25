import type { Challenge } from './types';

export const CHALLENGE_BANK: (Challenge & { type?: string; difficulty?: string; flag?: string })[] = [
  // ── Log Analysis ──────────────────────────────────────────────
  {
    id: 101, name: 'SSH Brute Force Detection',
    description: 'Analyze auth.log to identify brute-force patterns, attacker IP, and time window.',
    type: 'Log Analysis', difficulty: 'easy', score: 100, flag: '',
    nistTags: ['DE.CM-01', 'DE.AE-02', 'DE.AE-03'],
  },
  {
    id: 102, name: 'Windows Event 4624/4625 Hunt',
    description: 'Parse Windows Security logs to detect lateral movement via failed/successful logons.',
    type: 'Log Analysis', difficulty: 'medium', score: 200, flag: '',
    nistTags: ['DE.CM-03', 'DE.AE-02', 'PR.AA-03'],
  },
  {
    id: 103, name: 'Web Access Log Anomaly',
    description: 'Detect directory traversal and SQLi attempts hidden in Apache access logs.',
    type: 'Log Analysis', difficulty: 'medium', score: 200, flag: '',
    nistTags: ['DE.CM-01', 'ID.RA-03', 'DE.AE-08'],
  },
  {
    id: 104, name: 'Syslog Correlation Challenge',
    description: 'Correlate multi-source syslogs to reconstruct an attack timeline and assess impact.',
    type: 'Log Analysis', difficulty: 'hard', score: 400, flag: '',
    nistTags: ['DE.AE-03', 'DE.AE-04', 'RS.AN-07'],
  },
  {
    id: 105, name: 'PowerShell Execution Logs',
    description: 'Extract encoded PowerShell commands from event logs and decode attacker\'s payload.',
    type: 'Log Analysis', difficulty: 'medium', score: 300, flag: '',
    nistTags: ['DE.CM-09', 'DE.AE-02', 'DE.AE-07'],
  },
  {
    id: 106, name: 'Authentication Storm Triage',
    description: 'Identify the compromised account amidst thousands of concurrent login failures.',
    type: 'Log Analysis', difficulty: 'hard', score: 400, flag: '',
    nistTags: ['DE.CM-03', 'DE.AE-08', 'RS.MA-02'],
  },

  // ── Forensics ─────────────────────────────────────────────────
  {
    id: 201, name: 'Memory Forensics: Process Injection',
    description: 'Analyze a memory dump to identify a hollowed process and extract injected shellcode.',
    type: 'Forensics', difficulty: 'hard', score: 500, flag: '',
    nistTags: ['RS.AN-03', 'RS.AN-07', 'DE.AE-04'],
  },
  {
    id: 202, name: 'Disk Image: Hidden Persistence',
    description: 'Mount a forensic image and locate registry-based persistence mechanisms left by an attacker.',
    type: 'Forensics', difficulty: 'medium', score: 300, flag: '',
    nistTags: ['RS.AN-06', 'RS.AN-07', 'DE.CM-09'],
  },
  {
    id: 203, name: 'Timeline Analysis: Breach Reconstruction',
    description: 'Use filesystem timestamps and MFT records to reconstruct the exact sequence of a breach.',
    type: 'Forensics', difficulty: 'hard', score: 500, flag: '',
    nistTags: ['RS.AN-03', 'RS.AN-08', 'RS.MA-03'],
  },
  {
    id: 204, name: 'Malware Artifact Recovery',
    description: 'Extract and analyze dropped artifacts from a live-response package to identify malware family.',
    type: 'Forensics', difficulty: 'hard', score: 400, flag: '',
    nistTags: ['RS.MI-02', 'RS.AN-03', 'DE.AE-02'],
  },
  {
    id: 205, name: 'Deleted File Recovery',
    description: 'Recover deleted evidence files from an NTFS volume to support an ongoing investigation.',
    type: 'Forensics', difficulty: 'medium', score: 300, flag: '',
    nistTags: ['RS.AN-06', 'RC.RP-03', 'RS.AN-07'],
  },

  // ── PCAP Analysis ─────────────────────────────────────────────
  {
    id: 301, name: 'C2 Beacon Detection',
    description: 'Identify periodic C2 beaconing traffic hidden inside seemingly normal HTTPS connections.',
    type: 'PCAP Analysis', difficulty: 'medium', score: 300, flag: '',
    nistTags: ['DE.CM-01', 'DE.AE-03', 'DE.AE-07'],
  },
  {
    id: 302, name: 'Data Exfiltration via DNS',
    description: 'Detect data exfiltration encoded in DNS TXT record queries inside a packet capture.',
    type: 'PCAP Analysis', difficulty: 'hard', score: 400, flag: '',
    nistTags: ['DE.CM-01', 'RS.AN-08', 'RS.MI-01'],
  },
  {
    id: 303, name: 'Lateral Movement PCAP',
    description: 'Trace SMB/WMI lateral movement between internal hosts across a multi-segment capture.',
    type: 'PCAP Analysis', difficulty: 'hard', score: 400, flag: '',
    nistTags: ['DE.CM-01', 'DE.AE-03', 'RS.MA-03'],
  },
  {
    id: 304, name: 'Malicious TLS Certificate',
    description: 'Identify a rogue certificate used for man-in-the-middle attacks within network traffic.',
    type: 'PCAP Analysis', difficulty: 'medium', score: 200, flag: '',
    nistTags: ['DE.CM-01', 'ID.RA-03', 'DE.AE-07'],
  },
  {
    id: 305, name: 'RDP Brute Force Traffic',
    description: 'Analyze RDP traffic patterns to identify brute-force and successful compromise attempts.',
    type: 'PCAP Analysis', difficulty: 'easy', score: 100, flag: '',
    nistTags: ['DE.CM-01', 'DE.AE-02', 'PR.AA-03'],
  },

  // ── Threat Hunting ────────────────────────────────────────────
  {
    id: 401, name: 'LOLBins Abuse Hunting',
    description: 'Hunt for misuse of built-in Windows binaries (certutil, regsvr32, mshta) in EDR telemetry.',
    type: 'Threat Hunting', difficulty: 'medium', score: 300, flag: '',
    nistTags: ['DE.CM-09', 'DE.AE-07', 'ID.RA-03'],
  },
  {
    id: 402, name: 'Scheduled Task Persistence',
    description: 'Identify malicious scheduled tasks created for persistence using Sysmon event logs.',
    type: 'Threat Hunting', difficulty: 'easy', score: 200, flag: '',
    nistTags: ['DE.CM-09', 'DE.AE-02', 'PR.PS-04'],
  },
  {
    id: 403, name: 'Pass-the-Hash Detection',
    description: 'Hunt for pass-the-hash indicators within Windows authentication logs and network traces.',
    type: 'Threat Hunting', difficulty: 'hard', score: 400, flag: '',
    nistTags: ['DE.CM-03', 'PR.AA-03', 'DE.AE-08'],
  },
  {
    id: 404, name: 'WMI Lateral Movement Hunt',
    description: 'Detect WMI-based lateral movement by correlating process creation and network events.',
    type: 'Threat Hunting', difficulty: 'hard', score: 500, flag: '',
    nistTags: ['DE.AE-03', 'DE.CM-09', 'RS.MA-03'],
  },

  // ── Config Review ─────────────────────────────────────────────
  {
    id: 501, name: 'Firewall Policy Audit',
    description: 'Review a set of firewall rules and identify over-permissive rules violating least-privilege.',
    type: 'Config Review', difficulty: 'easy', score: 100, flag: '',
    nistTags: ['PR.PS-01', 'PR.IR-01', 'GV.PO-02'],
  },
  {
    id: 502, name: 'Active Directory Privilege Audit',
    description: 'Identify over-privileged accounts and excessive ACLs in an AD export.',
    type: 'Config Review', difficulty: 'medium', score: 300, flag: '',
    nistTags: ['PR.AA-05', 'PR.AA-01', 'GV.RR-02'],
  },
  {
    id: 503, name: 'Cloud Storage Misconfiguration',
    description: 'Identify publicly accessible S3 buckets and excessive IAM permissions in a cloud config.',
    type: 'Config Review', difficulty: 'medium', score: 200, flag: '',
    nistTags: ['PR.DS-01', 'ID.AM-04', 'GV.SC-05'],
  },
  {
    id: 504, name: 'Network Segmentation Gap Analysis',
    description: 'Review network topology and VLAN configs to identify missing segmentation controls.',
    type: 'Config Review', difficulty: 'hard', score: 400, flag: '',
    nistTags: ['PR.IR-01', 'PR.AA-05', 'ID.AM-03'],
  },

  // ── Incident Response ─────────────────────────────────────────
  {
    id: 601, name: 'Ransomware Initial Response',
    description: 'Execute the first 4 phases of IR against a simulated ransomware incident using provided evidence.',
    type: 'Incident Response', difficulty: 'hard', score: 500, flag: '',
    nistTags: ['RS.MA-01', 'RS.MI-01', 'RS.MA-03', 'RC.RP-01'],
  },
  {
    id: 602, name: 'Phishing Triage Simulation',
    description: 'Triage a wave of reported phishing emails, classify severity, and identify compromised accounts.',
    type: 'Incident Response', difficulty: 'medium', score: 200, flag: '',
    nistTags: ['RS.MA-02', 'RS.MA-03', 'RS.AN-03'],
  },
  {
    id: 603, name: 'Insider Threat Investigation',
    description: 'Investigate a suspected data theft case using DLP alerts, badge logs, and endpoint telemetry.',
    type: 'Incident Response', difficulty: 'hard', score: 400, flag: '',
    nistTags: ['RS.AN-07', 'RS.CO-02', 'RS.MA-04'],
  },
  {
    id: 604, name: 'Supply Chain Compromise IR',
    description: 'Respond to a compromised third-party software update affecting multiple internal systems.',
    type: 'Incident Response', difficulty: 'hard', score: 500, flag: '',
    nistTags: ['RS.MA-04', 'RS.AN-07', 'GV.SC-08'],
  },

  // ── Hardening ─────────────────────────────────────────────────
  {
    id: 701, name: 'Linux Server Hardening',
    description: 'Apply CIS Benchmark Level 1 controls to a provided Ubuntu server configuration.',
    type: 'Hardening', difficulty: 'easy', score: 100, flag: '',
    nistTags: ['PR.PS-01', 'PR.PS-02', 'PR.AA-05'],
  },
  {
    id: 702, name: 'Windows Endpoint Hardening',
    description: 'Harden a Windows 11 workstation using STIG guidelines and validate with a compliance check.',
    type: 'Hardening', difficulty: 'medium', score: 200, flag: '',
    nistTags: ['PR.PS-01', 'PR.PS-05', 'PR.DS-01'],
  },
  {
    id: 703, name: 'SSH Configuration Hardening',
    description: 'Identify and remediate insecure SSH daemon settings including weak ciphers and root login.',
    type: 'Hardening', difficulty: 'easy', score: 100, flag: '',
    nistTags: ['PR.AA-03', 'PR.PS-01', 'PR.AA-05'],
  },
  {
    id: 704, name: 'Log Collection Configuration',
    description: 'Configure Syslog-NG and Windows Event Forwarding to ensure comprehensive coverage.',
    type: 'Hardening', difficulty: 'medium', score: 200, flag: '',
    nistTags: ['PR.PS-04', 'DE.CM-01', 'DE.CM-09'],
  },
  {
    id: 705, name: 'Container Security Hardening',
    description: 'Review a Dockerfile and Kubernetes manifests for misconfigurations and privilege escalation risks.',
    type: 'Hardening', difficulty: 'medium', score: 300, flag: '',
    nistTags: ['PR.PS-06', 'PR.DS-01', 'ID.AM-02'],
  },
  {
    id: 706, name: 'Patch Gap Assessment',
    description: 'Identify unpatched CVEs from a vulnerability scan report and prioritize remediation order.',
    type: 'Hardening', difficulty: 'easy', score: 200, flag: '',
    nistTags: ['PR.PS-02', 'PR.PS-03', 'ID.RA-05'],
  },
];
