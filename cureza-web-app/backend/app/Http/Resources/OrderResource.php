<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'user' => [
                'id' => $this->user_id,
                'name' => $this->user ? $this->user->name : 'Guest',
                'email' => $this->email ?? ($this->user ? $this->user->email : null),
            ],
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'pricing' => [
                'total_amount' => (float)$this->total_amount,
                'tax_amount' => (float)$this->tax_amount,
                'shipping_amount' => (float)$this->shipping_amount,
                'discount_amount' => (float)$this->discount_amount,
                'final_amount' => (float)$this->final_amount,
            ],
            'commission' => [
                'platform_commission_amount' => (float)$this->platform_commission_amount,
                'payment_gateway_fee' => (float)$this->payment_gateway_fee,
                'seller_earnings' => (float)$this->seller_earnings,
                'commission_calculated_at' => $this->commission_calculated_at,
            ],
            'shipping' => [
                'name' => $this->shipping_name,
                'address' => $this->shipping_address,
                'city' => $this->shipping_city,
                'state' => $this->shipping_state,
                'pincode' => $this->shipping_pincode,
                'tracking_number' => $this->tracking_number,
                'tracking_url' => $this->tracking_url,
                'carrier' => $this->carrier,
            ],
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
