<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #{{ $order->order_number }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 14px; color: #333; line-height: 1.5; }
        .container { width: 100%; margin: 0 auto; padding: 20px; }
        .header { display: table; width: 100%; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .company-info { display: table-cell; vertical-align: top; }
        .invoice-details { display: table-cell; vertical-align: top; text-align: right; }
        .logo { max-width: 150px; margin-bottom: 10px; }
        .company-name { font-size: 24px; font-weight: bold; color: #2c3e50; }
        .invoice-title { font-size: 32px; font-weight: bold; color: #2c3e50; text-transform: uppercase; margin-bottom: 5px; }
        .bill-to { margin-bottom: 30px; display: table; width: 100%; }
        .bill-column { display: table-cell; vertical-align: top; width: 50%; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .table th { background-color: #f8f9fa; color: #2c3e50; font-weight: bold; text-align: left; padding: 12px; border-bottom: 2px solid #ddd; }
        .table td { padding: 12px; border-bottom: 1px solid #eee; vertical-align: top; }
        .table tr:last-child td { border-bottom: none; }
        .text-right { text-align: right; }
        .totals { width: 40%; margin-left: auto; }
        .totals-row { display: table; width: 100%; padding: 5px 0; }
        .totals-label { display: table-cell; width: 60%; font-weight: bold; }
        .totals-value { display: table-cell; width: 40%; text-align: right; }
        .grand-total { font-size: 18px; font-weight: bold; color: #2c3e50; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #777; font-size: 12px; }
        .status-badge { padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .paid { color: #2ecc71; background: #eafaf1; }
        .unpaid { color: #e74c3c; background: #fdedec; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-info">
                <div class="company-name">Cureza</div>
                <div>123 Health Street, Wellness City</div>
                <div>India, 560001</div>
                <div>support@cureza.com</div>
                <div>+91 98765 43210</div>
                <div>GSTIN: 29ABCDE1234F1Z5</div>
            </div>
            <div class="invoice-details">
                <div class="invoice-title">INVOICE</div>
                <div>Invoice #: <strong>INV-{{ $order->order_number }}</strong></div>
                <div>Date: {{ $order->created_at->format('d M, Y') }}</div>
                <div>Order Status: {{ ucfirst($order->status) }}</div>
                <div style="margin-top: 5px;">
                    Payment Status: 
                    <span class="status-badge {{ $order->payment_status === 'paid' ? 'paid' : 'unpaid' }}">
                        {{ strtoupper($order->payment_status) }}
                    </span>
                </div>
            </div>
        </div>

        <div class="bill-to">
            <div class="bill-column">
                <strong>Bill To:</strong><br>
                {{ $order->user ? $order->user->name : 'Guest Customer' }}<br>
                @if($order->shipping_address_json)
                    {{ $order->shipping_address_json['line'] ?? '' }}<br>
                    {{ $order->shipping_address_json['city'] ?? '' }}, {{ $order->shipping_address_json['state'] ?? '' }} - {{ $order->shipping_address_json['zip'] ?? '' }}<br>
                    {{ $order->shipping_address_json['country'] ?? '' }}<br>
                    Phone: {{ $order->shipping_address_json['phone'] ?? ($order->user->phone ?? 'N/A') }}
                @else
                    N/A
                @endif
            </div>
            <div class="bill-column text-right">
                <strong>Ship To:</strong><br>
                @if($order->shipping_address_json)
                    {{ $order->shipping_address_json['name'] ?? '' }}<br>
                    {{ $order->shipping_address_json['line'] ?? '' }}<br>
                    {{ $order->shipping_address_json['city'] ?? '' }}, {{ $order->shipping_address_json['state'] ?? '' }} - {{ $order->shipping_address_json['zip'] ?? '' }}<br>
                @else
                    Same as Billing Address
                @endif
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th style="width: 50%;">Item Description</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Qty</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>
                        <div><strong>{{ $item->product_name }}</strong></div>
                        <div style="font-size: 11px; color: #777;">
                            Sold by: {{ $item->seller ? $item->seller->name : 'Cureza' }}
                            @if(isset($item->variant_name)) | {{ $item->variant_name }} @endif
                        </div>
                    </td>
                    <td class="text-right">₹{{ number_format($item->price, 2) }}</td>
                    <td class="text-right">{{ $item->quantity }}</td>
                    <td class="text-right">₹{{ number_format($item->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <div class="totals-label">Subtotal</div>
                <div class="totals-value">₹{{ number_format($order->total_amount, 2) }}</div>
            </div>
            <div class="totals-row">
                <div class="totals-label">Tax (GST)</div>
                <div class="totals-value">₹{{ number_format($order->tax_amount, 2) }}</div>
            </div>
            <div class="totals-row">
                <div class="totals-label">Shipping</div>
                <div class="totals-value">₹{{ number_format($order->shipping_amount, 2) }}</div>
            </div>
            @if($order->discount_amount > 0)
            <div class="totals-row">
                <div class="totals-label" style="color: #2ecc71;">Discount</div>
                <div class="totals-value" style="color: #2ecc71;">-₹{{ number_format($order->discount_amount, 2) }}</div>
            </div>
            @endif
            <div class="totals-row grand-total">
                <div class="totals-label">Grand Total</div>
                <div class="totals-value">₹{{ number_format($order->final_amount, 2) }}</div>
            </div>
            <div style="text-align: right; font-size: 12px; margin-top: 5px; color: #777;">
                Payment Mode: {{ ucfirst(str_replace('_', ' ', $order->payment_method)) }}
            </div>
        </div>

        <div class="footer">
            <p>Thank you for choosing Cureza!</p>
            <p>For support, email us at support@cureza.com</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>
    </div>
</body>
</html>
