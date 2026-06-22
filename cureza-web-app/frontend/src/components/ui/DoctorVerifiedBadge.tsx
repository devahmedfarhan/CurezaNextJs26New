import { ShieldCheck } from 'lucide-react';

export default function DoctorVerifiedBadge() {
    return (
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-trust-blue px-3 py-1 rounded-full text-xs font-bold border-[0.5px] border-black/50">
            <ShieldCheck size={14} />
            <span>Doctor Verified</span>
        </div>
    );
}
