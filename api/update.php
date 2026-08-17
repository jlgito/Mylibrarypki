<?php
require_once __DIR__.'/db.php';

header('Content-Type: application/json; charset=UTF-8');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['error'=>'Missing id']);
    exit;
}

$pdo = get_db();

$stmt = $pdo->prepare("
    UPDATE certificates
    SET description = :d, tags = :t
    WHERE id = :id
");

$stmt->execute([
    ':d' => $input['description'] ?? '',
    ':t' => json_encode($input['tags'] ?? []),
    ':id' => $input['id']
]);

echo json_encode(['ok'=>true]);
