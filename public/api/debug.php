<?php
// Debug endpoint to help confirm which files / DB the running PHP process uses.
// Usage: GET /api/debug.php
header('Content-Type: application/json; charset=UTF-8');

$root = realpath(__DIR__ . '/..');
$projectRoot = realpath(__DIR__ . '/../../');

$dataCandidates = [
    realpath(__DIR__ . '/../../data/db.sqlite'),
    realpath(__DIR__ . '/../data/db.sqlite'),
    realpath(__DIR__ . '/../../../data/db.sqlite'),
];

$exists = [];
foreach ($dataCandidates as $p) {
    if ($p && file_exists($p)) {
        $exists[] = [
            'path' => $p,
            'size' => filesize($p),
            'last_write' => date('c', filemtime($p)),
            'writable' => is_writable($p)
        ];
    }
}

$uploadLog = null;
$uploadLogPath = realpath(__DIR__ . '/../../data/upload.log') ?: (realpath(__DIR__ . '/../data/upload.log') ?: null);
if ($uploadLogPath && file_exists($uploadLogPath)) {
    $lines = array_slice(file($uploadLogPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES), -30);
    $uploadLog = implode("\n", $lines);
}

$out = [
    'php_cwd' => getcwd(),
    'api_dir' => __DIR__,
    'public_api_parent' => $root,
    'project_root_guess' => $projectRoot,
    'db_candidates_checked' => $dataCandidates,
    'db_existing' => $exists,
    'upload_log_path' => $uploadLogPath,
    'upload_log_tail' => $uploadLog,
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? null,
    'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? null,
];

echo json_encode($out, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
