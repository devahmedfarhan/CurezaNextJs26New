'use client';

import { FileText, UserCheck, Video, Box, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface TimelineStep {
  number: string;
  title: string;
  description: string;
  icon: any;
}

const STEPS: TimelineStep[] = [
  {
    number: "01",
    title: "Complete Intake Form",
    description: "Fill a confidential 3-minute health questionnaire detailing your lifestyle, symptoms, and medical history.",
    icon: FileText
  },
  {
    number: "02",
    title: "Consult Certified Doctor",
    description: "Get matched with a verified Ayurvedic physician or wellness doctor specializing in your specific concern.",
    icon: UserCheck
  },
  {
    number: "03",
    title: "Get Custom Treatment",
    description: "Your assigned physician designs a tailored dosage plan utilizing targeted botanical active ingredients.",
    icon: Video
  },
  {
    number: "04",
    title: "Weekly Doorstep Delivery",
    description: "Your custom formulation is compounded, quality checked, and shipped straight to your doorstep.",
    icon: Box
  }
];

export default function DoctorConsultationTimeline() {
  return (
    <section className="w-full py-16 md:py-24 bg-white text-[#052326] relative overflow-hidden">
      {/* Decorative vectors */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#052326]/5 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#052326]/50 uppercase block mb-3">
            Integrated Clinical Ecosystem
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight">
            How Your Rx Consultation Works
          </h2>
          <p className="text-sm text-[#052326]/70 font-light mt-4">
            Follow our certified medical pathway to obtain authentic, customized botanical treatments.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-[#052326]/10 via-[#052326]/20 to-[#052326]/10 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.number} 
                  className="flex flex-col items-center text-center group"
                >
                  {/* Icon Badge (10-14px border radius, i.e., rounded-xl) */}
                  <div className="w-24 h-24 rounded-[14px] bg-[#F8F3EF] border border-[#052326]/5 flex items-center justify-center mb-6 relative group-hover:bg-[#052326] group-hover:text-[#F8F3EF] group-hover:border-[#052326] transition-all duration-500 shadow-sm group-hover:shadow-md">
                    <Icon className="w-8 h-8 text-[#052326] group-hover:text-[#F8F3EF] transition-colors duration-500" />
                    
                    {/* Step Number Circle */}
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#F0C417] text-[#052326] text-[10px] font-bold flex items-center justify-center border-2 border-white">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-sm md:text-base font-semibold uppercase tracking-wider mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-xs md:text-sm text-[#052326]/70 font-light leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action button */}
        <div className="mt-16 text-center">
          <Link
            href="/consultation"
            className="group inline-flex items-center justify-center px-8 py-4 bg-[#052326] text-[#F8F3EF] font-semibold text-sm rounded-[12px] hover:bg-[#052326]/90 transition-all shadow-lg hover:scale-[1.02]"
          >
            Start Your Intake Questionnaire
            <ArrowRight className="w-4 h-4 ml-2.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
