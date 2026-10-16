export type CurationStatus = 'terverifikasi' | 'menunggu' | 'tinjauan';

export interface KurasiStatusItem {
  id: string;
  kodeArsip: string;
  judulNaskah: string;
  aksaraId: 'lontara' | 'sunda' | 'bali';
  pengusulNama: string;
  submittedAt: string;
  proposedTranscription: string;
  status: CurationStatus;
  catatanFilolog?: string | null;
  reviewerNama?: string | null;
  reviewedAt?: string | null;
  canReview?: boolean;
}

export type TransliterationSubmissionResult =
  | { success: true; submissionId: string }
  | { success: false; error: string };

export type TransliterationReviewResult =
  | { success: true; submissionId: string }
  | { success: false; error: string };
