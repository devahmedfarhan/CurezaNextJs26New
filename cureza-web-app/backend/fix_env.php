<?php

$envFile = __DIR__ . '/.env';

if (!file_exists($envFile)) {
    die(".env file not found!\n");
}

$content = file_get_contents($envFile);

// Check if SESSION_DRIVER exists
if (strpos($content, 'SESSION_DRIVER=') !== false) {
    // Replace existing
    $content = preg_replace('/^SESSION_DRIVER=.*$/m', 'SESSION_DRIVER=file', $content);
} else {
    // Append
    $content .= "\nSESSION_DRIVER=file\n";
}

// Ensure SESSION_LIFETIME is set
if (strpos($content, 'SESSION_LIFETIME=') === false) {
    $content .= "SESSION_LIFETIME=120\n";
}

file_put_contents($envFile, $content);

echo "Updated .env: SESSION_DRIVER set to 'file'.\n";
