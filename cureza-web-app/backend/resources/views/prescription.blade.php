<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Prescription #{{ $prescription->prescription_number }}</title>
    <style>
        body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            font-size: 12px; 
            color: #1e293b; 
            line-height: 1.5; 
            margin: 0;
            padding: 0;
        }
        .container {
            padding: 24px;
            position: relative;
        }
        /* Header styling */
        .header { 
            border-bottom: 3px solid #0f4c3a; 
            padding-bottom: 16px; 
            margin-bottom: 20px; 
            display: table;
            width: 100%;
        }
        .logo-section {
            display: table-cell;
            vertical-align: middle;
            width: 50%;
        }
        .logo-img {
            max-height: 45px;
            width: auto;
        }
        .logo-fallback {
            font-size: 24px;
            font-weight: 800;
            color: #0f4c3a;
            letter-spacing: 1px;
        }
        .doctor-info { 
            display: table-cell;
            vertical-align: middle;
            text-align: right; 
            width: 50%;
            font-size: 11px;
            line-height: 1.4;
            color: #475569;
        }
        .doctor-name {
            font-size: 15px;
            font-weight: bold;
            color: #0f4c3a;
            margin-bottom: 2px;
        }
        /* Patient Card */
        .patient-card { 
            background: #f8fafc; 
            border: 1px solid #e2e8f0;
            border-radius: 8px; 
            padding: 12px 16px; 
            margin-bottom: 20px;
            display: table;
            width: 100%;
            box-sizing: border-box;
        }
        .patient-col {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            font-size: 11.5px;
        }
        .patient-row {
            margin-bottom: 5px;
        }
        .label {
            color: #64748b;
            font-weight: 600;
        }
        .value {
            color: #0f172a;
            font-weight: 700;
        }
        /* Vitals row */
        .vitals-bar {
            background-color: #f0fdf4;
            border: 1.5px solid #bbf7d0;
            border-radius: 6px;
            padding: 8px 12px;
            margin-bottom: 20px;
        }
        .vital-tag {
            display: inline-block;
            margin-right: 15px;
            font-size: 11px;
            color: #14532d;
        }
        /* Section Title */
        .section-title { 
            font-size: 11.5px;
            font-weight: 800; 
            color: #0f4c3a; 
            margin-top: 20px; 
            margin-bottom: 8px; 
            text-transform: uppercase;
            letter-spacing: 0.75px;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 4px;
        }
        .clinical-text {
            font-size: 12px;
            color: #334155;
            margin-bottom: 15px;
            line-height: 1.5;
        }
        /* Medications table */
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
            margin-bottom: 20px;
        }
        th { 
            background-color: #0f4c3a; 
            color: white; 
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
            padding: 8px 10px;
            text-align: left;
        }
        td { 
            border-bottom: 1px solid #e2e8f0; 
            padding: 10px; 
            text-align: left;
            font-size: 11px;
            color: #334155;
            vertical-align: top;
        }
        .med-name {
            font-weight: 700;
            color: #0f172a;
            font-size: 11.5px;
        }
        .med-instruction {
            font-size: 10px;
            color: #64748b;
            margin-top: 3px;
            font-style: italic;
        }
        /* Sign off block */
        .footer-section {
            margin-top: 40px;
            display: table;
            width: 100%;
        }
        .footer-left {
            display: table-cell;
            vertical-align: bottom;
            width: 60%;
            font-size: 9.5px;
            color: #64748b;
            line-height: 1.4;
        }
        .signature-block { 
            display: table-cell;
            vertical-align: top;
            text-align: right; 
            width: 40%;
        }
        .sig-line {
            border-top: 1.5px solid #94a3b8;
            margin-top: 45px;
            padding-top: 4px;
            font-weight: 700;
            color: #0f172a;
            font-size: 11px;
        }
        .sig-sub {
            font-size: 10px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- 1. HEADER SECTION -->
        <div class="header">
            <div class="logo-section">
                @if(!empty($logo))
                    <img src="{{ $logo }}" class="logo-img" alt="Cureza Logo">
                @else
                    <span class="logo-fallback">CUREZA</span>
                @endif
            </div>
            <div class="doctor-info">
                <div class="doctor-name">Dr. {{ $prescription->doctor->name ?? 'Abdul Shafiz Shaikh' }}</div>
                <div>Reg No: 123456</div>
                <div>Date: {{ $prescription->date ? \Carbon\Carbon::parse($prescription->date)->format('d-M-Y') : now()->format('d-M-Y') }}</div>
                <div>Rx No: <strong>{{ $prescription->prescription_number }}</strong></div>
            </div>
        </div>

        <!-- 2. PATIENT CARD -->
        <div class="patient-card">
            <div class="patient-col">
                <div class="patient-row">
                    <span class="label">Patient Name:</span>
                    <span class="value">{{ $prescription->patient_details['name'] ?? 'N/A' }}</span>
                </div>
                <div class="patient-row">
                    <span class="label">Age / Gender:</span>
                    <span class="value">{{ $prescription->patient_details['age'] ?? 'N/A' }} Yrs / {{ $prescription->patient_details['gender'] ?? 'N/A' }}</span>
                </div>
            </div>
            <div class="patient-col" style="text-align: right;">
                <div class="patient-row">
                    <span class="label">Phone:</span>
                    <span class="value">{{ $prescription->patient_details['phone'] ?? 'N/A' }}</span>
                </div>
                <div class="patient-row">
                    <span class="label">Consultation Code:</span>
                    <span class="value font-mono">#{{ substr($prescription->prescription_number, -6) }}</span>
                </div>
            </div>
        </div>

        <!-- 3. VITALS -->
        @if(!empty($prescription->vitals) && count(array_filter($prescription->vitals)) > 0)
            <div class="vitals-bar">
                @foreach($prescription->vitals as $key => $value)
                    @if(!empty($value))
                        <span class="vital-tag">
                            <strong>{{ strtoupper(str_replace('_', ' ', $key)) }}:</strong> {{ $value }}
                        </span>
                    @endif
                @endforeach
            </div>
        @endif

        <!-- 4. CLINICAL DETAILS -->
        @if($prescription->chief_complaints)
            <div class="section-title">Chief Complaints</div>
            <div class="clinical-text">{{ $prescription->chief_complaints }}</div>
        @endif

        @if($prescription->diagnosis)
            <div class="section-title">Diagnosis</div>
            <div class="clinical-text"><strong>{{ $prescription->diagnosis }}</strong></div>
        @endif

        <!-- 5. MEDICINES TABLE -->
        <div class="section-title">Rx (Medications)</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 45%;">Medicine / Product</th>
                    <th style="width: 15%;">Dosage</th>
                    <th style="width: 20%; text-align: center;">Frequency</th>
                    <th style="width: 20%; text-align: right;">Duration</th>
                </tr>
            </thead>
            <tbody>
                @foreach($prescription->medicines as $medicine)
                    <tr>
                        <td>
                            <div class="med-name">{{ $medicine['name'] }}</div>
                            @if(!empty($medicine['instruction']))
                                <div class="med-instruction">Instructions: {{ $medicine['instruction'] }}</div>
                            @endif
                        </td>
                        <td>{{ $medicine['dosage'] ?? ($medicine['dose'] ?? 'As directed') }}</td>
                        <td style="text-align: center; font-weight: 600;">{{ $medicine['frequency'] ?? 'SOS' }}</td>
                        <td style="text-align: right;">{{ $medicine['duration'] ?? ($medicine['days'] ?? '') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- 6. ADVICE / NOTES -->
        @if($prescription->advice)
            <div class="section-title">Advice &amp; Lifestyle Instructions</div>
            <div class="clinical-text">{!! nl2br(e($prescription->advice)) !!}</div>
        @endif

        <!-- 7. SIGNATURE SECTION -->
        <div class="footer-section">
            <div class="footer-left">
                <div>* This document is generated digitally and is valid without a physical signature.</div>
                <div>* Invalid for medicolegal validation. Valid for 1 single discharge/execution only.</div>
                <div style="margin-top: 5px; font-weight: bold; color: #0f4c3a;">Cureza Healthcare | www.cureza.in</div>
            </div>
            <div class="signature-block">
                <div class="sig-line">Dr. {{ $prescription->doctor->name ?? 'Abdul Shafiz Shaikh' }}</div>
                <div class="sig-sub">Authorized Consultant Signatory</div>
            </div>
        </div>
    </div>
</body>
</html>
