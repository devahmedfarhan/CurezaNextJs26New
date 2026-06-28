<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Shipping Label - {{ $order->order_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: white;
        }
        .label-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }
        .section {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
        }
        .section-title {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            text-transform: uppercase;
            color: #333;
        }
        .info-row {
            margin: 8px 0;
            font-size: 14px;
        }
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
        }
        .barcode {
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .barcode-number {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 3px;
            font-family: 'Courier New', monospace;
        }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        @media print {
            body {
                padding: 0;
            }
            .label-container {
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="label-container">
        <div class="header">
            <h1>SHIPPING LABEL</h1>
            <p>Cureza - Ayurvedic Marketplace</p>
        </div>

        <div class="barcode">
            <div class="barcode-number">{{ $order->order_number }}</div>
            <p style="margin-top: 10px; font-size: 12px;">Order Number</p>
        </div>

        <div class="grid">
            <!-- Ship From -->
            <div class="section">
                <div class="section-title">Ship From (Seller)</div>
                @php
                    $sellerAddress = $order->items->first()->product->seller->seller_profile ?? null;
                @endphp
                @if($sellerAddress)
                    <div class="info-row">
                        <span class="info-label">Name:</span>
                        {{ $sellerAddress->brand_name ?? 'N/A' }}
                    </div>
                    <div class="info-row">
                        <span class="info-label">Address:</span>
                        {{ $sellerAddress->address ?? 'N/A' }}
                    </div>
                    <div class="info-row">
                        <span class="info-label">City:</span>
                        {{ $sellerAddress->city ?? 'N/A' }}
                    </div>
                    <div class="info-row">
                        <span class="info-label">State:</span>
                        {{ $sellerAddress->state ?? 'N/A' }}
                    </div>
                    <div class="info-row">
                        <span class="info-label">PIN:</span>
                        {{ $sellerAddress->pincode ?? 'N/A' }}
                    </div>
                    <div class="info-row">
                        <span class="info-label">Phone:</span>
                        {{ $sellerAddress->phone ?? 'N/A' }}
                    </div>
                @else
                    <p>Seller address not available</p>
                @endif
            </div>

            <!-- Ship To -->
            <div class="section">
                <div class="section-title">Ship To (Customer)</div>
                @php
                    $shipping = $order->shipping_address_json;
                @endphp
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    {{ $shipping['name'] ?? 'N/A' }}
                </div>
                <div class="info-row">
                    <span class="info-label">Address:</span>
                    {{ $shipping['address'] ?? 'N/A' }}
                </div>
                <div class="info-row">
                    <span class="info-label">City:</span>
                    {{ $shipping['city'] ?? 'N/A' }}
                </div>
                <div class="info-row">
                    <span class="info-label">State:</span>
                    {{ $shipping['state'] ?? 'N/A' }}
                </div>
                <div class="info-row">
                    <span class="info-label">PIN:</span>
                    {{ $shipping['pincode'] ?? 'N/A' }}
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    {{ $shipping['phone'] ?? $order->user->phone ?? 'N/A' }}
                </div>
            </div>
        </div>

        <!-- Package Details -->
        <div class="section">
            <div class="section-title">Package Details</div>
            <div class="info-row">
                <span class="info-label">Order Date:</span>
                {{ $order->created_at->format('d M Y, h:i A') }}
            </div>
            <div class="info-row">
                <span class="info-label">Total Items:</span>
                {{ $order->items->sum('quantity') }}
            </div>
            <div class="info-row">
                <span class="info-label">Payment Method:</span>
                {{ strtoupper($order->payment_method) }}
            </div>
            <div class="info-row">
                <span class="info-label">Payment Status:</span>
                {{ ucfirst($order->payment_status) }}
            </div>
        </div>

        <!-- Items List -->
        <div class="section">
            <div class="section-title">Items in Package</div>
            @foreach($order->items as $item)
                <div class="info-row">
                    • {{ $item->product_name }} (Qty: {{ $item->quantity }})
                </div>
            @endforeach
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>This is a computer-generated shipping label. No signature required.</p>
            <p>For support, contact: support@cureza.in</p>
        </div>
    </div>
</body>
</html>
