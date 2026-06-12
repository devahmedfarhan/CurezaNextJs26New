<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class SellerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'contact_person',
        'registering_as',
        'pan_number',
        'tax_id',
        'gst_number',
        'vat_number',
        'bank_name',
        'branch_name',
        'bank_account_number',
        'account_holder_name',
        'ifsc_code',
        'bic_swift_code',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'country',
        'pin_code',
        'sourcing_method',
        'sell_on_other_platforms',
        'brand_started_on',
        'annual_turnover',
        'product_count',
        'has_website',
        'found_us_via',
        'cheque_image_path',
        'signature_image_path',
        'aadhaar_number',
        'pan_image_path',
        'gst_image_path',
        'aadhaar_image_path',
        'pan_updated_at',
        'gst_updated_at',
        'cheque_updated_at',
        'signature_updated_at',
        'aadhaar_updated_at',
        'product_categories',
        'concerns_catered',
        'trade_license_image_path',
        'trademark_image_path',
        'drug_license_image_path',
        'pan_business_image_path',
        'organization_type',
        'kyc_numbers',
        'kyc_docs',
        'company_type',
        'status',
        'warned_at',
        'rejection_reason',
        'resubmit_allowed',
        'kyc_document_statuses',
        'kyc_document_reasons',
        'selected_licenses',
    ];

    protected $casts = [
        'sell_on_other_platforms' => 'boolean',
        'is_verified' => 'boolean',
        'brand_started_on' => 'date',
        'product_categories' => 'array',
        'concerns_catered' => 'array',
        'kyc_numbers' => 'array',
        'kyc_docs' => 'array',
        'warned_at' => 'datetime',
        'resubmit_allowed' => 'boolean',
        'kyc_document_statuses' => 'array',
        'kyc_document_reasons' => 'array',
        'selected_licenses' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
