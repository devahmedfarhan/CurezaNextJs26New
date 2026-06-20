<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commission Invoice #COMM-{{ $order->order_number }}</title>
  <link href="https://fonts.googleapis.com/css?family=Inter&display=swap" rel="stylesheet">
  <style>
    :root {
      --font-family-inter: 'Inter', sans-serif;
      --Primary-Colors-Blue: rgba(35, 136, 255, 1);
      --Neutral-Colors-800: rgba(25, 33, 61, 1);
      --Neutral-Colors-700: rgba(93, 100, 129, 1);
      --Neutral-Colors-600: rgba(134, 141, 166, 1);
      --Neutral-Colors-300: rgba(235, 239, 246, 1);
      --Neutral-Colors-200: rgba(246, 248, 252, 1);
      --Neutral-Colors-White: rgba(255, 255, 255, 1);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: var(--font-family-inter); background: #f5f5f5; padding: 20px; color: var(--Neutral-Colors-800); }
    .invoice-card { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 20px; box-shadow: 0px 10px 20px rgba(0,0,0,0.05); overflow: hidden; }
    .header-bar { height: 10px; background-color: var(--Primary-Colors-Blue); }
    .wrapper { padding: 40px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .col { width: 48%; }
    .title { font-size: 20px; font-weight: 700; color: var(--Primary-Colors-Blue); margin-bottom: 10px; }
    .label { font-size: 10px; text-transform: uppercase; color: var(--Neutral-Colors-600); margin-bottom: 4px; font-weight: 600; }
    .value { font-size: 12px; font-weight: 700; color: var(--Neutral-Colors-800); }
    .meta-box { background: var(--Neutral-Colors-200); border-radius: 10px; padding: 15px; display: flex; justify-content: space-between; margin-bottom: 30px; border: 1px solid var(--Neutral-Colors-300); }
    .meta-item { text-align: left; }
    .table-container { background: var(--Neutral-Colors-200); border-radius: 10px; padding: 10px; margin-bottom: 30px; }
    .table-header { display: flex; justify-content: space-between; border-bottom: 1px solid var(--Neutral-Colors-300); padding: 8px 10px; font-size: 10px; text-transform: uppercase; font-weight: 700; color: var(--Neutral-Colors-600); }
    .table-row { display: flex; justify-content: space-between; border-bottom: 1px solid var(--Neutral-Colors-300); padding: 12px 10px; font-size: 12px; }
    .table-row:last-child { border-bottom: none; }
    .desc-col { width: 50%; font-weight: 700; color: var(--Neutral-Colors-700); }
    .val-col { width: 25%; text-align: right; font-weight: 600; }
    .tot-col { width: 25%; text-align: right; font-weight: 700; color: var(--Neutral-Colors-800); }
    .summary-box { display: flex; flex-direction: column; align-items: flex-end; padding-right: 10px; margin-bottom: 30px; }
    .summary-row { display: flex; justify-content: flex-end; font-size: 12px; margin-bottom: 6px; }
    .summary-row .lbl { width: 180px; text-align: right; color: var(--Neutral-Colors-600); font-weight: 600; }
    .summary-row .val { width: 100px; text-align: right; font-weight: 700; }
    .grand-total { font-size: 18px; color: var(--Primary-Colors-Blue); border-top: 1px solid var(--Neutral-Colors-300); padding-top: 8px; margin-top: 8px; }
    .footer-note { font-size: 10px; color: var(--Neutral-Colors-600); border: 1px solid var(--Neutral-Colors-300); border-radius: 10px; padding: 12px; line-height: 1.5; }
    .address-card { background: var(--Primary-Colors-Blue); border-radius: 15px; padding: 15px; color: #fff; box-shadow: 0px 5px 15px rgba(35, 136, 255, 0.2); }
    .address-card p { font-size: 11px; margin-bottom: 4px; line-height: 1.4; }
    .address-card .name { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
  </style>
</head>
<body>

@php
  $firstItem = $order->items->first();
  $seller = $firstItem ? $firstItem->seller : null;
  $sellerProfile = $seller ? $seller->sellerProfile : null;
  
  // Calculate commission fees for this B2B invoice
  $commissionService = new \App\Services\CommissionService();
  $commissionData = $commissionService->calculateOrderCommission($order);
  $breakdown = $commissionData['breakdown'][$seller->id] ?? null;

  $sellerBrandName = ($seller && $seller->brand) ? $seller->brand->name : ($seller ? $seller->name : 'N/A');
  $sellerAddress = $sellerProfile ? ($sellerProfile->address_line_1 . ', ' . $sellerProfile->city . ', ' . $sellerProfile->state . ' - ' . $sellerProfile->pin_code) : 'N/A';
  $sellerGst = $sellerProfile ? $sellerProfile->gst_number : 'N/A';
  
  // Marketplace service charges
  $commAmt = $breakdown ? (float)$breakdown['platform_commission_amount'] : 0.00;
  $pgAmt = $breakdown ? (float)$breakdown['payment_gateway_fee'] : 0.00;
  $shipAmt = $breakdown ? (float)$breakdown['shipping_charge'] : 0.00;
  
  $subtotal = $commAmt + $pgAmt + $shipAmt;
  
  // Service tax is standard 18% on marketplace fees in India
  $serviceGstRate = 18.00;
  $taxAmount = $subtotal * ($serviceGstRate / 100);
  $totalCharges = $subtotal + $taxAmount;
  
  $marketplaceGst = '08CZRPA3578H1ZY';
@endphp

<div class="invoice-card">
  <div class="header-bar"></div>
  <div class="wrapper">
    
    <div class="row">
      <div class="col">
        <div class="title">B2B Commission Invoice</div>
        <p style="font-size: 11px; color: var(--Neutral-Colors-600);">Tax invoice for e-commerce services rendered</p>
      </div>
      <div class="col" style="text-align: right;">
        <div style="font-size: 22px; font-weight: bold; color: var(--Primary-Colors-Blue);">CUREZA</div>
      </div>
    </div>

    <div class="meta-box">
      <div class="meta-item">
        <div class="label">Invoice Number</div>
        <div class="value">CZ-COMM-{{ $order->order_number }}</div>
      </div>
      <div class="meta-item">
        <div class="label">Invoice Date</div>
        <div class="value">{{ $order->created_at->format('d-M-Y') }}</div>
      </div>
      <div class="meta-item">
        <div class="label">Order Reference</div>
        <div class="value">#{{ $order->order_number }}</div>
      </div>
    </div>

    <div class="row">
      <div class="col address-card">
        <p class="label" style="color: rgba(255,255,255,0.7);">Service Provider (Marketplace)</p>
        <p class="name">Cureza Healthcare</p>
        <p>54/3 Kumar Mohalla, Dargah Nazim Building,<br>Inside Delhi Gate, Ajmer, Rajasthan - 305001</p>
        <p>GSTIN: {{ $marketplaceGst }}</p>
        <p>Email: info@cureza.in | Phone: 9887860015</p>
      </div>
      
      <div class="col" style="border: 1px solid var(--Neutral-Colors-300); border-radius: 15px; padding: 15px; background: var(--Neutral-Colors-200);">
        <p class="label">Billed To (Seller)</p>
        <p class="value" style="font-size: 13px; margin-bottom: 8px;">{{ $sellerBrandName }}</p>
        <p style="font-size: 11px; margin-bottom: 4px; line-height: 1.4; color: var(--Neutral-Colors-700);">{{ $sellerAddress }}</p>
        <p style="font-size: 11px; font-weight: 700; color: var(--Neutral-Colors-800);">GSTIN: {{ $sellerGst }}</p>
      </div>
    </div>

    <div class="table-container">
      <div class="table-header">
        <div class="desc-col">Service Description (SAC 996114)</div>
        <div class="val-col">Rate %</div>
        <div class="tot-col">Amount (INR)</div>
      </div>
      
      <div class="table-row">
        <div class="desc-col">Marketplace E-commerce Commission</div>
        <div class="val-col">{{ $breakdown ? $breakdown['platform_commission_percentage'] : '25' }}%</div>
        <div class="tot-col">₹{{ number_format($commAmt, 2) }}</div>
      </div>
      
      <div class="table-row">
        <div class="desc-col">Payment Gateway Processing Charges</div>
        <div class="val-col">{{ $breakdown ? $breakdown['payment_gateway_percentage'] : '2.5' }}%</div>
        <div class="tot-col">₹{{ number_format($pgAmt, 2) }}</div>
      </div>
      
      <div class="table-row">
        <div class="desc-col">Marketplace Logistical Logistics Charges (Shipping)</div>
        <div class="val-col">Fixed</div>
        <div class="tot-col">₹{{ number_format($shipAmt, 2) }}</div>
      </div>
    </div>

    <div class="summary-box">
      <div class="summary-row">
        <div class="lbl">Subtotal (Marketplace Services)</div>
        <div class="val">₹{{ number_format($subtotal, 2) }}</div>
      </div>
      
      @php
        $isRajasthan = $sellerProfile && strtolower(trim($sellerProfile->state ?? '')) === 'rajasthan';
        $cgst = $isRajasthan ? ($taxAmount / 2) : 0.00;
        $sgst = $isRajasthan ? ($taxAmount / 2) : 0.00;
        $igst = !$isRajasthan ? $taxAmount : 0.00;
      @endphp
      
      @if($igst > 0)
      <div class="summary-row">
        <div class="lbl">IGST @ 18%</div>
        <div class="val">₹{{ number_format($igst, 2) }}</div>
      </div>
      @else
      <div class="summary-row">
        <div class="lbl">CGST @ 9%</div>
        <div class="val">₹{{ number_format($cgst, 2) }}</div>
      </div>
      <div class="summary-row">
        <div class="lbl">SGST @ 9%</div>
        <div class="val">₹{{ number_format($sgst, 2) }}</div>
      </div>
      @endif

      <div class="summary-row grand-total">
        <div class="lbl" style="font-weight: 700;">Total Service Fee Deductions</div>
        <div class="val" style="font-weight: 700;">₹{{ number_format($totalCharges, 2) }}</div>
      </div>
    </div>

    <div class="footer-note">
      <strong>Important Accounting Note:</strong><br>
      This document constitutes a tax invoice for B2B e-commerce platform services billed directly to you. This service charge has been adjusted and deducted directly from the payout calculations of Order #{{ $order->order_number }}. No manual bank transfer or payout is required for this invoice. You may use this invoice to claim Input Tax Credit (ITC) on your monthly GST returns.
    </div>

  </div>
</div>

</body>
</html>
