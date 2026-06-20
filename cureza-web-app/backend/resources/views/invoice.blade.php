<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Cureza Invoice">
  <title>Invoice #{{ $order->order_number }}</title>
  <link href="https://fonts.googleapis.com/css?family=Inter&display=swap" rel="stylesheet">

  <style>
    :root {
      --font-family-inter: 'Inter', sans-serif;
      --Primary-Colors-Primary: rgba(255, 45, 70, 1);
      --Primary-Colors-Blue: rgba(35, 136, 255, 1);
      --Primary-Colors-Yellow: rgba(255, 199, 0, 1);
      --Primary-Colors-Green: rgba(99, 222, 119, 1);
      --Neutral-Colors-800: rgba(25, 33, 61, 1);
      --Neutral-Colors-700: rgba(93, 100, 129, 1);
      --Neutral-Colors-600: rgba(134, 141, 166, 1);
      --Neutral-Colors-500: rgba(168, 183, 212, 1);
      --Neutral-Colors-400: rgba(214, 220, 229, 1);
      --Neutral-Colors-300: rgba(235, 239, 246, 1);
      --Neutral-Colors-200: rgba(246, 248, 252, 1);
      --Neutral-Colors-White: rgba(255, 255, 255, 1);
      --Neutral-Colors-Black: rgba(0, 0, 0, 1);
      --Secondary-colors-Red-300: rgba(251, 147, 163, 1);
      --Secondary-colors-Red-200: rgba(250, 198, 208, 1);
      --Secondary-colors-Red-100: rgba(255, 236, 239, 1);
      --Secondary-colors-Blue-400: rgba(78, 159, 255, 1);
      --Secondary-colors-Blue-300: rgba(141, 193, 255, 1);
      --Secondary-colors-Blue-200: rgba(195, 221, 255, 1);
      --Secondary-colors-Blue-100: rgba(227, 239, 255, 1);
      --Secondary-colors-Yellow-400: rgba(254, 209, 51, 1);
      --Secondary-colors-Yellow-300: rgba(251, 224, 128, 1);
      --Secondary-colors-Yellow-200: rgba(250, 237, 191, 1);
      --Secondary-colors-Yellow-100: rgba(255, 250, 233, 1);
      --Secondary-colors-Green-400: rgba(129, 228, 146, 1);
      --Secondary-colors-Green-300: rgba(173, 236, 187, 1);
      --Secondary-colors-Green-200: rgba(211, 242, 221, 1);
      --Secondary-colors-Green-100: rgba(238, 249, 245, 1);
      --Secondary-colors-Red-400: rgba(254, 86, 107, 1);
      --Other-BRIX-Wordmark: rgba(13, 10, 44, 1);
      --text-rgb-134-141-166: rgba(134, 141, 166, 1);
      --text-rgb-25-33-61: rgba(25, 33, 61, 1);
      --text-rgb-93-100-129: rgba(93, 100, 129, 1);
      --text-rgb-35-136-255: rgba(35, 136, 255, 1);
      --text-white: rgba(255, 255, 255, 1);
    }

    .text-rgb-134-141-166 { color: var(--text-rgb-134-141-166); }
    .text-rgb-25-33-61 { color: var(--text-rgb-25-33-61); }
    .text-rgb-93-100-129 { color: var(--text-rgb-93-100-129); }
    .text-rgb-35-136-255 { color: var(--text-rgb-35-136-255); }
    .text-white { color: var(--text-white); }

    /* CSS Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100%; min-height: 100vh; overflow-x: hidden; background: #f5f5f5; padding: 20px; }
    img { max-width: 100%; height: auto; }

    .decoration-2 { flex-grow: 0; flex-shrink: 1; flex-basis: auto; background-color: var(--Primary-Colors-Blue); height: 10px; width: 100%; }
    
    .text-single-uppercase-200-regular {
      flex-grow: 0; flex-shrink: 1; flex-basis: auto; text-align: left; font-family: var(--font-family-inter);
      font-weight: normal; font-size: 10px; letter-spacing: 4%; line-height: 12px; text-decoration: none;
      text-transform: uppercase; color: var(--text-rgb-134-141-166);
    }

    .heading-5 { flex-grow: 0; flex-shrink: 1; flex-basis: auto; }

    .text-single-uppercase-100-regular {
      flex-grow: 0; flex-shrink: 1; flex-basis: auto; text-align: left; font-family: var(--font-family-inter);
      font-weight: normal; font-size: 8px; letter-spacing: 4%; line-height: 10px; text-decoration: none;
      text-transform: uppercase; color: var(--text-rgb-134-141-166);
    }

    .text-single-200-semi-bold {
      flex-grow: 0; flex-shrink: 1; flex-basis: auto; text-align: left; font-family: var(--font-family-inter);
      font-weight: 700; font-size: 10px; line-height: 14px; text-decoration: none; text-transform: none;
      color: var(--text-rgb-25-33-61);
    }

    .invoice-number { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    
    .invoice-number-8 {
      display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 6px;
      padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; width: 30%; min-width: 280px; border-radius: 8px;
    }

    .invoice-date-month, .invoice-date-day, .invoice-date-year { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; gap: 20px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    .date-wrap-14 { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; gap: 2px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }

    .issued-12 {
      display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 6px;
      padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; width: 30%; min-width: 280px;
    }

    .node-24, .node-26, .node-28 { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; gap: 20px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    .date-23 { display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 2px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; border-radius: 20px; }

    .due-date-21 {
      display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 6px;
      padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; width: 30%; min-width: 280px;
    }

    .date-7 {
      display: flex; flex-direction: row; justify-content: space-between; align-items: center; flex-wrap: wrap;
      gap: 32px; padding: 15px; flex-grow: 0; flex-shrink: 1; width: 100%;
      box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.5), 0px 2px 8px 0px rgba(0,0,0,0.5);
      background-color: var(--Neutral-Colors-White); border: 0.6px solid var(--Neutral-Colors-300); border-radius: 10px;
    }

    .invoice-details-4 { display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 8px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }

    .text-single-uppercase-200-medium {
      flex-grow: 0; flex-shrink: 1; flex-basis: auto; text-align: left; font-family: var(--font-family-inter);
      font-weight: 500; font-size: 10px; letter-spacing: 4%; line-height: 12px; text-decoration: none;
      text-transform: uppercase; color: var(--text-rgb-134-141-166);
    }

    .heading-31 { 
        display: flex; justify-content: space-between; width: 100%; padding: 0 20px;
        flex-grow: 0; flex-shrink: 1; flex-basis: auto; 
    }
    /* Adjust heading alignment to match items */
    .heading-31 p:nth-child(1) { width: 10%; text-align: left; } /* Qty */
    .heading-31 p:nth-child(2) { width: 50%; text-align: left; } /* Description */
    .heading-31 p:nth-child(3) { width: 20%; text-align: right; } /* Price */
    .heading-31 p:nth-child(4) { width: 20%; text-align: right; } /* Total */

    .invoice-currency { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; gap: 20px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    
    .cost-42, .cost-55, .cost-68, .cost-81 { display: flex; flex-direction: row; justify-content: flex-start; align-items: center; gap: 2px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    .price-46, .price-59, .price-72, .price-85 { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; gap: 2px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    
    .amounts-41, .amounts-54, .amounts-67, .amounts-80 { display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 40px; padding: 0px; flex-grow: 0; flex-shrink: 1; width: 100%; }
    .wrap-39, .wrap-52, .wrap-65, .wrap-78 { display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 32px; padding: 0px; flex-grow: 0; flex-shrink: 1; width: 100%; }
    
    .roll-37, .roll {
      display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 31px;
      padding: 16px; flex-grow: 0; flex-shrink: 1; width: 100%;
      border-bottom: 0.6px solid var(--Neutral-Colors-300);
    }
    
    /* Manual override for item alignment to match headings */
    .roll-37 > p:first-child, .roll > p:first-child { width: 50%; order: 2; } /* Description */
    .wrap-39, .wrap-52, .wrap-65, .wrap-78 { width: 50%; order: 1; display: flex; justify-content: flex-start; } /* Container for Qty, Price, Total */
    
    /* Inside wrap: Qty is first */
    .wrap-39 > p:first-child, .wrap-52 > p:first-child { width: 20%; } /* Qty */
    
    /* Amounts container (Price + Total) */
    .amounts-41, .amounts-54 { width: 80%; display: flex; justify-content: space-between; }
    .cost-42, .cost-55 { width: 50%; justify-content: flex-end; }
    .price-46, .price-59 { width: 50%; justify-content: flex-end; }

    /* Re-aligning based on user HTML structure which was: Description (Left), then Wrap (Right) containing Qty, Price, Total */
    /* User HTML: 
       <div class="roll-37">
         <p>Description</p>
         <div class="wrap-39">
           <p>Qty</p>
           <div class="amounts-41">
             <div class="cost-42">Price</div>
             <div class="price-46">Total</div>
           </div>
         </div>
       </div>
    */
    /* But the Heading is: Qty, Description, Price, Total. This implies the visual order is different from DOM order? 
       Or the user's HTML structure is: Qty (Heading 1), Desc (Heading 2)...
       Actually, in the user's HTML:
       Heading: Qty, Description, Price, Total.
       Item Row: Description (first child), Wrap (second child).
       Inside Wrap: Qty (first), Amounts (second).
       Inside Amounts: Price, Total.
       
       So visually: Description is likely on the left? No, usually Qty is small.
       Let's look at the CSS for .roll-37: justify-content: space-between.
       So Description is on far left. Wrap is on far right.
       Inside Wrap: Qty on left, Amounts on right.
       Inside Amounts: Price left, Total right.
       
       So the visual order is: Description ....................... Qty ... Price ... Total
       But the Heading says: Qty ... Description ... Price ... Total
       This is contradictory. I will trust the Item Row structure (Description first) and adjust headings to match, 
       OR I will use flex order to swap them if needed. 
       Given the user said "design is breaked", I should stick to the DOM structure they gave.
    */

    .items-36 { display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; background-color: var(--Neutral-Colors-200); border-radius: 10px; width: 100%; }
    .items-wrap-30 { display: flex; flex-direction: column; justify-content: center; align-items: flex-end; gap: 15px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; width: 100%; }

    .description-90 { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; gap: 8px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    .text-single-800-semi-bold { flex-grow: 0; flex-shrink: 1; flex-basis: auto; text-align: left; font-family: var(--font-family-inter); font-weight: 700; font-size: 24px; line-height: 28px; text-decoration: none; text-transform: none; color: var(--text-rgb-35-136-255); }
    .cost-92 { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; gap: 2px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    .total-amount-89 { display: flex; flex-direction: column; justify-content: center; align-items: flex-end; gap: 4px; padding: 0px 16px 0px 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; margin-top: 20px; }

    .text-single-100-semi-bold { flex-grow: 0; flex-shrink: 1; flex-basis: auto; text-align: left; font-family: var(--font-family-inter); font-weight: 700; font-size: 8px; line-height: 12px; text-decoration: none; text-transform: none; color: var(--text-rgb-93-100-129); }
    .text-single-100-regular { flex-grow: 1; flex-shrink: 1; flex-basis: auto; text-align: left; font-family: var(--font-family-inter); font-weight: normal; font-size: 8px; line-height: 12px; text-decoration: none; text-transform: none; color: var(--text-rgb-134-141-166); }
    .node-98 { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; padding: 0px; flex-grow: 0; flex-shrink: 1; width: 95%; }
    .terms-conditions-96 { display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 4px; padding: 12px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; border: 0.6px solid var(--Neutral-Colors-300); border-radius: 10px; margin-top: 20px; width: 100%; }

    .wrapper-3 { display: flex; flex-direction: column; justify-content: center; align-items: flex-end; gap: 24px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; width: 100%; padding: 40px; }

    .company-logotype { display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    .company-name { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    .text-single-200-regular { flex-grow: 0; flex-shrink: 1; flex-basis: auto; text-align: left; font-family: var(--font-family-inter); font-weight: normal; font-size: 10px; line-height: 14px; text-decoration: none; text-transform: none; color: var(--text-white); }
    .company-tax-number { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    .co-tax-117 { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; gap: 4px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; flex-wrap: wrap; }
    .company-logo-105 { display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 8px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    
    .left-content-101 { flex-grow: 0; flex-shrink: 1; flex-basis: auto; box-shadow: 0px 3px 12px 0px rgba(0,0,0,0.5); background-color: var(--Primary-Colors-Blue); border-radius: 20px; padding: 20px; width: 48%; }
    
    .cost-126 { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; gap: 2px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    .date-wrap-130 { display: flex; flex-direction: row; justify-content: center; align-items: center; gap: 2px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; border-radius: 20px; }
    
    .total-amount-124 { display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 4px; padding: 12px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.5), 0px 2px 8px 0px rgba(0,0,0,0.5); background-color: var(--Neutral-Colors-White); border: 0.6px solid var(--Neutral-Colors-300); border-radius: 10px; width: 100%; }
    
    .text-single-400-semi-bold { flex-grow: 1; flex-shrink: 1; flex-basis: auto; text-align: left; font-family: var(--font-family-inter); font-weight: 700; font-size: 14px; line-height: 18px; text-decoration: none; text-transform: none; color: var(--text-rgb-25-33-61); }
    .customer-name { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; padding: 0px; flex-grow: 0; flex-shrink: 1; width: 100%; }
    .node-142 { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    .customer-address { display: flex; flex-direction: row; justify-content: flex-start; align-items: flex-start; padding: 0px; flex-grow: 0; flex-shrink: 1; width: 100%; }
    .wrap-141 { display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 4px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    .costumer-information-137 { display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 4px; padding: 0px; flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
    
    .right-content-123 { display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; gap: 16px; padding: 16px; flex-grow: 1; flex-shrink: 1; flex-basis: auto; background-color: var(--Neutral-Colors-200); border-radius: 20px; width: 48%; }
    
    .head-100 { display: flex; flex-direction: row; justify-content: space-between; align-items: stretch; gap: 8px; padding: 0px; flex-grow: 0; flex-shrink: 1; width: 100%; margin-top: 20px; }
    
    .invoice-1-1 { flex-grow: 0; flex-shrink: 1; flex-basis: auto; box-shadow: 0px 10px 20px 0px rgba(0,0,0,0.5); background-color: var(--Neutral-Colors-White); border-radius: 32px; max-width: 800px; margin: 0 auto; }

    @media (max-width: 768px) {
        .head-100 { flex-direction: column; }
        .left-content-101, .right-content-123 { width: 100%; }
    }
  </style>
</head>
<body>
@php
  $firstItem = $order->items->first();
  $seller = $firstItem ? $firstItem->seller : null;
  $sellerProfile = $seller ? $seller->sellerProfile : null;
  $brandName = ($seller && $seller->brand) ? $seller->brand->name : ($seller ? $seller->name : 'Cureza Healthcare');
  $sellerAddress = $sellerProfile ? ($sellerProfile->address_line_1 . ', ' . $sellerProfile->city . ', ' . $sellerProfile->state . ' - ' . $sellerProfile->pin_code) : '54/3 Kumar Mohalla, Inside Delhi Gate, Ajmer, Rajasthan';
  $sellerGst = $sellerProfile ? $sellerProfile->gst_number : '08CZRPA3578H1ZY';
  $sellerPhone = $sellerProfile ? ($seller->phone ?? '9887860015') : '9887860015';
  $sellerEmail = $seller ? $seller->email : 'info@cureza.in';
@endphp
<div class="invoice-1-1">
<div class="decoration-2"></div>
<div class="wrapper-3">
<div class="invoice-details-4">
<div class="heading-5">
<p class="text-single-uppercase-200-regular"><span class="text-rgb-134-141-166">Invoice Details</span></p>
</div>
<div class="date-7">
<div class="invoice-number-8">
<p class="text-single-uppercase-100-regular"><span class="text-rgb-134-141-166">Invoice Number:</span></p>
<div class="invoice-number">
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">#{{ $order->order_number }}</span></p>
</div>
</div>
<div class="issued-12">
<p class="text-single-uppercase-100-regular"><span class="text-rgb-134-141-166">Issued:</span></p>
<div class="date-wrap-14">
<div class="invoice-date-month">
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">{{ $order->created_at->format('F') }}</span></p>
</div>
<div class="invoice-date-day">
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">{{ $order->created_at->format('d,') }}</span></p>
</div>
<div class="invoice-date-year">
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">{{ $order->created_at->format('Y') }}</span></p>
</div>
</div>
</div>
<div class="due-date-21">
<p class="text-single-uppercase-100-regular"><span class="text-rgb-134-141-166">Due Date:</span></p>
<div class="date-23">
<div class="node-24">
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">{{ $order->created_at->addDays(7)->format('F') }}</span></p>
</div>
<div class="node-26">
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">{{ $order->created_at->addDays(7)->format('d,') }}</span></p>
</div>
<div class="node-28">
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">{{ $order->created_at->addDays(7)->format('Y') }}</span></p>
</div>
</div>
</div>
</div>
</div>
<div class="items-wrap-30">
<div class="heading-31">
<p class="text-single-uppercase-200-medium"><span class="text-rgb-134-141-166">Description</span></p>
<p class="text-single-uppercase-200-medium"><span class="text-rgb-134-141-166">Qty</span></p>
<p class="text-single-uppercase-200-medium"><span class="text-rgb-134-141-166">Price</span></p>
<p class="text-single-uppercase-200-medium"><span class="text-rgb-134-141-166">Total</span></p>
</div>
<div class="items-36">
@foreach($order->items as $item)
<div class="roll-37">
<p class="text-single-200-semi-bold"><span class="text-rgb-93-100-129">{{ $item->product_name }}</span>
<br><span style="font-size: 8px; color: #868da6; font-weight: normal;">
@if($item->product && $item->product->sku) SKU: {{ $item->product->sku }} | @endif
GST: {{ number_format($item->gst_slab ?? 18, 0) }}% | Base: ₹{{ number_format($item->base_price ?? ($item->price / 1.18), 2) }} | Tax: ₹{{ number_format($item->gst_amount ?? ($item->price - ($item->price / 1.18)), 2) }}
</span>
</p>
<div class="wrap-39">
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">{{ $item->quantity }}</span></p>
<div class="amounts-41">
<div class="cost-42">
<div class="invoice-currency">
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">₹</span></p>
</div>
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">{{ number_format($item->price, 2) }}</span></p>
</div>
<div class="price-46">
<div class="invoice-currency">
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">₹</span></p>
</div>
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">{{ number_format($item->price * $item->quantity, 2) }}</span></p>
</div>
</div>
</div>
</div>
@endforeach

<div class="roll-37">
<p class="text-single-200-semi-bold"><span class="text-rgb-93-100-129">Shipping</span></p>
<div class="wrap-39">
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">1</span></p>
<div class="amounts-41">
<div class="cost-42">
<div class="invoice-currency">
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">₹</span></p>
</div>
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">{{ number_format($order->shipping_amount, 2) }}</span></p>
</div>
<div class="price-46">
<div class="invoice-currency">
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">₹</span></p>
</div>
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">{{ number_format($order->shipping_amount, 2) }}</span></p>
</div>
</div>
</div>
</div>

@if($order->igst > 0)
<div class="roll-37">
<p class="text-single-200-semi-bold"><span class="text-rgb-93-100-129">IGST</span></p>
<div class="wrap-39">
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">-</span></p>
<div class="amounts-41">
<div class="cost-42">
<div class="invoice-currency">
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">₹</span></p>
</div>
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">{{ number_format($order->igst, 2) }}</span></p>
</div>
<div class="price-46">
<div class="invoice-currency">
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">₹</span></p>
</div>
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">{{ number_format($order->igst, 2) }}</span></p>
</div>
</div>
</div>
</div>
@endif

@if($order->cgst > 0)
<div class="roll-37">
<p class="text-single-200-semi-bold"><span class="text-rgb-93-100-129">CGST</span></p>
<div class="wrap-39">
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">-</span></p>
<div class="amounts-41">
<div class="cost-42">
<div class="invoice-currency">
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">₹</span></p>
</div>
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">{{ number_format($order->cgst, 2) }}</span></p>
</div>
<div class="price-46">
<div class="invoice-currency">
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">₹</span></p>
</div>
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">{{ number_format($order->cgst, 2) }}</span></p>
</div>
</div>
</div>
</div>
@endif

@if($order->sgst > 0)
<div class="roll-37">
<p class="text-single-200-semi-bold"><span class="text-rgb-93-100-129">SGST</span></p>
<div class="wrap-39">
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">-</span></p>
<div class="amounts-41">
<div class="cost-42">
<div class="invoice-currency">
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">₹</span></p>
</div>
<p class="text-single-200-semi-bold"><span class="text-rgb-134-141-166">{{ number_format($order->sgst, 2) }}</span></p>
</div>
<div class="price-46">
<div class="invoice-currency">
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">₹</span></p>
</div>
<p class="text-single-200-semi-bold"><span class="text-rgb-25-33-61">{{ number_format($order->sgst, 2) }}</span></p>
</div>
</div>
</div>
</div>
@endif

</div>
</div>
<div class="total-amount-89">
<div class="description-90">
<p class="text-single-uppercase-100-regular"><span class="text-rgb-134-141-166">Total amount:</span></p>
</div>
<div class="cost-92">
<div class="invoice-currency">
<p class="text-single-800-semi-bold"><span class="text-rgb-35-136-255">₹</span></p>
</div>
<p class="text-single-800-semi-bold"><span class="text-rgb-35-136-255">{{ number_format($order->final_amount, 2) }}</span></p>
</div>
</div>
<div class="terms-conditions-96">
<p class="text-single-100-semi-bold"><span class="text-rgb-93-100-129">Terms & Conditions:</span></p>
<div class="node-98">
<p class="text-single-100-regular"><span class="text-rgb-134-141-166">Fees and payment terms will be established in the contract or agreement prior to the commencement of the project. An initial deposit will be required before any design work begins. We reserve the right to suspend or halt work in the event of non-payment.</span></p>
</div>
</div>
</div>
<div class="head-100">
<div class="left-content-101">
<div class="company-logo-105">
<div class="company-logotype">
<div class="replace-here-107">
@if(!empty($logoBase64))
<img src="{{ $logoBase64 }}" alt="Cureza Logo" style="max-height: 50px;">
@else
<div style="font-size: 24px; font-weight: bold; color: white;">CUREZA</div>
@endif
</div>
</div>
</div>
<div class="co-tax-117">
<div class="company-name">
<p class="text-single-200-semi-bold"><span class="text-white">{{ $brandName }}</span></p>
</div>
<div class="company-tax-number">
<p class="text-single-200-regular"><span class="text-white">{!! nl2br(e($sellerAddress)) !!}</span></p>
</div>
<div class="company-tax-number">
<p class="text-single-200-regular"><span class="text-white">GSTIN: {{ $sellerGst }}</span></p>
</div>
<div class="company-tax-number">
<p class="text-single-200-regular"><span class="text-white">Phone: {{ $sellerPhone }} | Email: {{ $sellerEmail }}</span></p>
</div>
</div>
</div>
<div class="right-content-123">
<div class="total-amount-124">
<p class="text-single-uppercase-100-regular"><span class="text-rgb-134-141-166">amount Due</span></p>
<div class="cost-126">
<div class="invoice-currency">
<p class="text-single-800-semi-bold"><span class="text-rgb-25-33-61">₹</span></p>
</div>
<p class="text-single-800-semi-bold"><span class="text-rgb-25-33-61">{{ number_format($order->final_amount, 2) }}</span></p>
</div>
<div class="date-wrap-130">
<div class="node-131">
<p class="text-single-100-regular"><span class="text-rgb-134-141-166">{{ $order->created_at->addDays(7)->format('F') }}</span></p>
</div>
<div class="node-133">
<p class="text-single-100-regular"><span class="text-rgb-134-141-166">{{ $order->created_at->addDays(7)->format('d,') }}</span></p>
</div>
<div class="node-135">
<p class="text-single-100-regular"><span class="text-rgb-134-141-166">{{ $order->created_at->addDays(7)->format('Y') }}</span></p>
</div>
</div>
</div>
<div class="costumer-information-137">
<p class="text-single-uppercase-100-regular"><span class="text-rgb-134-141-166">Invoice To:</span></p>
<div class="customer-name">
<p class="text-single-400-semi-bold"><span class="text-rgb-25-33-61">{{ $order->billing_address_json['first_name'] ?? '' }} {{ $order->billing_address_json['last_name'] ?? '' }}</span></p>
</div>
<div class="wrap-141">
<div class="node-142">
<p class="text-single-200-regular"><span class="text-rgb-134-141-166">{{ $order->billing_address_json['phone'] ?? '' }}</span></p>
</div>
<div class="customer-address">
<p class="text-single-200-regular"><span class="text-rgb-134-141-166">{{ $order->billing_address_json['street_address'] ?? '' }}<br>{{ $order->billing_address_json['city'] ?? '' }}, {{ $order->billing_address_json['state'] ?? '' }} - {{ $order->billing_address_json['postcode'] ?? '' }}</span></p>
</div>
</div>
</div>
</div>
</div>
</div>

</body>
</html>
