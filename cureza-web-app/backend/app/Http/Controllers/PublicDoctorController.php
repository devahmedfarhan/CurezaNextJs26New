<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class PublicDoctorController extends Controller
{
    /**
     * Display a listing of approved doctors.
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'doctor')
            ->where('doctor_status', 'approved');

        // Optional: Filter by specialization
        if ($request->has('specialization')) {
            $query->where('specialization', 'like', '%' . $request->specialization . '%');
        }

        $doctors = $query->get()->map(function ($doctor) {
            $ratingAggregate = \App\Models\RatingAggregate::where('aggregatable_type', 'App\\Models\\User')
                ->where('aggregatable_id', $doctor->id)
                ->first();

            return [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'specialization' => $doctor->specialization,
                'years_of_experience' => $doctor->years_of_experience,
                'consultation_fee' => $doctor->consultation_fee,
                'profile_photo_url' => $doctor->profile_photo_url,
                'gender' => $doctor->gender,
                'bio' => $doctor->bio,
                'languages_spoken' => $doctor->languages_spoken,
                'secondary_specializations' => $doctor->secondary_specializations,
                'areas_of_expertise' => $doctor->areas_of_expertise,
                'treatable_conditions' => $doctor->treatable_conditions,
                'medical_school' => $doctor->medical_school,
                'highest_qualification' => $doctor->highest_qualification,
                'available_days' => $doctor->available_days,
                'rating' => $ratingAggregate ? $ratingAggregate->average_rating : 0.0,
                'reviews_count' => $ratingAggregate ? $ratingAggregate->total_reviews : 0,
            ];
        });

        return response()->json($doctors);
    }

    /**
     * Display the specified doctor's public profile.
     */
    public function show($id)
    {
        $doctor = User::where('role', 'doctor')
            ->where('doctor_status', 'approved')
            ->findOrFail($id);

        $ratingAggregate = \App\Models\RatingAggregate::where('aggregatable_type', 'App\\Models\\User')
            ->where('aggregatable_id', $doctor->id)
            ->first();

        return response()->json([
            'id' => $doctor->id,
            'name' => $doctor->name,
            'specialization' => $doctor->specialization,
            'years_of_experience' => $doctor->years_of_experience,
            'consultation_fee' => $doctor->consultation_fee,
            'profile_photo_url' => $doctor->profile_photo_url,
            'gender' => $doctor->gender,
            'bio' => $doctor->bio,
            'languages_spoken' => $doctor->languages_spoken,
            'secondary_specializations' => $doctor->secondary_specializations,
            'areas_of_expertise' => $doctor->areas_of_expertise,
            'treatable_conditions' => $doctor->treatable_conditions,
            'medical_school' => $doctor->medical_school,
            'highest_qualification' => $doctor->highest_qualification,
            'available_days' => $doctor->available_days,
            'clinic_name' => $doctor->clinic_name,
            'clinic_address' => $doctor->clinic_address,
            'clinic_city' => $doctor->clinic_city,
            'google_map_link' => $doctor->google_map_link,
            'rating' => $ratingAggregate ? $ratingAggregate->average_rating : 0.0,
            'reviews_count' => $ratingAggregate ? $ratingAggregate->total_reviews : 0,
        ]);
    }
}
