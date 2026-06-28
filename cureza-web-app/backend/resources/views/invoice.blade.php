<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - {{ $order->order_number }}</title>
  <style>
    @font-face {
      font-family: 'Great Vibes';
      font-style: normal;
      font-weight: 400;
      src: url('https://fonts.gstatic.com/s/greatvibes/v14/RWmMoK39Jjwsou677uH-r2A5O46K.ttf') format('truetype');
    }
    
    .signature-text {
      font-family: 'Great Vibes', cursive !important;
      font-size: 26px;
      color: #2d7c80; /* Cureza Brand Teal Accent */
      margin: 2px 0;
      line-height: 1.1;
      text-align: center;
    }

    /* Styling optimized for DomPDF compatibility */
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    .invoice-container {
      background-color: #ffffff;
      max-width: 100%;
      margin: 0 auto;
      padding: 10px;
      position: relative;
    }

    h1, h2, h3, h4 {
      margin: 0;
      color: #0f172a;
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .text-sm { font-size: 13px; }
    .text-xs { font-size: 11px; }
    .text-muted { color: #64748b; }

    /* Theme Accent Colors (Cureza Brand Teal) */
    .primary-accent {
      color: #2d7c80;
    }
    .bg-accent-light {
      background-color: #f0f9f9;
    }

    .tax-invoice-badge {
      display: inline-block;
      background: #2d7c80;
      color: #ffffff;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 5px 12px;
      font-size: 12px;
      border-radius: 4px;
      margin-bottom: 6px;
      text-transform: uppercase;
      text-align: center;
    }

    .invoice-meta-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 11px;
      line-height: 1.4;
    }

    .invoice-meta-table {
      width: 100%;
      border-collapse: collapse;
    }
    .invoice-meta-table td {
      padding: 3px 0;
      border-bottom: 1px dashed #e2e8f0;
      font-size: 11px;
      color: #334155;
    }
    .invoice-meta-table tr:last-child td {
      border-bottom: none;
    }

    .address-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 11px;
      line-height: 1.4;
      height: 135px; /* Fixed height to keep grids aligned */
    }

    .address-card-title {
      font-weight: 700;
      color: #1e293b;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 10px;
    }

    /* Table Styling */
    .table-container {
      margin-bottom: 15px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      text-align: left;
    }

    .items-table th {
      background-color: #f8fafc;
      color: #334155;
      font-weight: 700;
      padding: 8px 10px;
      border-bottom: 2px solid #e2e8f0;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.5px;
    }

    .items-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
      color: #334155;
      line-height: 1.3;
    }

    .items-table tr:last-child td {
      border-bottom: none;
    }

    .item-title {
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .item-subtitle {
      font-size: 10px;
      color: #64748b;
    }

    .totals-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }

    .totals-table td {
      padding: 3px 6px;
      color: #475569;
    }

    .totals-table tr.grand-total {
      background-color: #f0f9f9;
      color: #2d7c80;
      font-weight: 700;
      font-size: 12px;
    }
    
    .totals-table tr.grand-total td {
      color: #2d7c80;
      padding: 6px;
      border-top: 2px solid #2d7c80;
    }

    /* Terms and Conditions */
    .terms-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 10px;
      color: #64748b;
      line-height: 1.3;
    }

    .terms-title {
      font-weight: 700;
      color: #334155;
      margin-bottom: 2px;
      text-transform: uppercase;
      font-size: 10px;
    }

    .terms-list {
      margin: 0;
      padding-left: 18px;
    }
  </style>
