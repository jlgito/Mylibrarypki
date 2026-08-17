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

$stmt = $pdo->prepare("DELETE FROM certificates WHERE id = :id");
$stmt->execute([':id' => $input['id']]);

echo json_encode(['ok'=>true]);
