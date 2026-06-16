'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Download, Calendar, User, Activity, FileText, ShoppingBag, Check } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';

interface Prescription {
    id: number;
    prescription_number: string;
    doctor_id?: number;
    doctor: {
        id: number;
        name: string;
    };
    date: string;
    patient_details: {
        name: string;
        age: number;
        gender: string;
        phone: string;
        health_concern: string;
    };
    vitals: Record<string, string>;
    chief_complaints: string;
    diagnosis: string;
    medicines: Array<{
        name: string;
        composition: string;
        dosage: string;
        frequency: string;
        duration: string;
        instruction: string;
    }>;
    advice: string;
    notes: string;
}

export default function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Store product matching states
    const [products, setProducts] = useState<any[]>([]);
    const [matchedProducts, setMatchedProducts] = useState<Array<{ medicine: any; product: any | null }>>([]);
    const [isCartLoading, setIsCartLoading] = useState(false);

    useEffect(() => {
        // Fetch prescription
        api.get(`/user/prescriptions/${id}`)
            .then((res) => setPrescription(res.data))
            .catch((err) => {
                console.error(err);
                showToast("Failed to load prescription details", "error");
            })
            .finally(() => setLoading(false));

        // Fetch products
        api.get('/products')
            .then((res) => {
                setProducts(res.data.data || res.data);
            })
            .catch((err) => console.error("Error loading products:", err));
    }, [id]);

    // Match medicines to store products
    useEffect(() => {
        if (prescription && products.length > 0) {
            const matches = prescription.medicines.map((med: any) => {
                const match = products.find((p: any) => 
                    p.title.toLowerCase().trim() === med.name.toLowerCase().trim() ||
                    p.title.toLowerCase().includes(med.name.toLowerCase()) ||
                    med.name.toLowerCase().includes(p.title.toLowerCase())
                );
                return {
                    medicine: med,
                    product: match || null
                };
            });
            setMatchedProducts(matches);
        }
    }, [prescription, products]);

    const handleBuyProduct = async (product: any) => {
        if (!prescription) return;
        setIsCartLoading(true);
        try {
            const patientDetails = {
                patient_name: prescription.patient_details.name,
                patient_age: Number(prescription.patient_details.age) || 30,
                patient_gender: prescription.patient_details.gender,
                health_concern: prescription.patient_details.health_concern || prescription.diagnosis,
                prescription_path: prescription.prescription_number,
                doctor_id: prescription.doctor?.id
            };
            await addToCart(product, 1, product.is_prescription_required ? patientDetails : undefined);
            showToast(`${product.title} added to cart!`, 'success');
        } catch (err) {
            showToast('Failed to add product to cart', 'error');
        } finally {
            setIsCartLoading(false);
        }
    };

    const handleBuyAll = async () => {
        if (!prescription) return;
        const validMatches = matchedProducts.filter(m => m.product !== null);
        if (validMatches.length === 0) {
            showToast('No matching products found in store catalog', 'warning');
            return;
        }

        setIsCartLoading(true);
        try {
            for (const item of validMatches) {
                const patientDetails = {
                    patient_name: prescription.patient_details.name,
                    patient_age: Number(prescription.patient_details.age) || 30,
                    patient_gender: prescription.patient_details.gender,
                    health_concern: prescription.patient_details.health_concern || prescription.diagnosis,
                    prescription_path: prescription.prescription_number,
                    doctor_id: prescription.doctor?.id
                };
                await addToCart(item.product, 1, item.product.is_prescription_required ? patientDetails : undefined, false);
            }
            showToast('All prescribed items added to cart successfully!', 'success');
            router.push('/cart');
        } catch (err) {
            showToast('Failed to add some items to cart', 'error');
        } finally {
            setIsCartLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F3EF] text-[#052326]">
                <p className="text-sm font-light">Loading prescription details...</p>
            </div>
        );
    }
    if (!prescription) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F8F3EF] text-[#052326] gap-4">
                <p className="text-sm font-semibold">Prescription not found</p>
                <Link href="/dashboard/prescriptions">
                    <Button className="bg-[#052326] text-[#F8F3EF] rounded-[10px] text-xs font-bold uppercase tracking-wider h-10 px-6">
                        Back to Prescriptions
                    </Button>
                </Link>
            </div>
        );
    }

    const hasMedsToBuy = matchedProducts.some(m => m.product !== null);

    return (
        <div className="min-h-screen bg-[#F8F3EF] text-[#052326] py-10 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#052326]/12 pb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/prescriptions" className="p-2 hover:bg-[#052326]/5 rounded-[10px] transition-colors border border-[#052326]/8 bg-white text-[#052326]">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <span className="text-[10px] font-bold tracking-[0.2em] text-[#052326]/50 uppercase block mb-1">
                                Medical Recommendation
                            </span>
                            <h1 className="text-xl md:text-2xl font-bold font-heading">
                                Prescription #{prescription.prescription_number}
                            </h1>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button
                            onClick={() => {
                                api.get(`/user/prescriptions/${id}/download`, { responseType: 'blob' })
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
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-[#052326]/20 bg-white text-[#052326] hover:bg-[#052326]/5 h-11 px-5 rounded-[10px] text-xs font-bold uppercase tracking-wider"
                        >
                            <Download size={15} /> Download PDF
                        </Button>

                        {hasMedsToBuy && (
                            <Button
                                onClick={handleBuyAll}
                                disabled={isCartLoading}
                                className="flex-1 sm:flex-none bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 h-11 px-6 rounded-[10px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow"
                            >
                                <ShoppingBag size={15} /> Add All to Cart & Shop
                            </Button>
                        )}
                    </div>
                </div>

                {/* Prescription Layout Card */}
                <div className="bg-white rounded-[14px] border border-[#052326]/12 shadow-premium-light overflow-hidden">
                    
                    {/* Professional Header Block */}
                    <div className="bg-[#052326]/5 p-6 border-b border-[#052326]/12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <span className="text-[9px] font-bold tracking-widest text-[#052326]/40 uppercase block mb-1">Prescribing Doctor</span>
                            <h2 className="font-bold text-lg text-[#052326]">{prescription.doctor?.name ? `Dr. ${prescription.doctor.name}` : 'Consulting Practitioner'}</h2>
                            <p className="text-[10px] text-[#052326]/60 mt-0.5">Ayurvedic Specialist (BAMS)</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-[9px] font-bold tracking-widest text-[#052326]/40 uppercase block mb-1 font-sans">Date Issued</span>
                            <p className="text-sm font-semibold flex items-center gap-1.5 sm:justify-end">
                                <Calendar size={14} className="text-[#052326]/50" /> {new Date(prescription.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-8">
                        {/* Patient Information Sheet */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-5 bg-[#F8F3EF]/40 border border-[#052326]/10 rounded-[12px]">
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/40 block mb-1">Patient Name</span>
                                <span className="font-semibold text-sm block">{prescription.patient_details?.name}</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/40 block mb-1">Age / Gender</span>
                                <span className="font-semibold text-sm block">
                                    {prescription.patient_details?.age} Yrs / {prescription.patient_details?.gender}
                                </span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/40 block mb-1">Mobile Contact</span>
                                <span className="font-semibold text-sm block">{prescription.patient_details?.phone || '-'}</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#052326]/40 block mb-1">Target Concern</span>
                                <span className="font-semibold text-sm block truncate capitalize">{prescription.patient_details?.health_concern || 'General Consulting'}</span>
                            </div>
                        </div>

                        {/* Vitals Record */}
                        {prescription.vitals && Object.keys(prescription.vitals).length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326]/50 flex items-center gap-1.5 font-sans">
                                    <Activity size={14} /> Recorded Patient Vitals
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(prescription.vitals).map(([key, value]) => 
                                        value ? (
                                            <span key={key} className="bg-[#052326]/5 border border-[#052326]/10 px-4 py-2 rounded-[10px] text-xs font-bold capitalize text-[#052326]/70">
                                                {key.replace('_', ' ')}: <span className="text-[#052326] ml-0.5">{value as string}</span>
                                            </span>
                                        ) : null
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Clinical Diagnosis Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[#052326]/8 pt-6">
                            {prescription.chief_complaints && (
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/50 mb-1.5">Chief Complaints</h3>
                                    <p className="text-xs text-[#052326]/80 leading-relaxed font-light">{prescription.chief_complaints}</p>
                                </div>
                            )}
                            {prescription.diagnosis && (
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/50 mb-1.5 font-sans">Clinical Diagnosis</h3>
                                    <p className="text-sm font-semibold">{prescription.diagnosis}</p>
                                </div>
                            )}
                        </div>

                        {/* Prescribed Medicines and Checkout Integration */}
                        <div className="space-y-4 border-t border-[#052326]/8 pt-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#052326]/50 flex items-center gap-1.5">
                                <FileText size={14} /> Medical Prescription
                            </h3>
                            
                            <div className="overflow-hidden border border-[#052326]/12 rounded-[12px] bg-white">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-[#F8F3EF]/50 text-[#052326]/60 border-b border-[#052326]/12">
                                            <tr>
                                                <th className="px-5 py-3 font-bold uppercase tracking-wider text-[9px]">Phyto-formulation</th>
                                                <th className="px-5 py-3 font-bold uppercase tracking-wider text-[9px]">Dosage</th>
                                                <th className="px-5 py-3 font-bold uppercase tracking-wider text-[9px]">Frequency</th>
                                                <th className="px-5 py-3 font-bold uppercase tracking-wider text-[9px]">Duration</th>
                                                <th className="px-5 py-3 font-bold uppercase tracking-wider text-[9px] text-right">Store Option</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#052326]/10 text-xs">
                                            {matchedProducts.map((item, index) => (
                                                <tr key={index} className="hover:bg-[#F8F3EF]/20 transition-colors">
                                                    <td className="px-5 py-4 font-semibold text-[#052326]">
                                                        {item.medicine.name}
                                                        {item.medicine.instruction && (
                                                            <span className="block text-[10px] text-[#052326]/50 font-normal italic mt-0.5">
                                                                * {item.medicine.instruction}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-[#052326]/70">{item.medicine.dosage || item.medicine.dose}</td>
                                                    <td className="px-5 py-4 text-[#052326]/70">{item.medicine.frequency}</td>
                                                    <td className="px-5 py-4 text-[#052326]/70">{item.medicine.duration || `${item.medicine.days} Days`}</td>
                                                    <td className="px-5 py-4 text-right">
                                                        {item.product ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                                    ₹{item.product.price}
                                                                </span>
                                                                <Button 
                                                                    onClick={() => handleBuyProduct(item.product)}
                                                                    disabled={isCartLoading}
                                                                    className="bg-[#052326] text-[#F8F3EF] hover:bg-[#052326]/90 px-3 h-8 rounded-[8px] text-[10px] font-semibold uppercase tracking-wider"
                                                                >
                                                                    Add to Cart
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-[#052326]/40 italic">Not available in store</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Lifestyle Advice & Notes */}
                        {(prescription.advice || prescription.notes) && (
                            <div className="bg-[#F0C417]/5 border border-[#052326]/10 p-5 rounded-[12px] space-y-4">
                                {prescription.advice && (
                                    <div>
                                        <h3 className="text-xs font-bold text-[#052326] uppercase tracking-wider mb-1">Doctor's Lifestyle & Dietary Advice</h3>
                                        <p className="text-xs leading-relaxed text-[#052326]/80 font-light whitespace-pre-wrap">{prescription.advice}</p>
                                    </div>
                                )}
                                {prescription.notes && (
                                    <div className="pt-2 border-t border-[#052326]/8">
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#052326]/40 mb-1">General Notes</h4>
                                        <p className="text-xs text-[#052326]/70 italic leading-relaxed">"{prescription.notes}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Disclaimer Footer */}
                    <div className="bg-[#052326]/5 p-5 text-center text-[10px] text-[#052326]/50 border-t border-[#052326]/12">
                        * This digital medical prescription is generated in compliance with Telemedicine Practice Guidelines. Validity is strictly linked to registered symptoms.
                    </div>
                </div>

            </div>
        </div>
    );
}
