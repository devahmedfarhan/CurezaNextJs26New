<?php

namespace App\Logging;

use Monolog\LogRecord;
use Monolog\Processor\ProcessorInterface;

class LogRedactorProcessor implements ProcessorInterface
{
    private array $sensitiveKeys = [
        'password',
        'password_confirmation',
        'cvv',
        'cvc',
        'pan_number',
        'gst_number',
        'aadhaar_number',
        'bank_account_number',
        'bank_ifsc',
        'bank_account_holder',
        'card_number',
        'pin',
    ];

    public function __invoke(LogRecord $record): LogRecord
    {
        $context = $record->context;
        if (!empty($context)) {
            $record = $record->with(context: $this->redactArray($context));
        }

        return $record;
    }

    private function redactArray(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->redactArray($value);
            } elseif (is_string($key) && in_array(strtolower($key), $this->sensitiveKeys)) {
                $data[$key] = '[REDACTED]';
            }
        }
        return $data;
    }
}
