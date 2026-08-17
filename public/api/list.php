<?php
require_once __DIR__.'/db.php';

header('Content-Type: application/json; charset=UTF-8');

$type = $_GET['type'] ?? null;

$sql = "SELECT id, filename, type, cn, issuer, san, validity, sha256, description, tags, created_at FROM certificates WHERE 1=1";
$params = [];

if ($type) {
    $sql .= " AND type = :type";
    $params[':type'] = $type;
}

$sql .= " ORDER BY created_at DESC";

$pdo = get_db();
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
