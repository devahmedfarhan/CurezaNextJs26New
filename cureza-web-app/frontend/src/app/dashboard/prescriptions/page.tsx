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
            <div className="flex flex-col items-center justify-center min-h-[300px] text-[#052326]/50 gap-3">
                <RefreshCw className="h-7 w-7 animate-spin text-[#052326]" />
                <p className="text-xs font-light">Loading prescriptions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[#052326]/12 pb-4">
                <div>
                    <h1 className="text-xl font-bold font-heading text-[#052326]">My Prescriptions</h1>
                    <p className="text-xs text-[#052326]/50 font-light mt-0.5">Track your clinical consult summaries and digital prescriptions</p>
                </div>
            </div>

            {/* Prescription List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prescriptions.length === 0 ? (
                    <div className="md:col-span-2 text-center py-12 border border-dashed border-[#052326]/20 rounded-[14px]">
                        <p className="text-xs text-[#052326]/50 font-light">No prescriptions found in your account history.</p>
                    </div>
                ) : (
                    prescriptions.map((prescription) => (
                        <div 
                            key={prescription.prescription_number} 
                            className="bg-white p-6 rounded-[12px] border border-[#052326]/12 shadow-premium-light hover:shadow-premium-hover transition-all duration-300 group flex flex-col justify-between"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                                    prescription.type === 'digital' 
                                        ? 'bg-[#052326]/5 text-[#052326]' 
                                        : 'bg-[#F0C417]/10 text-[#052326]'
                                }`}>
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/40 block mb-1">
                                        {prescription.type === 'digital' ? 'Clinical Telehealth' : 'Product Purchase Rx'}
                                    </span>
                                    <h3 className="font-bold text-[#052326] text-sm truncate">
                                        {prescription.diagnosis || 'General Consultation'}
                                    </h3>
                                    <p className="text-xs text-[#052326]/60 mt-1 font-medium">
                                        {prescription.doctor?.name ? `Dr. ${prescription.doctor.name}` : 'Clinical Care Team'}
                                    </p>
                                    <p className="text-[10px] text-[#052326]/40 mt-1 font-light">Patient: {prescription.patient_name}</p>
                                    <div className="flex items-center gap-1.5 text-[10px] text-[#052326]/50 mt-3">
                                        <Calendar size={12} className="text-[#052326]/30" /> 
                                        <span>Issued {new Date(prescription.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-[9px] text-[#052326]/30 font-mono mt-1">#{prescription.prescription_number}</div>
                                </div>
                            </div>
                            
                            <div className="space-y-2 mt-6 pt-4 border-t border-[#052326]/8">
                                <div className="flex gap-2">
                                    {prescription.view_url ? (
                                        <Link
                                            href={prescription.view_url}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-[#052326]/5 text-[#052326] hover:bg-[#052326]/10 transition-colors text-xs font-semibold uppercase tracking-wider"
                                        >
                                            <Eye size={14} /> View Details
                                        </Link>
                                    ) : (
                                        <span className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-gray-50 text-gray-300 text-xs font-semibold uppercase tracking-wider cursor-not-allowed">
                                            <Eye size={14} /> View Details
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
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 transition-colors text-xs font-semibold uppercase tracking-wider"
                                        >
                                            <Download size={14} /> Download PDF
                                        </button>
                                    ) : (
                                        <span className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-gray-50 text-gray-300 text-xs font-semibold uppercase tracking-wider cursor-not-allowed">
                                            <Download size={14} /> Pending
                                        </span>
                                    )}
                                </div>

                                {prescription.doctor && prescription.doctor.id && prescription.type === 'digital' && (
                                    <button
                                        onClick={() => handleOpenReview(prescription.doctor!)}
                                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-[10px] bg-[#F0C417]/10 text-[#052326] hover:bg-[#F0C417]/20 transition-colors text-xs font-bold uppercase tracking-wider border border-[#F0C417]/20"
                                    >
                                        <Star size={13} className="fill-[#052326] text-[#052326]" /> Review Doctor Feedback
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Review Dialog */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="customer-theme sm:max-w-[425px] rounded-[14px] border border-[#052326]/12 bg-white p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold font-heading text-[#052326]">
                            <MessageSquare className="h-5 w-5 text-[#F0C417]" />
                            Rate Your Experience
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[#052326]/60 font-light mt-1">
                            Your feedback helps others choose the right practitioner. Share your review for <b>{selectedDoctor?.name}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs font-semibold text-[#052326]/60 uppercase tracking-wider">Overall Rating</span>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="p-1 hover:scale-110 transition-transform"
                                    >
                                        <Star
                                            size={28}
                                            className={`${
                                                star <= rating
                                                    ? 'fill-[#F0C417] text-[#F0C417]'
                                                    : 'text-[#052326]/12'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-[#052326]/60 uppercase tracking-wider">Review Comments</span>
                            <Textarea
                                placeholder="Describe your consultation experience..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                className="min-h-[90px] rounded-[10px] border-[#052326]/12 focus:ring-[#052326]/20"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setIsReviewOpen(false)}
                            disabled={submittingReview}
                            className="rounded-[10px] text-xs font-bold uppercase tracking-wider"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={submittingReview}
                            className="bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 rounded-[10px] text-xs font-bold uppercase tracking-wider px-5 h-10"
                        >
                            {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
