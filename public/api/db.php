<?php
function get_db() {
    $path = '/var/www/html/monapp/data/db.sqlite';
    if (!file_exists($path)) {
        throw new RuntimeException("DB introuvable: $path");
    }
    $pdo = new PDO('sqlite:' . $path);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $pdo;
}