</head>
<body>
  @php
    $shipping = $order->shipping_address_json ?? [];
    $billing = $order->billing_address_json ?? $shipping;
    $shippingState = $shipping['state'] ?? '';
    $isMaharashtra = str_contains(strtolower($shippingState), 'maharashtra') || str_contains(strtolower($shippingState), 'mh');
    
    // Check patient details
    $patientDetails = $order->items->first(function($item) {
        return !empty($item->patient_name) || !empty($item->health_concern);
    });
    $hasPatientDetails = !empty($patientDetails);

    // Payment Info
    $isPrepaid = strtolower($order->payment_method) !== 'cod' || $order->payment_status === 'paid';
    $paymentMethodLabel = $isPrepaid ? 'Prepaid' : 'Cash on Delivery (COD)';

    // Conditional signature logic
    $currentStatus = strtolower($order->status);
    $showSignature = $isPrepaid || $currentStatus === 'delivered' || $currentStatus === 'completed';
  @endphp

  <div class="invoice-container">
    
    <!-- 1. HEADER SECTION (Table layout instead of Flex/Grid for PDF rendering) -->
    <table style="width: 100%; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
      <tr>
        <td style="width: 60%; vertical-align: top;">
          @if(!empty($logoBase64))
            <img src="{{ $logoBase64 }}" alt="Cureza Logo" style="max-height: 48px; width: auto; margin-bottom: 8px;" />
          @else
            <img src="http://localhost:3000/logo-black.svg" alt="Cureza Logo" style="max-height: 40px; width: auto; margin-bottom: 8px;" />
          @endif
          <div class="company-details" style="font-size: 12px; line-height: 1.4; color: #475569;">
            <div class="company-title" style="font-size: 15px; font-weight: 700; color: #2d7c80; margin-bottom: 2px;">Cureza India</div>
            <div>2nd floor, Rustom Building, 204, 29,</div>
            <div>Veer Nariman Rd, Fort, Mumbai 400001</div>
            <div>Maharashtra, India</div>
            <div style="margin-top: 6px; font-weight: 600; font-size: 10px; color: #64748b;">
              GSTIN: <span style="color: #1e293b;">27ABVFA8814A1ZB</span> &nbsp;|&nbsp; 
              PAN: <span style="color: #1e293b;">ABVFA8814A</span>
            </div>
            <div style="font-size: 10px; color: #64748b;">Email: <span style="color: #1e293b;">support@cureza.in</span></div>
          </div>
        </td>
        <td style="width: 40%; text-align: right; vertical-align: top;">
          <div class="tax-invoice-badge">Tax Invoice</div>
          <div class="text-xs text-muted font-bold" style="letter-spacing: 0.5px; margin-bottom: 6px; text-transform: uppercase;">
            Original For Recipient
          </div>
          
          <div class="invoice-meta-card text-left">
            <table class="invoice-meta-table">
              <tr>
                <td class="font-semibold" style="width: 50%;">Invoice No:</td>
                <td style="width: 50%; text-align: right;" class="font-bold">WCN/26-{{ str_pad(preg_replace('/\D/', '', $order->order_number), 5, '0', STR_PAD_LEFT) }}</td>
              </tr>
              <tr>
                <td class="font-semibold">Invoice Date:</td>
                <td style="text-align: right;">{{ $order->created_at->format('d/m/Y') }}</td>
              </tr>
              <tr>
                <td class="font-semibold">Order No:</td>
                <td style="text-align: right;">#{{ $order->order_number }}</td>
              </tr>
              <tr>
                <td class="font-semibold">Order Date:</td>
                <td style="text-align: right;">{{ $order->created_at->format('d/m/Y') }}</td>
              </tr>
              <tr>
                <td class="font-semibold">Payment:</td>
                <td style="text-align: right;">{{ $paymentMethodLabel }}</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>

    <!-- 2. BILLING, SHIPPING & PATIENT ADDRESSES (Table row instead of CSS Grid) -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
      <tr>
        <!-- Billing Column -->
        <td style="width: {{ $hasPatientDetails ? '33.33%' : '50%' }}; vertical-align: top; padding-right: 10px;">
          <div class="address-card">
            <div class="address-card-title">Billing Address</div>
            <div class="font-bold" style="color: #0f172a; margin-bottom: 2px;">{{ $billing['first_name'] ?? '' }} {{ $billing['last_name'] ?? '' }}</div>
            <div>{{ $billing['street_address'] ?? '' }}</div>
            <div>{{ $billing['city'] ?? '' }} {{ $billing['postcode'] ?? '' }}</div>
            <div>{{ $billing['state'] ?? '' }}, India</div>
            @if(!empty($billing['phone']))
              <div style="margin-top: 4px; font-size: 10px;" class="text-muted">Phone: <span style="color:#1e293b; font-family: monospace;">{{ $billing['phone'] }}</span></div>
            @endif
          </div>
        </td>

        <!-- Shipping Column -->
        <td style="width: {{ $hasPatientDetails ? '33.33%' : '50%' }}; vertical-align: top; padding-right: {{ $hasPatientDetails ? '10px' : '0' }};">
          <div class="address-card">
            <div class="address-card-title">Ship To</div>
            <div class="font-bold" style="color: #0f172a; margin-bottom: 2px;">{{ $shipping['first_name'] ?? '' }} {{ $shipping['last_name'] ?? '' }}</div>
            <div>{{ $shipping['street_address'] ?? '' }}</div>
            <div>{{ $shipping['city'] ?? '' }} {{ $shipping['postcode'] ?? '' }}</div>
            <div>{{ $shipping['state'] ?? '' }}, India</div>
            @if(!empty($shipping['phone']))
              <div style="margin-top: 4px; font-size: 10px;" class="text-muted">Phone: <span style="color:#1e293b; font-family: monospace;">{{ $shipping['phone'] }}</span></div>
            @endif
          </div>
        </td>

        <!-- Patient Info Column -->
        @if($hasPatientDetails)
          <td style="width: 33.33%; vertical-align: top;">
            <div class="address-card" style="border-color: #2d7c80; background-color: #f0f9f9;">
              <div class="address-card-title" style="color: #2d7c80; border-bottom: 1.5px solid #2d7c80;">Patient &amp; Rx Details</div>
              <div style="color: #334155; line-height: 1.4;">
                <div><strong>Name:</strong> {{ $patientDetails->patient_name }}</div>
                @if(!empty($patientDetails->patient_age))
                  <div><strong>Age:</strong> {{ $patientDetails->patient_age }}</div>
                @endif
                @if(!empty($patientDetails->patient_gender))
                  <div><strong>Gender:</strong> {{ $patientDetails->patient_gender }}</div>
                @endif
                @if(!empty($patientDetails->health_concern))
                  <div><strong>Concern:</strong> {{ $patientDetails->health_concern }}</div>
                @endif
              </div>
            </div>
          </td>
        @endif
      </tr>
    </table>

    <!-- 3. ITEMS TABLE -->
    <div class="table-container">
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 5%; text-align: center;">#</th>
            <th style="width: 45%;">Items</th>
            <th style="width: 14%; text-align: center;">HSN Code</th>
            <th style="width: 8%; text-align: center;">Qty.</th>
            <th style="width: 12%; text-align: right;">Rate</th>
            <th style="width: 15%; text-align: right;">GST</th>
            <th style="width: 12%; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          @php
            $calculatedTaxableTotal = 0;
            $calculatedTaxTotal = 0;
          @endphp
          @foreach($order->items as $index => $item)
            @php
              $itemTotal = (float)$item->total;
              $gstPercent = $item->gst_slab ? (float)$item->gst_slab : 18.0;
              $divisor = ($gstPercent / 100) + 1.0;
              $taxableAmt = $itemTotal / $divisor;
              $taxAmt = $itemTotal - $taxableAmt;

              $calculatedTaxableTotal += $taxableAmt;
              $calculatedTaxTotal += $taxAmt;
              $ratePerUnit = $taxableAmt / $item->quantity;
              $hsn = $item->hsn_code ?: '33019049';
              $brandName = ($item->product && $item->product->brand) ? $item->product->brand->name : 'Cureza Verified Brand';
            @endphp
            <tr>
              <td style="text-align: center; color: #94a3b8; font-weight: bold;">{{ $index + 1 }}</td>
              <td>
                <div class="item-title">{{ $item->product_name }}</div>
                <div class="item-subtitle">{{ $brandName }}</div>
              </td>
              <td style="text-align: center; font-family: monospace;">{{ $hsn }}</td>
              <td style="text-align: center;">{{ $item->quantity }}</td>
              <td style="text-align: right;">₹{{ number_format($ratePerUnit, 2) }}</td>
              <td style="text-align: right; line-height: 1.2;">
                @if($isMaharashtra)
                  <div class="font-semibold">₹{{ number_format($taxAmt / 2, 2) }}</div>
                  <div style="font-size: 8px; color: #64748b;">CGST ({{ $gstPercent / 2 }}%)</div>
                  <div class="font-semibold" style="margin-top: 2px;">₹{{ number_format($taxAmt / 2, 2) }}</div>
                  <div style="font-size: 8px; color: #64748b;">SGST ({{ $gstPercent / 2 }}%)</div>
                @else
                  <div class="font-semibold">₹{{ number_format($taxAmt, 2) }}</div>
                  <div style="font-size: 8px; color: #64748b;">IGST ({{ $gstPercent }}%)</div>
                @endif
              </td>
              <td style="text-align: right;" class="font-bold">₹{{ number_format($itemTotal, 2) }}</td>
            </tr>
          @endforeach
        </tbody>
      </table>
    </div>

    <!-- 4. TOTALS (Table layout instead of Flex/Grid) -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
      <tr>
        <td style="width: 55%; vertical-align: top;"></td>
        <td style="width: 45%; vertical-align: top;">
          <table class="totals-table">
            <tr>
              <td>Taxable Amount</td>
              <td class="text-right font-semibold">₹{{ number_format($calculatedTaxableTotal, 2) }}</td>
            </tr>
            
            @if((float)$order->discount_amount > 0)
              <tr>
                <td style="color: #b91c1c;">Discount Applied</td>
                <td class="text-right font-semibold" style="color: #b91c1c;">-₹{{ number_format((float)$order->discount_amount, 2) }}</td>
              </tr>
            @endif
            
            <tr>
              <td>Subtotal (before Tax)</td>
              <td class="text-right font-semibold">₹{{ number_format($calculatedTaxableTotal, 2) }}</td>
            </tr>
            
            @if($isMaharashtra)
              <tr>
                <td>CGST</td>
                <td class="text-right font-semibold">₹{{ number_format($calculatedTaxTotal / 2, 2) }}</td>
              </tr>
              <tr>
                <td>SGST</td>
                <td class="text-right font-semibold">₹{{ number_format($calculatedTaxTotal / 2, 2) }}</td>
              </tr>
            @else
              <tr>
                <td>IGST</td>
                <td class="text-right font-semibold">₹{{ number_format($calculatedTaxTotal, 2) }}</td>
              </tr>
            @endif
            
            <tr>
              <td>Shipping Charge</td>
              <td class="text-right font-semibold">
                @if((float)$order->shipping_amount == 0)
                  Free
                @else
                  ₹{{ number_format((float)$order->shipping_amount, 2) }}
                @endif
              </td>
            </tr>

            <tr class="grand-total">
              <td style="padding: 6px;">Total Amount (GST Incl.)</td>
              <td class="text-right" style="padding: 6px; font-family: monospace; font-size: 13px;">₹{{ number_format((float)$order->final_amount, 2) }}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- 5. TERMS & CONDITIONS -->
    <div class="terms-box">
      <div class="terms-title">Terms &amp; Conditions</div>
      <ol class="terms-list">
        <li>Goods Once Sold Will Not Be Taken Back Or Exchanged.</li>
        <li>All Disputes Are Subject To Mumbai Jurisdiction Only.</li>
        <li>Delivery Within 10 To 15 Working Days.</li>
        <li>Products Sold Are After The Satisfaction Of The Buyer Party.</li>
        <li>Hemp Prices Are Subject To Availability.</li>
        <li>Prices Maybe Updated By The Company On Their Own Discretion.</li>
      </ol>
    </div>

    <!-- 6. SIGNATURE SECTION (Table layout instead of Flex/Grid) -->
    <table style="width: 100%; border-top: 1px solid #e2e8f0; margin-top: 15px; padding-top: 10px;">
      <tr>
        <td style="vertical-align: bottom;">
          <div style="font-size: 11px; color: #94a3b8; font-weight: 500;">Thank you for your business!</div>
          <div style="font-size: 9px; color: #cbd5e1; margin-top: 2px;">Generated dynamically via Cureza Invoice Engine.</div>
        </td>
        <td style="width: 250px; text-align: center; vertical-align: bottom;">
          <div class="text-xs font-bold" style="color: #475569; margin-bottom: 4px;">For Cureza India</div>
          
          <!-- Signature Text (Handwritten cursive Farhan) -->
          <div style="height: 45px; vertical-align: middle; margin-bottom: 2px; text-align: center;">
            @if($showSignature)
              <div class="signature-text" style="font-size: 28px; transform: rotate(-4deg); color: #2d7c80; font-family: 'Great Vibes', cursive;">Farhan</div>
            @else
              <div style="height: 42px;"></div>
            @endif
          </div>
          
          <!-- Signature Line -->
          <div style="width: 100%; border-bottom: 1px solid #94a3b8; margin: 4px 0;"></div>
          
          <div class="text-xs text-muted" style="margin-top: 2px;">Authorized Signatory</div>
        </td>
      </tr>
    </table>

  </div>

</body>
</html>
