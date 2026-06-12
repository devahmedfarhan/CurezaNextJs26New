export default function ReturnsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-charcoal mb-8">Cancellation & Returns Policy</h1>
            <div className="prose prose-green max-w-none text-gray-700">
                <h3>Cancellation Policy</h3>
                <p>You can cancel your order anytime before it has been shipped. Once shipped, the order cannot be cancelled but can be returned if eligible.</p>

                <h3>Return Policy</h3>
                <p>We accept returns within 7 days of delivery for damaged, defective, or incorrect items. Personal care items are non-returnable due to hygiene reasons.</p>

                <h3>Refund Process</h3>
                <p>Refunds are processed within 5-7 business days after the returned item is received and verified at our warehouse.</p>
            </div>
        </div>
    );
}
