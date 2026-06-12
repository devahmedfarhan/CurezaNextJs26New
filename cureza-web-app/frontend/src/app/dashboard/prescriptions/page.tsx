'use client';

import { useState, useEffect } from 'react';
import { FileText, Eye, Download, Calendar, Star, MessageSquare, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PrescriptionItem {
    type: 'digital' | 'order';
    id: number;
    prescription_number: string;
    doctor: {
        id: number;
        name: string;
    } | null;
    date: string;
    diagnosis: string;
    patient_name: string;
    download_url: string | null;
    view_url: string | null;
}

export default function PrescriptionsPage() {
    const { showToast } = useToast();
    const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Review Modal States
    const [selectedDoctor, setSelectedDoctor] = useState<{ id: number; name: string } | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const fetchPrescriptions = () => {
        setLoading(true);
        api.get('/user/prescriptions')
            .then((res) => {
                setPrescriptions(res.data);
            })
            .catch((err) => {
                console.error('Error fetching prescriptions:', err);
                showToast('Failed to load prescriptions', 'error');
            })
            .finally(() => setLoading(false));
    };

    const handleOpenReview = async (doctor: { id: number; name: string }) => {
        try {
            // Check eligibility first
            const res = await api.get(`/customer/doctors/${doctor.id}/eligibility`);
            const eligibility = res.data.data;

            if (!eligibility.can_review) {
                showToast(eligibility.message, 'warning');
                return;
            }

            setSelectedDoctor(doctor);
            setRating(5);
            setReviewText('');
            setIsReviewOpen(true);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to check eligibility';
            showToast(msg, 'error');
        }
    };

    const handleSubmitReview = async () => {
        if (!selectedDoctor) return;

        setSubmittingReview(true);
        try {
            await api.post('/customer/reviews/doctor', {
                doctor_id: selectedDoctor.id,
                rating: rating,
                review_text: reviewText,
            });

            showToast('Thank you! Your feedback has been submitted for admin approval.', 'success');
            setIsReviewOpen(false);
            setSelectedDoctor(null);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to submit review';
            showToast(msg, 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground gap-3">
                <RefreshCw className="h-7 w-7 animate-spin text-cureza-green" />
                <p className="text-sm">Loading prescriptions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">My Prescriptions</h1>
            </div>

            {/* Prescription List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prescriptions.length === 0 ? (
                    <p className="text-gray-500">No prescriptions found.</p>
                ) : (
                    prescriptions.map((prescription) => (
                        <div key={prescription.prescription_number} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${prescription.type === 'digital' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'}`}>
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-charcoal dark:text-gray-100 line-clamp-1">
                                        {prescription.diagnosis || 'General Consultation'}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {prescription.doctor?.name || 'Unknown'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Patient: {prescription.patient_name}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-3">
                                        <Calendar size={14} /> {new Date(prescription.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">#{prescription.prescription_number}</div>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex gap-2">
                                    {prescription.view_url ? (
                                        <Link
                                            href={prescription.view_url}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                                        >
                                            <Eye size={16} /> View
                                        </Link>
                                    ) : (
                                        <span className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 text-gray-400 text-sm font-medium cursor-not-allowed">
                                            <Eye size={16} /> View
                                        </span>
                                    )}

                                    {prescription.download_url ? (
                                        <button
                                            onClick={() => {
                                                if (prescription.type === 'digital') {
                                                    api.get(prescription.download_url!, { responseType: 'blob' })
                                                        .then((response) => {
                                                            const url = window.URL.createObjectURL(new Blob([response.data]));
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.setAttribute('download', `prescription-${prescription.prescription_number}.pdf`);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            link.remove();
                                                        })
                                                        .catch((error) => console.error('Error downloading prescription:', error));
                                                } else {
                                                    window.open(prescription.download_url!, '_blank');
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-cureza-green/10 text-cureza-green hover:bg-cureza-green/20 transition-colors text-sm font-medium"
                                        >
                                            <Download size={16} /> Download
                                        </button>
                                    ) : (
                                        <span className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 text-gray-400 text-sm font-medium cursor-not-allowed">
                                            <Download size={16} /> Pending
                                        </span>
                                    )}
                                </div>

                                {prescription.doctor && prescription.doctor.id && prescription.type === 'digital' && (
                                    <button
                                        onClick={() => handleOpenReview(prescription.doctor!)}
                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors text-sm font-semibold border border-amber-500/20"
                                    >
                                        <Star size={15} className="fill-amber-500 text-amber-500" /> Review Doctor Feedback
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Review Dialog */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-charcoal">
                            <MessageSquare className="h-5 w-5 text-amber-500" />
                            Rate Your Experience
                        </DialogTitle>
                        <DialogDescription>
                            Your feedback helps others choose the right practitioner. Share your review for <b>{selectedDoctor?.name}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-sm font-semibold text-slate-500">Overall Rating</span>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="p-1 hover:scale-110 transition-transform"
                                    >
                                        <Star
                                            size={32}
                                            className={`${
                                                star <= rating
                                                    ? 'fill-amber-500 text-amber-500'
                                                    : 'text-slate-300 dark:text-slate-600'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-slate-600">Review Comments (Optional)</span>
                            <Textarea
                                placeholder="Describe your consultation experience..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                className="min-h-[100px] focus:ring-cureza-green"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsReviewOpen(false)}
                            disabled={submittingReview}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={submittingReview}
                            className="bg-cureza-green hover:bg-green-700 font-bold"
                        >
                            {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
