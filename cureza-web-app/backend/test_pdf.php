<?php
try {
    echo "Checking container bindings...\n";
    if (app()->bound('dompdf.wrapper')) {
        echo "dompdf.wrapper is bound.\n";
    } else {
        echo "dompdf.wrapper is NOT bound.\n";
    }
    
    if (class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
        echo "Facade class exists.\n";
    } else {
        echo "Facade class does NOT exist.\n";
    }

    $prescription = App\Models\Prescription::first();
    if (!$prescription) {
        die("No prescription found.\n");
    }
    
    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('prescription', ['prescription' => $prescription, 'logoBase64' => '']);
    $pdf->save('test_output.pdf');
    echo "PDF generated successfully.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
