<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NotificationTemplate;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            // ORDER FLOW
            [
                'name' => 'Order Placed (Email)',
                'code' => 'order_placed_email',
                'flow' => 'order',
                'channel' => 'email',
                'subject' => 'Order #{{order_id}} Placed Successfully!',
                'content' => $this->getEmailHeader() . '
                <h2 style="color: #052326; margin-top: 0;">Order Confirmed!</h2>
                <p>Hello <strong>{{customer_name}}</strong>,</p>
                <p>Thank you for shopping with Cureza. Your order has been placed successfully and is being processed.</p>
                
                <div style="background-color: #F8F3EF; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> #{{order_id}}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Total Amount:</strong> ₹{{order_amount}}</p>
                    <p style="margin: 0;"><strong>Payment Status:</strong> {{payment_status}}</p>
                </div>

                <p>You can track your shipment and view order history details by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{tracking_link}}" style="background-color: #16A34A; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Your Order</a>
                </div>
                ' . $this->getEmailFooter(),
                'trigger_type' => 'event',
                'status' => 'active',
                'variables' => ['customer_name', 'order_id', 'order_amount', 'payment_status', 'tracking_link'],
            ],
            [
                'name' => 'Order Placed (WhatsApp)',
                'code' => 'order_placed_whatsapp',
                'flow' => 'order',
                'channel' => 'whatsapp',
                'subject' => null,
                'content' => 'Hello {{customer_name}},

Your order *#{{order_id}}* of amount *₹{{order_amount}}* has been placed successfully at Cureza! 🎉

You can track your order here: {{tracking_link}}

Thank you for choosing Cureza for your wellness journey!',
                'trigger_type' => 'event',
                'status' => 'active',
                'whatsapp_template_name' => 'order_placed_v1',
                'whatsapp_status' => 'approved',
                'variables' => ['customer_name', 'order_id', 'order_amount', 'tracking_link'],
            ],
            [
                'name' => 'Order Shipped (Email)',
                'code' => 'order_shipped_email',
                'flow' => 'order',
                'channel' => 'email',
                'subject' => 'Your order #{{order_id}} has been shipped!',
                'content' => $this->getEmailHeader() . '
                <h2 style="color: #052326; margin-top: 0;">On the Way!</h2>
                <p>Hi <strong>{{customer_name}}</strong>,</p>
                <p>Exciting news! Your order <strong>#{{order_id}}</strong> has been handed over to our delivery partner and is on its way to you.</p>
                
                <div style="background-color: #F8F3EF; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Shipping Partner:</strong> {{carrier}}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Tracking ID:</strong> {{tracking_number}}</p>
                    <p style="margin: 0;"><strong>Estimated Delivery:</strong> {{est_delivery_date}}</p>
                </div>

                <p>Track your shipment in real-time:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{tracking_link}}" style="background-color: #16A34A; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Shipment</a>
                </div>
                ' . $this->getEmailFooter(),
                'trigger_type' => 'event',
                'status' => 'active',
                'variables' => ['customer_name', 'order_id', 'carrier', 'tracking_number', 'est_delivery_date', 'tracking_link'],
            ],
            [
                'name' => 'Order Shipped (WhatsApp)',
                'code' => 'order_shipped_whatsapp',
                'flow' => 'order',
                'channel' => 'whatsapp',
                'subject' => null,
                'content' => 'Hi {{customer_name}},

Good news! Your order *#{{order_id}}* has been shipped via *{{carrier}}*.
Tracking Number: *{{tracking_number}}*

Track your package live: {{tracking_link}}

It will be delivered to your address soon! 📦',
                'trigger_type' => 'event',
                'status' => 'active',
                'whatsapp_template_name' => 'order_shipped_v1',
                'whatsapp_status' => 'approved',
                'variables' => ['customer_name', 'order_id', 'carrier', 'tracking_number', 'tracking_link'],
            ],
            [
                'name' => 'Order Delivered (Email)',
                'code' => 'order_delivered_email',
                'flow' => 'order',
                'channel' => 'email',
                'subject' => 'Your Cureza order #{{order_id}} has been delivered!',
                'content' => $this->getEmailHeader() . '
                <h2 style="color: #052326; margin-top: 0;">Delivered!</h2>
                <p>Hello <strong>{{customer_name}}</strong>,</p>
                <p>Your order <strong>#{{order_id}}</strong> has been successfully delivered to your address.</p>
                
                <p>We hope you love your wellness purchase. We would appreciate it if you could share your experience and write a review.</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{review_link}}" style="background-color: #052326; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Write Product Review</a>
                </div>
                ' . $this->getEmailFooter(),
                'trigger_type' => 'event',
                'status' => 'active',
                'variables' => ['customer_name', 'order_id', 'review_link'],
            ],
            [
                'name' => 'Order Delivered (WhatsApp)',
                'code' => 'order_delivered_whatsapp',
                'flow' => 'order',
                'channel' => 'whatsapp',
                'subject' => null,
                'content' => 'Hello {{customer_name}},

Your order *#{{order_id}}* has been delivered! 🚚

We hope you are satisfied with your products. Please share your valuable review with us here: {{review_link}}

Have a wonderful and healthy day ahead!',
                'trigger_type' => 'event',
                'status' => 'active',
                'whatsapp_template_name' => 'order_delivered_v1',
                'whatsapp_status' => 'approved',
                'variables' => ['customer_name', 'order_id', 'review_link'],
            ],

            // ABANDONED CART FLOW
            [
                'name' => 'Abandoned Cart Reminder 1 (Email)',
                'code' => 'abandoned_cart_email_1',
                'flow' => 'abandoned_cart',
                'channel' => 'email',
                'subject' => 'Did you leave something behind?',
                'content' => $this->getEmailHeader() . '
                <h2 style="color: #052326; margin-top: 0;">Don\'t miss out!</h2>
                <p>Hello <strong>{{customer_name}}</strong>,</p>
                <p>We noticed you added some premium wellness items to your cart but didn\'t finish checking out.</p>
                
                <p>Your items are still reserved for a limited time. Re-examine your cart and complete your order to secure your wellness favorites:</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{cart_link}}" style="background-color: #16A34A; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Your Order</a>
                </div>
                ' . $this->getEmailFooter(),
                'trigger_type' => 'delay',
                'delay_value' => 1,
                'delay_unit' => 'hours',
                'status' => 'active',
                'variables' => ['customer_name', 'cart_link'],
            ],
            [
                'name' => 'Abandoned Cart Reminder 1 (WhatsApp)',
                'code' => 'abandoned_cart_whatsapp_1',
                'flow' => 'abandoned_cart',
                'channel' => 'whatsapp',
                'subject' => null,
                'content' => 'Hi {{customer_name}},

We noticed you left some wellness items in your cart. 🛒

Complete your purchase now and take the first step towards a healthier you! Click here to complete your order: {{cart_link}}',
                'trigger_type' => 'delay',
                'delay_value' => 1,
                'delay_unit' => 'hours',
                'status' => 'active',
                'whatsapp_template_name' => 'cart_reminder_1',
                'whatsapp_status' => 'approved',
                'variables' => ['customer_name', 'cart_link'],
            ],
            [
                'name' => 'Abandoned Cart Reminder 2 (Email)',
                'code' => 'abandoned_cart_email_2',
                'flow' => 'abandoned_cart',
                'channel' => 'email',
                'subject' => 'Your cart is waiting - Get 10% OFF!',
                'content' => $this->getEmailHeader() . '
                <h2 style="color: #052326; margin-top: 0;">An exclusive offer for you!</h2>
                <p>Hi <strong>{{customer_name}}</strong>,</p>
                <p>We really want you to experience Cureza\'s wellness formulas. To help you decide, we have applied a special <strong>10% discount</strong> to your cart!</p>
                
                <div style="background-color: #F8F3EF; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; font-size: 18px; color: #052326;">Use Coupon Code: <strong>CUREZA10</strong></p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{cart_link}}" style="background-color: #16A34A; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Claim 10% OFF & Checkout</a>
                </div>
                <p style="font-size: 12px; color: #888; text-align: center;">Note: This coupon code expires in 48 hours.</p>
                ' . $this->getEmailFooter(),
                'trigger_type' => 'delay',
                'delay_value' => 24,
                'delay_unit' => 'hours',
                'status' => 'active',
                'variables' => ['customer_name', 'cart_link'],
            ],
            [
                'name' => 'Abandoned Cart Reminder 2 (WhatsApp)',
                'code' => 'abandoned_cart_whatsapp_2',
                'flow' => 'abandoned_cart',
                'channel' => 'whatsapp',
                'subject' => null,
                'content' => 'Hi {{customer_name}},

Your cart is still waiting! We have unlocked a special *10% OFF* code for you. 🎁

Use code: *CUREZA10*
Click here to apply discount and checkout: {{cart_link}}

Note: Code valid for a limited time.',
                'trigger_type' => 'delay',
                'delay_value' => 24,
                'delay_unit' => 'hours',
                'status' => 'active',
                'whatsapp_template_name' => 'cart_reminder_discount',
                'whatsapp_status' => 'approved',
                'variables' => ['customer_name', 'cart_link'],
            ],

            // RESTOCK FLOW
            [
                'name' => 'Product Restocked (Email)',
                'code' => 'product_restocked_email',
                'flow' => 'restock',
                'channel' => 'email',
                'subject' => 'Back In Stock: {{product_name}} is ready!',
                'content' => $this->getEmailHeader() . '
                <h2 style="color: #052326; margin-top: 0;">It\'s Back!</h2>
                <p>Hello <strong>{{customer_name}}</strong>,</p>
                <p>Good news! The product you registered interest in, <strong>{{product_name}}</strong>, is now back in stock and ready to order.</p>
                
                <p>Stock is limited and items sell out fast. Grab yours today before it runs out again:</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{product_link}}" style="background-color: #16A34A; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Order Now</a>
                </div>
                ' . $this->getEmailFooter(),
                'trigger_type' => 'event',
                'status' => 'active',
                'variables' => ['customer_name', 'product_name', 'product_link'],
            ],
            [
                'name' => 'Product Restocked (WhatsApp)',
                'code' => 'product_restocked_whatsapp',
                'flow' => 'restock',
                'channel' => 'whatsapp',
                'subject' => null,
                'content' => 'Great news {{customer_name}}! 😍

The product you were waiting for, *{{product_name}}*, is back in stock at Cureza!

Order it now before it runs out of stock again: {{product_link}}',
                'trigger_type' => 'event',
                'status' => 'active',
                'whatsapp_template_name' => 'product_restocked_v1',
                'whatsapp_status' => 'approved',
                'variables' => ['customer_name', 'product_name', 'product_link'],
            ],

            // REMINDER FLOW
            [
                'name' => 'Review Reminder (Email)',
                'code' => 'review_reminder_email',
                'flow' => 'reminder',
                'channel' => 'email',
                'subject' => 'How are you liking your new products?',
                'content' => $this->getEmailHeader() . '
                <h2 style="color: #052326; margin-top: 0;">We value your opinion</h2>
                <p>Hi <strong>{{customer_name}}</strong>,</p>
                <p>It has been a few days since your Cureza order arrived. We hope you are enjoying your new products!</p>
                
                <p>Your feedback helps other members of our community make informed wellness choices. Could you spare 2 minutes to write a quick review?</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{review_link}}" style="background-color: #052326; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Leave a Review</a>
                </div>
                ' . $this->getEmailFooter(),
                'trigger_type' => 'delay',
                'delay_value' => 3,
                'delay_unit' => 'days',
                'status' => 'active',
                'variables' => ['customer_name', 'review_link'],
            ],
            [
                'name' => 'Review Reminder (WhatsApp)',
                'code' => 'review_reminder_whatsapp',
                'flow' => 'reminder',
                'channel' => 'whatsapp',
                'subject' => null,
                'content' => 'Hi {{customer_name}},

We hope you are enjoying your wellness items from Cureza! 😊

Could you take a minute to leave a review and share your experience? It helps us and other members of our health community! 

Leave review here: {{review_link}}

Thank you!',
                'trigger_type' => 'delay',
                'delay_value' => 3,
                'delay_unit' => 'days',
                'status' => 'active',
                'whatsapp_template_name' => 'review_request_v1',
                'whatsapp_status' => 'approved',
                'variables' => ['customer_name', 'review_link'],
            ],
            [
                'name' => 'Repeat Purchase Reminder (Email)',
                'code' => 'replenish_reminder_email',
                'flow' => 'reminder',
                'channel' => 'email',
                'subject' => 'Time to replenish your wellness products!',
                'content' => $this->getEmailHeader() . '
                <h2 style="color: #052326; margin-top: 0;">Never run low!</h2>
                <p>Hello <strong>{{customer_name}}</strong>,</p>
                <p>Consistent routines yield the best wellness results! It has been about a month since you bought <strong>{{product_name}}</strong>, and you might be running low.</p>
                
                <p>Re-order today to ensure zero gaps in your daily regimen:</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{product_link}}" style="background-color: #16A34A; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Re-order Now</a>
                </div>
                ' . $this->getEmailFooter(),
                'trigger_type' => 'delay',
                'delay_value' => 30,
                'delay_unit' => 'days',
                'status' => 'active',
                'variables' => ['customer_name', 'product_name', 'product_link'],
            ],
            [
                'name' => 'Repeat Purchase Reminder (WhatsApp)',
                'code' => 'replenish_reminder_whatsapp',
                'flow' => 'reminder',
                'channel' => 'whatsapp',
                'subject' => null,
                'content' => 'Hello {{customer_name}},

It\'s time to replenish your supply! ⏰ Your previous purchase of *{{product_name}}* might be running low.

Keep your daily health routine consistent. Tap the link below to quickly re-order:

Re-order here: {{product_link}}',
                'trigger_type' => 'delay',
                'delay_value' => 30,
                'delay_unit' => 'days',
                'status' => 'active',
                'whatsapp_template_name' => 'replenish_reminder_v1',
                'whatsapp_status' => 'approved',
                'variables' => ['customer_name', 'product_name', 'product_link'],
            ],
        ];

        foreach ($templates as $tmpl) {
            NotificationTemplate::updateOrCreate(
                ['code' => $tmpl['code']],
                $tmpl
            );
        }
    }

    private function getEmailHeader(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: \'Inter\', Arial, sans-serif; background-color: #F8F3EF; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
                .wrapper { width: 100%; table-layout: fixed; background-color: #F8F3EF; padding-top: 40px; padding-bottom: 40px; }
                .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-collapse: collapse; border-radius: 12px; overflow: hidden; border: 1px border-gray-200; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
                .header { background-color: #052326; padding: 25px; text-align: center; }
                .logo { font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 1px; }
                .content { padding: 40px 30px; font-size: 15px; line-height: 1.6; color: #4A4A4A; }
                .footer { background-color: #F8F3EF; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #E5E5E5; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <table class="main">
                    <tr>
                        <td class="header">
                            <div class="logo">C U R E Z A</div>
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
        ';
    }

    private function getEmailFooter(): string
    {
        return '
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            <p style="margin: 0 0 10px 0;">&copy; ' . date('Y') . ' Cureza Wellness. All Rights Reserved.</p>
                            <p style="margin: 0;">You are receiving this transactional email because of your relationship with Cureza.</p>
                            <p style="margin: 10px 0 0 0;"><a href="{{unsubscribe_link}}" style="color: #16A34A; text-decoration: none;">Unsubscribe from marketing emails</a></p>
                        </td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
        ';
    }
}
