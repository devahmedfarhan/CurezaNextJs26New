$users = App\Models\User::all();

foreach ($users as $user) {
    try {
        App\Models\Prescription::create([
            'prescription_number' => 'RX-' . rand(1000, 9999) . '-' . $user->id,
            'user_id' => $user->id,
            'doctor_id' => $user->id, // Assigning self as doctor for test
            'date' => now(),
            'patient_details' => [
                'name' => $user->name,
                'age' => 38,
                'gender' => 'Male',
                'phone' => $user->phone ?? '+919420774558',
                'health_concern' => 'Ankylosing Spondylitis Symptoms'
            ],
            'vitals' => [
                'weight' => '75kg',
                'bp' => '120/80'
            ],
            'chief_complaints' => 'Back pain and stiffness.',
            'diagnosis' => 'Ankylosing Spondylitis',
            'medicines' => [
                [
                    'name' => 'Vijaya Ambrosia',
                    'composition' => 'THC Rich Vijaya Leaf Extract 30%, Cocos nucifera 70%',
                    'dose' => '0-0-1',
                    'frequency' => 'Daily',
                    'days' => 30,
                    'instruction' => 'After Meal - 3 to 5 drops under tongue'
                ]
            ],
            'advice' => "• The oil has to be taken under the tongue. Hold 15-20 secs.\n• Take night dose 2 hours before bed.\n• Avoid alcohol.",
            'notes' => 'Follow up after 15 days.'
        ]);
        echo "Prescription created for user: " . $user->name . "\n";
    } catch (\Exception $e) {
        echo "Error for user " . $user->name . ": " . $e->getMessage() . "\n";
    }
}
