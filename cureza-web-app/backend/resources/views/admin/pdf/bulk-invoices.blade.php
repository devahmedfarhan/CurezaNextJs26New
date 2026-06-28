<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bulk Tax Invoices</title>
  <style>
    body {
      font-family: 'DejaVu Sans', sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      font-size: 11px;
      line-height: 1.35;
    }

    .invoice-page {
      page-break-after: always;
      background-color: #ffffff;
      padding: 10px;
    }

    .invoice-page:last-child {
      page-break-after: avoid;
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
    .text-xs { font-size: 9px; }
    .text-muted { color: #64748b; }
    .rupee {
      font-family: 'DejaVu Sans', sans-serif;
      font-weight: normal !important;
    }

    /* Header Section */
    .header-table {
      width: 100%;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }

    .logo-area {
      vertical-align: top;
      text-align: left;
    }

    .company-details {
      line-height: 1.4;
      font-size: 11px;
      margin-top: 6px;
    }

    .company-title {
      font-size: 18px;
      font-weight: 800;
      color: #2d7c80;
      margin-bottom: 2px;
    }

    .tax-invoice-badge {
      display: inline-block;
      background: #2d7c80;
      color: #ffffff;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 5px 12px;
      font-size: 12px;
      border-radius: 4px;
      margin-bottom: 6px;
      text-transform: uppercase;
    }

    .invoice-meta-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 10px;
      line-height: 1.4;
      width: 230px;
      margin-left: auto;
    }

    .invoice-meta-row {
      border-bottom: 1px dashed #e2e8f0;
      padding: 3px 0;
    }
    .invoice-meta-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    /* Address Grid */
    .address-table {
      width: 100%;
      margin-bottom: 12px;
    }

    .address-card-cell {
      vertical-align: top;
      padding-right: 12px;
    }

    .address-card-container {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      background-color: #ffffff;
      min-height: 110px;
      font-size: 10px;
      line-height: 1.4;
    }

    .address-card-title {
      font-weight: 700;
      color: #1e293b;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 5px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 10px;
    }

    /* Items Table */
    .table-container {
      margin-bottom: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }

    .items-table th {
      background-color: #f8fafc;
      color: #334155;
      font-weight: 700;
      padding: 6px 8px;
      border-bottom: 2px solid #e2e8f0;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.5px;
      text-align: left;
    }

    .items-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
      color: #334155;
      line-height: 1.35;
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
      font-size: 9px;
      color: #64748b;
    }

    /* Summary Layout */
    .summary-table {
      width: 100%;
      margin-bottom: 10px;
    }

    .totals-table {
      width: 280px;
      border-collapse: collapse;
      font-size: 10px;
      margin-left: auto;
    }

    .totals-table td {
      padding: 3px 6px;
      color: #475569;
    }

    .totals-table tr.grand-total {
      background-color: #f0f9f9;
      color: #2d7c80;
      font-weight: 700;
      font-size: 11px;
      border-top: 2px solid #2d7c80;
    }
    
    .totals-table tr.grand-total td {
      color: #2d7c80;
      padding: 6px;
    }

    /* Terms and Conditions */
    .terms-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 8.5px;
      color: #64748b;
      line-height: 1.3;
    }

    .terms-title {
      font-weight: 700;
      color: #334155;
      margin-bottom: 3px;
      text-transform: uppercase;
      font-size: 8.5px;
    }

    .terms-list {
      margin: 0;
      padding-left: 12px;
    }

    /* Footer & Sign Off */
    .footer-table {
      width: 100%;
      margin-top: 15px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
    }

    .signature-block {
      text-align: center;
      width: 200px;
    }

    .signature-line {
      border-bottom: 1px solid #94a3b8;
      margin: 4px auto;
      width: 100%;
    }

    .signature-text {
      font-family: 'DejaVu Sans', sans-serif;
      font-style: italic;
      font-size: 14px;
      color: #2d7c80;
      margin: 2px 0;
      font-weight: bold;
      text-align: center;
    }

    .clear {
      clear: both;
    }
  </style>
