'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Download, Calendar, User, Activity, FileText } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Prescription {
    id: number;
    prescription_number: string;
    doctor: {
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
        dose: string;
        frequency: string;
        days: number;
        instruction: string;
    }>;
    advice: string;
    notes: string;
}

export default function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/user/prescriptions/${id}`)
            .then((res) => setPrescription(res.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div>Loading prescription...</div>;
    if (!prescription) return <div>Prescription not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/prescriptions" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-charcoal dark:text-gray-100">Prescription #{prescription.prescription_number}</h1>
                <div className="ml-auto">
                    <button
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
                        className="flex items-center gap-2 bg-cureza-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-green-50 dark:bg-green-900/20 p-6 border-b border-green-100 dark:border-green-800/30 flex justify-between items-start">
                    <div>
                        <h2 className="font-bold text-lg text-cureza-green">Dr. {prescription.doctor?.name}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Reg No: 123456</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Date: {new Date(prescription.date).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Patient Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Patient Name</p>
                            <p className="font-medium">{prescription.patient_details.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Age / Gender</p>
                            <p className="font-medium">{prescription.patient_details.age} Y / {prescription.patient_details.gender}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Phone</p>
                            <p className="font-medium">{prescription.patient_details.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Health Concern</p>
                            <p className="font-medium">{prescription.patient_details.health_concern}</p>
                        </div>
                    </div>

                    {/* Vitals */}
                    {prescription.vitals && (
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                                <Activity size={18} className="text-cureza-green" /> Vitals
                            </h3>
                            <div className="flex gap-4 flex-wrap">
                                {Object.entries(prescription.vitals).map(([key, value]) => (
                                    <div key={key} className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300">
                                        <span className="capitalize">{key}:</span> {value as string}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Complaints & Diagnosis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {prescription.chief_complaints && (
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Chief Complaints</h3>
                                <p className="text-gray-600 dark:text-gray-300">{prescription.chief_complaints}</p>
                            </div>
                        )}
                        {prescription.diagnosis && (
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Diagnosis</h3>
                                <p className="text-gray-600 dark:text-gray-300">{prescription.diagnosis}</p>
                            </div>
                        )}
                    </div>

                    {/* Medicines */}
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-cureza-green" /> Medicines
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3 rounded-l-lg">Medicine Name</th>
                                        <th className="px-6 py-3">Dosage</th>
                                        <th className="px-6 py-3">Frequency</th>
                                        <th className="px-6 py-3">Duration</th>
                                        <th className="px-6 py-3 rounded-r-lg">Instruction</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescription.medicines.map((medicine, index) => (
                                        <tr key={index} className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {medicine.name}
                                                <div className="text-xs text-gray-500 font-normal">{medicine.composition}</div>
                                            </td>
                                            <td className="px-6 py-4">{medicine.dose}</td>
                                            <td className="px-6 py-4">{medicine.frequency}</td>
                                            <td className="px-6 py-4">{medicine.days} Days</td>
                                            <td className="px-6 py-4">{medicine.instruction}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Advice & Notes */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
                        {prescription.advice && (
                            <div className="mb-4">
                                <h3 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2">Advice</h3>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{prescription.advice}</p>
                            </div>
                        )}
                        {prescription.notes && (
                            <div>
                                <h3 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2">Note</h3>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{prescription.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 text-center text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800">
                    This prescription is valid only once. Not valid for medicolegal purposes.
                </div>
            </div>
        </div >
    );
}
