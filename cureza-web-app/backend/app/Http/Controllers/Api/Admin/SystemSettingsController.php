<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Services\SystemSettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SystemSettingsController extends Controller
{
    /**
     * Display a listing of system settings grouped by their category.
     */
    public function index()
    {
        $settings = SystemSetting::all();

        // Group settings and mask secrets
        $groupedSettings = $settings->groupBy('group')->map(function ($items) {
            return $items->map(function ($item) {
                $value = $item->value;
                if ($item->is_secret && !empty($value)) {
                    $value = '********'; // Mask secret value
                }
                return [
                    'key' => $item->key,
                    'value' => $value,
                    'group' => $item->group,
                    'is_secret' => $item->is_secret,
                ];
            });
        });

        return response()->json($groupedSettings);
    }

    /**
     * Store or update system settings.
     */
    public function store(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:system_settings,key',
            'settings.*.value' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->settings as $settingData) {
                $setting = SystemSetting::where('key', $settingData['key'])->first();
                if (!$setting) {
                    continue;
                }

                $newValue = $settingData['value'];

                // If setting is a secret and value is masked, don't update it
                if ($setting->is_secret && $newValue === '********') {
                    continue;
                }

                $setting->value = $newValue;
                $setting->save();
            }

            DB::commit();

            // Clear cache to apply changes instantly
            SystemSettingsService::clearCache();
            SystemSettingsService::loadToConfig();

            return response()->json([
                'message' => 'Settings updated successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Settings update failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get public settings.
     */
    public function publicSettings()
    {
        $publicKeys = [
            'google_auth_enabled',
            'google_client_id',
            'otp_enabled',
            'razorpay_enabled',
            'razorpay_key',
            'stripe_enabled',
            'stripe_key',
            'payu_enabled',
            'payu_merchant_key',
            'phonepe_enabled',
            'phonepe_merchant_id',
            'cod_enabled'
        ];

        $settings = SystemSetting::whereIn('key', $publicKeys)->get();

        $publicSettings = [];
        $booleanKeys = ['google_auth_enabled', 'otp_enabled', 'razorpay_enabled', 'stripe_enabled', 'payu_enabled', 'phonepe_enabled', 'cod_enabled'];

        foreach ($settings as $setting) {
            $val = $setting->value;
            if (in_array($setting->key, $booleanKeys)) {
                $val = filter_var($val, FILTER_VALIDATE_BOOLEAN);
            }
            $publicSettings[$setting->key] = $val;
        }

        // Add defaults if they are missing
        if (!isset($publicSettings['google_auth_enabled'])) $publicSettings['google_auth_enabled'] = false;
        if (!isset($publicSettings['google_client_id'])) $publicSettings['google_client_id'] = '';
        if (!isset($publicSettings['otp_enabled'])) $publicSettings['otp_enabled'] = true;
        if (!isset($publicSettings['razorpay_enabled'])) $publicSettings['razorpay_enabled'] = true;
        if (!isset($publicSettings['razorpay_key'])) $publicSettings['razorpay_key'] = '';
        if (!isset($publicSettings['stripe_enabled'])) $publicSettings['stripe_enabled'] = false;
        if (!isset($publicSettings['stripe_key'])) $publicSettings['stripe_key'] = '';
        if (!isset($publicSettings['payu_enabled'])) $publicSettings['payu_enabled'] = false;
        if (!isset($publicSettings['payu_merchant_key'])) $publicSettings['payu_merchant_key'] = '';
        if (!isset($publicSettings['phonepe_enabled'])) $publicSettings['phonepe_enabled'] = false;
        if (!isset($publicSettings['phonepe_merchant_id'])) $publicSettings['phonepe_merchant_id'] = '';
        if (!isset($publicSettings['cod_enabled'])) $publicSettings['cod_enabled'] = true;

        return response()->json($publicSettings);
    }
}
