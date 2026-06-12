<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bulk Invoices - {{ count($orders) }} Orders</title>
    <style>
        @media print {
            .page-break {
                page-break-after: always;
            }
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        .invoice {
            max-width: 800px;
            margin: 0 auto 40px;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .page-break {
            margin-bottom: 40px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .logo img {
            max-width: 150px;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h1 {
            font-size: 32px;
            color: #333;
        }
        .invoice-number {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        .addresses {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        .address-block h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        .address-block p {
            margin: 5px 0;
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background: #f5f5f5;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            border-bottom: 2px solid #ddd;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #eee;
            font-size: 14px;
        }
        .text-right {
            text-align: right;
        }
        .totals {
            margin-top: 20px;
            text-align: right;
        }
        .totals table {
            margin-left: auto;
            width: 300px;
        }
        .totals td {
            padding: 8px;
        }
        .totals .grand-total {
            font-size: 18px;
            font-weight: bold;
            background: #f5f5f5;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    @foreach($orders as $index => $order)
    <div class="invoice {{ $index < count($orders) - 1 ? 'page-break' : '' }}">
        <div class="header">
            <div class="logo">
                @if($logoBase64)
                    <img src="{{ $logoBase64 }}" alt="Cureza Logo">
                @else
                    <h2>Cureza</h2>
                @endif
            </div>
            <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="invoice-number">{{ $order->order_number }}</div>
                <div class="invoice-number">{{ $order->created_at->format('d M Y') }}</div>
            </div>
        </div>

        <div class="addresses">
            <div class="address-block">
                <h3>Bill To:</h3>
                @php $billing = $order->billing_address_json; @endphp
                <p><strong>{{ $billing['name'] ?? 'N/A' }}</strong></p>
                <p>{{ $billing['address'] ?? '' }}</p>
                <p>{{ $billing['city'] ?? '' }}, {{ $billing['state'] ?? '' }} {{ $billing['pincode'] ?? '' }}</p>
                <p>{{ $billing['phone'] ?? $order->user->phone ?? '' }}</p>
            </div>

            <div class="address-block">
                <h3>Ship To:</h3>
                @php $shipping = $order->shipping_address_json; @endphp
                <p><strong>{{ $shipping['name'] ?? 'N/A' }}</strong></p>
                <p>{{ $shipping['address'] ?? '' }}</p>
                <p>{{ $shipping['city'] ?? '' }}, {{ $shipping['state'] ?? '' }} {{ $shipping['pincode'] ?? '' }}</p>
                <p>{{ $shipping['phone'] ?? $order->user->phone ?? '' }}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->product_name }}</td>
                    <td class="text-right">{{ $item->quantity }}</td>
                    <td class="text-right">₹{{ number_format($item->price, 2) }}</td>
                    <td class="text-right">₹{{ number_format($item->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-right">₹{{ number_format($order->total_amount, 2) }}</td>
                </tr>
                <tr>
                    <td>Shipping:</td>
                    <td class="text-right">₹{{ number_format($order->shipping_amount, 2) }}</td>
                </tr>
                <tr>
                    <td>Tax (GST):</td>
                    <td class="text-right">₹{{ number_format($order->tax_amount, 2) }}</td>
                </tr>
                <tr class="grand-total">
                    <td><strong>Grand Total:</strong></td>
                    <td class="text-right"><strong>₹{{ number_format($order->final_amount, 2) }}</strong></td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>For support, contact: support@cureza.com</p>
        </div>
    </div>
    @endforeach
</body>
</html>
