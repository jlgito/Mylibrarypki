<?php
require_once __DIR__.'/db.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo "Missing id";
    exit;
}

$pdo = get_db();
$stmt = $pdo->prepare("SELECT filename, pem FROM certificates WHERE id = :id");
$stmt->execute([':id'=>$id]);

$row = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$row) {
    http_response_code(404);
    echo "Not found";
    exit;
}

// Sanitize filename: keep basename, remove CR/LF and quotes
$filename = basename($row['filename'] ?: 'cert.pem');
$filename = str_replace(["\n","\r","\0","\"",'\\'], '', $filename);
if ($filename === '') $filename = 'cert.pem';

// Serve raw PEM exactly as stored. Use application/x-pem-file and attachment header so browser downloads it.
header('Content-Type: application/x-pem-file');
header('Content-Disposition: attachment; filename="' . $filename . '"');
// Content-Length helps browsers
$body = $row['pem'];
header('Content-Length: ' . strlen($body));

// Output without modification
echo $body;