</head>
<body>
  @php
    // Determine dynamic logo loading path (loaded once before the loop)
    $logo_paths = [
        base_path('../frontend/public/logo-black-no-tagline.svg'),
        base_path('resources/views/admin/pdf/logo-black-no-tagline.svg'),
        public_path('logo-black-no-tagline.svg')
    ];
    $logo_base64 = '';
    foreach ($logo_paths as $path) {
        if (file_exists($path)) {
            $logo_content = file_get_contents($path);
            $logo_content = preg_replace('/<\?xml.*?\?>/', '', $logo_content);
            $logo_content = str_replace('opacity: 0;', 'opacity: 1;', $logo_content);
            $logo_content = str_replace('fill-opacity: 0;', 'fill-opacity: 1;', $logo_content);
            $logo_content = str_replace('stroke-dashoffset: 1500;', 'stroke-dashoffset: 0;', $logo_content);
            $logo_content = preg_replace('/animation:[^;]+;/', '', $logo_content);
            $logo_base64 = 'data:image/svg+xml;base64,' . base64_encode($logo_content);
            break;
        }
    }
  @endphp

  @foreach($orders as $index => $order)
    @php
      // Determine layout state based on patient details
      $has_patient_details = false;
      foreach($order->items as $item) {
          if (!empty($item->patient_name)) {
              $has_patient_details = true;
              break;
          }
      }
      $col_width = $has_patient_details ? '33.33%' : '50%';

      // Determine payment details
      $payment_method = 'Prepaid';
      if (strtolower($order->payment_method) === 'cod' || strpos(strtolower($order->payment_method), 'cash') !== false) {
          $payment_method = 'Cash on Delivery (COD)';
      }

      // Extract address structures
      $shipping = $order->shipping_address_json;
      $billing = $order->billing_address_json;
      
      $shipping_name = $shipping['name'] ?? trim(($shipping['first_name'] ?? '') . ' ' . ($shipping['last_name'] ?? ''));
      $shipping_line1 = $shipping['line'] ?? $shipping['street_address'] ?? '';
      $shipping_line2 = $shipping['line2'] ?? $shipping['apartment'] ?? '';
      $shipping_city = $shipping['city'] ?? '';
      $shipping_state = $shipping['state'] ?? $shipping['province'] ?? '';
      $shipping_zip = $shipping['zip'] ?? $shipping['postcode'] ?? '';
      $shipping_country = $shipping['country'] ?? 'India';
      $shipping_phone = $shipping['phone'] ?? ($order->user->phone ?? '');

      $billing_name = $billing['name'] ?? trim(($billing['first_name'] ?? '') . ' ' . ($billing['last_name'] ?? ''));
      $billing_line1 = $billing['line'] ?? $billing['street_address'] ?? '';
      $billing_line2 = $billing['line2'] ?? $billing['apartment'] ?? '';
      $billing_city = $billing['city'] ?? '';
      $billing_state = $billing['state'] ?? $billing['province'] ?? '';
      $billing_zip = $billing['zip'] ?? $billing['postcode'] ?? '';
      $billing_country = $billing['country'] ?? 'India';
      $billing_phone = $billing['phone'] ?? ($order->user->phone ?? '');
    @endphp

    <div class="invoice-page">
      
      <!-- 1. HEADER SECTION -->
      <table class="header-table">
        <tr>
          <!-- Company details -->
          <td class="logo-area" style="width: 60%;">
            @if(!empty($logo_base64))
              <img src="{{ $logo_base64 }}" style="max-height: 42px; width: auto;" alt="Cureza Logo" />
            @else
              <div class="company-title">CUREZA HEALTHCARE</div>
            @endif
            <div class="company-details">
              <div class="font-bold" style="color: #2d7c80; font-size: 12px; margin-bottom: 2px;">Cureza Healthcare Pvt. Ltd.</div>
              <div>123 Health Street, Wellness City</div>
              <div>Karnataka, India - 560001</div>
              <div style="margin-top: 4px;" class="font-semibold text-xs text-muted">
                GSTIN: <span style="color: #1e293b;">29ABCDE1234F1Z5</span> &nbsp;|&nbsp; 
                PAN: <span style="color: #1e293b;">ABCDE1234F</span>
              </div>
              <div class="text-xs text-muted">Email: <span style="color: #1e293b;">support@cureza.in</span></div>
            </div>
          </td>

          <!-- Invoice metadata card -->
          <td style="width: 40%; text-align: right; vertical-align: top;">
            <div class="tax-invoice-badge">Tax Invoice</div>
            <div class="text-xs text-muted font-bold" style="letter-spacing: 0.5px; margin-bottom: 6px; text-transform: uppercase;">
              Original For Recipient
            </div>
            
            <div class="invoice-meta-card text-left">
              <div class="invoice-meta-row">
                <span class="font-semibold">Invoice No:</span>
                <span style="float: right;">INV-{{ $order->order_number }}</span>
                <div class="clear"></div>
              </div>
              <div class="invoice-meta-row">
                <span class="font-semibold">Invoice Date:</span>
                <span style="float: right;">{{ $order->created_at->format('d/m/Y') }}</span>
                <div class="clear"></div>
              </div>
              <div class="invoice-meta-row">
                <span class="font-semibold">Order No:</span>
                <span style="float: right;">#{{ $order->order_number }}</span>
                <div class="clear"></div>
              </div>
              <div class="invoice-meta-row">
                <span class="font-semibold">Order Date:</span>
                <span style="float: right;">{{ $order->created_at->format('d/m/Y') }}</span>
                <div class="clear"></div>
              </div>
              <div class="invoice-meta-row">
                <span class="font-semibold">Payment Method:</span>
                <span style="float: right;">{{ $payment_method }}</span>
                <div class="clear"></div>
              </div>
            </div>
          </td>
        </tr>
      </table>

      <!-- 2. BILLING & SHIPPING & PATIENT ADDRESSES -->
      <table class="address-table">
        <tr>
          <!-- Billing Card -->
          <td class="address-card-cell" style="width: {{ $col_width }};">
            <div class="address-card-container">
              <div class="address-card-title">
                Billing Address
              </div>
              @if($billing)
                <div class="font-bold" style="color: #0f172a; margin-bottom: 4px;">{{ $billing_name }}</div>
                <div>{{ $billing_line1 }}</div>
                @if(!empty($billing_line2))
                  <div>{{ $billing_line2 }}</div>
                @endif
                <div>{{ $billing_city }} {{ $billing_zip }}</div>
                <div>{{ $billing_state }}, {{ $billing_country }}</div>
                @if(!empty($billing_phone))
                  <div style="margin-top: 4px;" class="text-xs text-muted">Phone: <span style="color:#1e293b;">{{ $billing_phone }}</span></div>
                @endif
              @else
                <div class="text-muted">No billing address specified.</div>
              @endif
            </div>
          </td>

          <!-- Shipping Card -->
          <td class="address-card-cell" style="width: {{ $col_width }};">
            <div class="address-card-container">
              <div class="address-card-title">
                Ship To
              </div>
              @if($shipping)
                <div class="font-bold" style="color: #0f172a; margin-bottom: 4px;">{{ $shipping_name }}</div>
                <div>{{ $shipping_line1 }}</div>
                @if(!empty($shipping_line2))
                  <div>{{ $shipping_line2 }}</div>
                @endif
                <div>{{ $shipping_city }} {{ $shipping_zip }}</div>
                <div>{{ $shipping_state }}, {{ $shipping_country }}</div>
                @if(!empty($shipping_phone))
                  <div style="margin-top: 4px;" class="text-xs text-muted">Phone: <span style="color:#1e293b;">{{ $shipping_phone }}</span></div>
                @endif
              @else
                <div class="text-muted">Same as Billing Address</div>
              @endif
            </div>
          </td>

          <!-- Patient details (conditional) -->
          @if($has_patient_details)
          <td class="address-card-cell" style="width: {{ $col_width }}; padding-right: 0;">
            <div class="address-card-container" style="border-color: #2d7c80; background-color: #f0f9f9;">
              <div class="address-card-title" style="color: #2d7c80; border-bottom: 1.5px solid #2d7c80;">
                Patient &amp; Rx Details
              </div>
              
              @php $printed_patients = []; @endphp
              @foreach($order->items as $item)
                @if(!empty($item->patient_name))
                  @php 
                    $patient_key = trim(strtolower($item->patient_name)) . '_' . $item->patient_age;
                  @endphp
                  @if(!in_array($patient_key, $printed_patients))
                    <div style="margin-bottom: 4px;">
                      <strong>Patient:</strong> {{ $item->patient_name }} ({{ $item->patient_age }} Y / {{ ucfirst($item->patient_gender) }})
                    </div>
                    @if(!empty($item->health_concern))
                      <div style="margin-bottom: 4px;">
                        <strong>Concern:</strong> {{ $item->health_concern }}
                      </div>
                    @endif
                    @if($item->doctor)
                      <div style="margin-bottom: 4px;">
                        <strong>Ref Doctor:</strong> Dr. {{ $item->doctor->name }}
                      </div>
                    @endif
                    @if(!empty($item->prescription_path))
                      <div style="margin-bottom: 4px;">
                        <strong>Rx Presc:</strong> <span style="color: #2d7c80; font-weight: bold; text-decoration: underline;">Uploaded File</span>
                      </div>
                    @endif
                    @php $printed_patients[] = $patient_key; @endphp
                  @endif
                @endif
              @endforeach
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
              <th style="width: 4%; text-align: center;">#</th>
              <th style="width: 42%;">Items</th>
              <th style="width: 14%; text-align: center;">HSN Code</th>
              <th style="width: 8%; text-align: center;">Qty.</th>
              <th style="width: 12%; text-align: right;">Rate</th>
              <th style="width: 10%; text-align: right;">GST</th>
              <th style="width: 10%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            @php
              $taxable_subtotal = 0;
            @endphp
            
            @foreach($order->items as $item_index => $item)
              @php
                // Dynamic GST calculations
                $item_slab = $item->gst_slab ?? 18;
                $item_base = $item->base_price ?? ($item->total / (1 + ($item_slab / 100)));
                $taxable_subtotal += $item_base;
                $unit_rate = $item_base / $item->quantity;
                
                $item_tax = $item->gst_amount ?? ($item->total - $item_base);
                $item_cgst = $item->cgst;
                $item_sgst = $item->sgst;
                $item_igst = $item->igst;
                
                // Fallback splits if fields are blank
                if ($item_cgst == 0 && $item_sgst == 0 && $item_igst == 0 && $item_tax > 0) {
                    if ($order->cgst > 0 || $order->sgst > 0) {
                        $item_cgst = $item_tax / 2;
                        $item_sgst = $item_tax / 2;
                    } else {
                        $item_igst = $item_tax;
                    }
                }

                // Prescription required logic
                $requires_rx = ($item->product && $item->product->is_prescription_required) || !empty($item->prescription_path) || !empty($item->patient_name);
              @endphp
              <tr>
                <td style="text-align: center; color: #64748b; vertical-align: middle;">{{ $item_index + 1 }}</td>
                <td>
                  <div class="item-title">
                    {{ $item->product_name }}
                    @if($requires_rx)
                      <span style="background-color: #fee2e2; color: #ef4444; border: 1px solid #fca5a5; padding: 1px 4px; font-size: 8.5px; border-radius: 3px; font-weight: bold; margin-left: 4px; display: inline-block; vertical-align: middle;">Rx</span>
                    @endif
                  </div>
                  <div class="item-subtitle">
                    @if($item->product && $item->product->sku)
                      SKU: {{ $item->product->sku }}
                    @endif
                    @if($item->seller)
                      &nbsp;|&nbsp; Seller: {{ $item->seller->name }}
                    @endif
                  </div>
                </td>
                <td style="text-align: center; vertical-align: middle;">{{ $item->hsn_code ?? '30049011' }}</td>
                <td style="text-align: center; vertical-align: middle;">{{ $item->quantity }}</td>
                <td style="text-align: right; vertical-align: middle;"><span class="rupee">&#8377;</span>{{ number_format($unit_rate, 2) }}</td>
                <td style="text-align: right; vertical-align: middle;">
                  @if($item_cgst > 0 || $item_sgst > 0)
                    <div class="font-semibold"><span class="rupee">&#8377;</span>{{ number_format($item_cgst, 2) }}</div>
                    <div class="text-xs text-muted" style="font-size: 8px; line-height: 1.1; margin-bottom: 2px;">CGST ({{ number_format($item_slab / 2, 1) }}%)</div>
                    <div class="font-semibold"><span class="rupee">&#8377;</span>{{ number_format($item_sgst, 2) }}</div>
                    <div class="text-xs text-muted" style="font-size: 8px; line-height: 1.1;">SGST ({{ number_format($item_slab / 2, 1) }}%)</div>
                  @else
                    <div class="font-semibold"><span class="rupee">&#8377;</span>{{ number_format($item_igst, 2) }}</div>
                    <div class="text-xs text-muted" style="font-size: 8px; line-height: 1.1; margin-bottom: 2px;">IGST ({{ number_format($item_slab, 1) }}%)</div>
                  @endif
                </td>
                <td style="text-align: right; vertical-align: middle;" class="font-semibold"><span class="rupee">&#8377;</span>{{ number_format($item->total, 2) }}</td>
              </tr>
            @endforeach
          </tbody>
        </table>
      </div>

      <!-- 4. TOTALS & SUMMARY -->
      <table class="summary-table">
        <tr>
          <!-- Left spacer -->
          <td style="width: 50%;"></td>
          <!-- Right summary card -->
          <td style="width: 50%;">
            <table class="totals-table">
              <tr>
                <td>Taxable Amount</td>
                <td class="text-right font-semibold"><span class="rupee">&#8377;</span>{{ number_format($taxable_subtotal, 2) }}</td>
              </tr>
              
              @if($order->discount_amount > 0)
                <tr>
                  <td style="color: #b91c1c;">Discount Applied</td>
                  <td class="text-right font-semibold" style="color: #b91c1c;">-<span class="rupee">&#8377;</span>{{ number_format($order->discount_amount, 2) }}</td>
                </tr>
              @endif
              
              <tr>
                <td>Subtotal (before Tax)</td>
                <td class="text-right font-semibold"><span class="rupee">&#8377;</span>{{ number_format($taxable_subtotal, 2) }}</td>
              </tr>
              
              <!-- GST Line splits -->
              @if($order->cgst > 0 || $order->sgst > 0)
                <tr>
                  <td>CGST</td>
                  <td class="text-right font-semibold"><span class="rupee">&#8377;</span>{{ number_format($order->cgst, 2) }}</td>
                </tr>
                <tr>
                  <td>SGST</td>
                  <td class="text-right font-semibold"><span class="rupee">&#8377;</span>{{ number_format($order->sgst, 2) }}</td>
                </tr>
              @else
                <tr>
                  <td>IGST</td>
                  <td class="text-right font-semibold"><span class="rupee">&#8377;</span>{{ number_format($order->igst, 2) }}</td>
                </tr>
              @endif
              
              <tr>
                <td>Shipping Charge</td>
                <td class="text-right font-semibold">
                  @if($order->shipping_amount == 0)
                    Free
                  @else
                    <span class="rupee">&#8377;</span>{{ number_format($order->shipping_amount, 2) }}
                  @endif
                </td>
              </tr>

              <tr class="grand-total">
                <td>Total Amount (GST Incl.)</td>
                <td class="text-right"><span class="rupee">&#8377;</span>{{ number_format($order->final_amount, 2) }}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- 5. TERMS & CONDITIONS -->
      <div class="terms-box">
        <div class="terms-title">Terms &amp; Conditions</div>
        <ol class="terms-list">
          <li>Goods once sold will not be taken back or exchanged unless defective.</li>
          <li>All disputes are subject to Mumbai Jurisdiction only.</li>
          <li>Prescription required products are verified by registered medical practitioners.</li>
          <li>Products sold are after the satisfaction of the buyer party.</li>
          <li>Prices are subject to update by the company at its own discretion.</li>
        </ol>
      </div>

      <!-- 6. SIGNATURE SECTION -->
      <table class="footer-table">
        <tr>
          <td style="width: 60%; vertical-align: bottom;">
            <div style="font-size: 10px; color: #94a3b8; font-weight: 500;">Thank you for your business!</div>
            <div style="font-size: 9px; color: #cbd5e1; margin-top: 3px;">Generated dynamically via Cureza Order System.</div>
          </td>
          <td style="width: 40%; text-align: right; vertical-align: bottom;">
            <div class="signature-block" style="float: right;">
              <div class="text-xs font-bold" style="color: #475569; margin-bottom: 6px;">For Cureza Healthcare</div>
              
              <!-- Signature Image (ONLY rendered when order is Prepaid) -->
              <div style="height: 40px; text-align: center; vertical-align: middle; margin-bottom: 2px;">
                @if(strtolower($order->payment_method) !== 'cod')
                  <div class="signature-text">Cureza Admin</div>
                @else
                  <!-- Signature placeholder space for COD orders -->
                  <div style="height: 40px;"></div>
                @endif
              </div>
              
              <!-- Signature Line -->
              <div class="signature-line"></div>
              
              <div class="text-xs text-muted" style="margin-top: 2px; text-align: center;">Authorized Signatory</div>
            </div>
            <div class="clear"></div>
          </td>
        </tr>
      </table>

    </div>
  @endforeach

</body>
</html>
