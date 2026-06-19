<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PerformanceController extends Controller
{
    /**
     * Get API performance report.
     * GET /api/admin/performance/report
     */
    public function report()
    {
        $logPath = storage_path('logs/api_performance.json');

        if (!file_exists($logPath)) {
            return response()->json([
                'total_requests' => 0,
                'average_duration_ms' => 0,
                'slow_endpoints' => [
                    'above_200ms' => [],
                    'above_500ms' => [],
                    'above_1s' => [],
                ],
                'endpoint_summary' => [],
                'recent_logs' => [],
            ]);
        }

        try {
            $content = file_get_contents($logPath);
            $logs = json_decode($content, true) ?: [];

            if (empty($logs)) {
                return response()->json([
                    'total_requests' => 0,
                    'average_duration_ms' => 0,
                    'slow_endpoints' => [
                        'above_200ms' => [],
                        'above_500ms' => [],
                        'above_1s' => [],
                    ],
                    'endpoint_summary' => [],
                    'recent_logs' => [],
                ]);
            }

            $totalRequests = count($logs);
            $totalDuration = 0;
            
            $above200ms = [];
            $above500ms = [];
            $above1s = [];

            $endpoints = [];

            foreach ($logs as $log) {
                $duration = $log['duration_ms'] ?? 0;
                $totalDuration += $duration;

                $pathKey = $log['method'] . ' ' . preg_replace('/\/\d+/', '/*', $log['path']);
                
                if (!isset($endpoints[$pathKey])) {
                    $endpoints[$pathKey] = [
                        'endpoint' => $pathKey,
                        'method' => $log['method'],
                        'path' => preg_replace('/\/\d+/', '/*', $log['path']),
                        'calls' => 0,
                        'total_duration' => 0,
                        'max_duration' => 0,
                        'total_queries' => 0,
                        'max_queries' => 0,
                    ];
                }

                $endpoints[$pathKey]['calls']++;
                $endpoints[$pathKey]['total_duration'] += $duration;
                $endpoints[$pathKey]['max_duration'] = max($endpoints[$pathKey]['max_duration'], $duration);
                $endpoints[$pathKey]['total_queries'] += ($log['query_count'] ?? 0);
                $endpoints[$pathKey]['max_queries'] = max($endpoints[$pathKey]['max_queries'], ($log['query_count'] ?? 0));

                if ($duration > 1000) {
                    $above1s[] = $log;
                } elseif ($duration > 500) {
                    $above500ms[] = $log;
                } elseif ($duration > 200) {
                    $above200ms[] = $log;
                }
            }

            $averageDuration = round($totalDuration / $totalRequests, 2);

            $endpointSummary = array_values(array_map(function ($item) {
                $item['avg_duration_ms'] = round($item['total_duration'] / $item['calls'], 2);
                $item['avg_queries'] = round($item['total_queries'] / $item['calls'], 1);
                return $item;
            }, $endpoints));

            // Sort endpoint summary by avg_duration_ms descending
            usort($endpointSummary, function ($a, $b) {
                return $b['avg_duration_ms'] <=> $a['avg_duration_ms'];
            });

            return response()->json([
                'total_requests' => $totalRequests,
                'average_duration_ms' => $averageDuration,
                'slow_endpoints' => [
                    'above_200ms_count' => count($above200ms),
                    'above_500ms_count' => count($above500ms),
                    'above_1s_count' => count($above1s),
                    'above_200ms' => array_slice($above200ms, 0, 10),
                    'above_500ms' => array_slice($above500ms, 0, 10),
                    'above_1s' => array_slice($above1s, 0, 10),
                ],
                'endpoint_summary' => $endpointSummary,
                'recent_logs' => array_slice($logs, 0, 20),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to parse performance report: ' . $e->getMessage()
            ], 500);
        }
    }
}
