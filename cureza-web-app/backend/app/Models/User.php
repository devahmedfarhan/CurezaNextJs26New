<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, \Laravel\Sanctum\HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'brand_id',
        'admin_role_id',
        // Personal Information
        'date_of_birth',
        'gender',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        // Professional Information (doctors)
        'medical_license_number',
        'license_issuing_state',
        'license_issuing_country',
        'license_issue_date',
        'specialization',
        'years_of_experience',
        'medical_school',
        // Practice Information
        'practice_name',
        'practice_address',
        'practice_city',
        'practice_state',
        'practice_country',
        'practice_postal_code',
        'practice_email',
        // Certifications
        'certifications',
        'professional_affiliations',
        // Status
        'doctor_status',
        'rejection_reason',
        // Comprehensive Doctor Fields
        'medical_license_number',
        'medical_council_name',
        'state_council_name',
        'license_expiry_date',
        'ayush_id',
        'license_path',
        'ayush_id_path',
        'identity_proof_path',
        'email_otp',
        'mobile_otp',
        'otp_expires_at',
        'mobile_verified_at',
        'admin_remarks',
        'approved_at',
        'approved_by',
        
        // Comprehensive Doctor Expansion
        'registration_source', 'registration_ip', 'device_info',
        'profile_photo_path', 'languages_spoken', 'bio',
        'consultation_duration', 'consultation_modes', 'secondary_specializations', 'areas_of_expertise', 'treatable_conditions', 'consultation_fee',
        'registration_date', 'ayush_system_type', 'ayush_document_path', 'identity_proof_type', 'identity_proof_number',
        'highest_qualification', 'degree_name', 'completion_year', 'education_history', 'additional_certifications',
        'clinic_name', 'clinic_address', 'clinic_city', 'clinic_state', 'clinic_pincode', 'google_map_link',
        'available_days', 'time_slots', 'timezone', 'emergency_availability', 'max_consultations_per_day', 'break_times',
        'bank_account_holder', 'bank_name', 'bank_account_number', 'bank_ifsc', 'payout_status', 'commission_percentage',
        'agreed_to_terms', 'agreed_to_telemedicine_guidelines', 'declaration_of_truth', 'consent_timestamp', 'consent_ip', 'consent_version',
        'audit_logs',
        'profile_photo_status', 'license_doc_status', 'identity_proof_status', 'ayush_document_status',
        'profile_photo_rejection_reason', 'license_doc_rejection_reason', 'identity_proof_rejection_reason', 'ayush_document_rejection_reason',
        'referral_code'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'certifications' => 'array',
            'professional_affiliations' => 'array',
            
            // Sensitive Encrypted Casts (Section 4.1)
            'phone' => 'encrypted',
            'medical_license_number' => 'encrypted',
            'bank_account_number' => 'encrypted',
            'bank_ifsc' => 'encrypted',
            'bank_account_holder' => 'encrypted',
            'address' => 'encrypted',
            
            // New Doctor Casts
            'languages_spoken' => 'array',
            'secondary_specializations' => 'array',
            'areas_of_expertise' => 'array',
            'treatable_conditions' => 'array',
            'education_history' => 'array',
            'additional_certifications' => 'array',
            'available_days' => 'array',
            'time_slots' => 'array',
            'consultation_modes' => 'array',
            'break_times' => 'array',
            'audit_logs' => 'array',
            'emergency_availability' => 'boolean',
            'agreed_to_terms' => 'boolean',
            'agreed_to_telemedicine_guidelines' => 'boolean',
            'declaration_of_truth' => 'boolean',
            'registration_date' => 'date',
            'pending_updates' => 'array',
        ];
    }
    public function brand()
    {
        return $this->hasOne(Brand::class);
    }

    public function sellerProfile()
    {
        return $this->hasOne(SellerProfile::class);
    }
    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    protected $appends = [
        'profile_image_url', 
        'license_url', 
        'ayush_id_url', 
        'identity_proof_url',
        'profile_photo_url',
        'ayush_document_url',
        'permissions'
    ];

    public function getProfileImageUrlAttribute()
    {
        if ($this->profile_image) {
             return asset('storage/' . $this->profile_image);
        }
        return null;
    }

    public function getLicenseUrlAttribute()
    {
        return $this->license_path ? asset('storage/' . $this->license_path) : null;
    }

    public function getAyushIdUrlAttribute()
    {
        return $this->ayush_id_path ? asset('storage/' . $this->ayush_id_path) : null;
    }

    public function getIdentityProofUrlAttribute()
    {
        return $this->identity_proof_path ? asset('storage/' . $this->identity_proof_path) : null;
    }

    public function getProfilePhotoUrlAttribute()
    {
        return $this->profile_photo_path ? asset('storage/' . $this->profile_photo_path) : null;
    }

    public function getAyushDocumentUrlAttribute()
    {
        return $this->ayush_document_path ? asset('storage/' . $this->ayush_document_path) : null;
    }

    public function wishlist()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function sellerWallet()
    {
        return $this->hasOne(SellerWallet::class, 'seller_id');
    }

    public function sellerCommissions()
    {
        return $this->hasMany(SellerCommission::class, 'seller_id');
    }

    public function sellerTransactions()
    {
        return $this->hasMany(SellerTransaction::class, 'seller_id');
    }

    public function sellerNotificationSettings()
    {
        return $this->hasOne(SellerNotificationSetting::class, 'seller_id');
    }

    public function sellerChangeRequests()
    {
        return $this->hasMany(SellerChangeRequest::class, 'seller_id');
    }

    public function adminRole()
    {
        return $this->belongsTo(AdminRole::class, 'admin_role_id');
    }

    public function getPermissionsAttribute()
    {
        if ($this->role === 'super_admin') {
            return [
                'dashboard',
                'products',
                'reviews',
                'orders',
                'users',
                'approvals',
                'marketing',
                'events',
                'finance',
                'support',
                'community',
                'cms',
                'settings'
            ];
        }

        if ($this->role === 'admin') {
            $role = $this->adminRole;
            return $role ? ($role->permissions ?? []) : [];
        }

        return [];
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
                    ->withPivot('unlocked_at')
                    ->withTimestamps();
    }

    public function challengesJoined()
    {
        return $this->hasMany(UserChallenge::class);
    }

    public function redemptions()
    {
        return $this->hasMany(RewardRedemption::class);
    }

    public function referralsMade()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }
}
