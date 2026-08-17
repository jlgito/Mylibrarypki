<?php
require_once __DIR__.'/db.php';

header('Content-Type: application/json; charset=UTF-8');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['pem'])) {
    http_response_code(400);
    echo json_encode(['error'=>'Invalid JSON or missing PEM']);
    exit;
}

try {
    // basic request logging for debugging
    $logPath = __DIR__ . '/../../data/upload.log';
    $logLine = sprintf("%s UPLOAD filename=%s type=%s sha=%s\n", date('c'), $input['filename'] ?? '-', $input['type'] ?? '-', substr(hash('sha256', $input['pem'] ?? ''),0,12));
    @file_put_contents($logPath, $logLine, FILE_APPEND);

    $pdo = get_db();

    $stmt = $pdo->prepare(
        "INSERT INTO certificates (filename, pem, type, description, tags, sha256)
         VALUES (:f, :p, :t, :d, :tags, :sha)"
    );

    $stmt->execute([
        ':f' => $input['filename'],
        ':p' => $input['pem'],
        ':t' => $input['type'],
        ':d' => $input['description'] ?? '',
        ':tags' => json_encode($input['tags'] ?? []),
        ':sha' => hash('sha256', $input['pem'])
    ]);

    echo json_encode(['ok'=>true, 'id'=>$pdo->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    // log the error
    @file_put_contents($logPath, date('c') . " ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
    echo json_encode(['error' => 'Server error', 'detail' => $e->getMessage()]);
}
