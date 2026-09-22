export type PatientDocumentKind = 'pdf' | 'image';

export type PatientDocumentStatus = 'uploading' | 'ready';

export type PatientDocument = {
  id: string;
  name: string;
  sizeLabel: string;
  kind: PatientDocumentKind;
  status: PatientDocumentStatus;
  progress?: number;
};

/** Demo library used when the patient already has documents on file. */
export const SEEDED_PATIENT_DOCUMENTS: PatientDocument[] = [
  {
    id: 'doc-blood',
    name: 'blood_report_aug.pdf',
    sizeLabel: '1.1 MB',
    kind: 'pdf',
    status: 'ready',
  },
  {
    id: 'doc-rash',
    name: 'rash_arm.jpg',
    sizeLabel: '820 KB',
    kind: 'image',
    status: 'ready',
  },
];
