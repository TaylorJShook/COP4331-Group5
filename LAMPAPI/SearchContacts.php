<?php
// CORS (dev)
header("Access-Control-Allow-Origin: http://127.0.0.1:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
//

header('Content-Type: application/json; charset=utf-8');

function out($a,$c=200){ http_response_code($c); echo json_encode($a); exit; }

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) out(["results"=>[],"error"=>"Invalid JSON"], 400);

$userId = (int)($in["userId"] ?? 0);
$search = trim($in["search"] ?? "");
if ($userId <= 0) out(["results"=>[],"error"=>"Missing userId"], 400);

$like = "%".$search."%";

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
  $conn = new mysqli("127.0.0.1", "xxx", "xxx", "COP4331", 3306);
  $conn->set_charset('utf8mb4');

  $stmt = $conn->prepare("
    SELECT ID, FirstName, LastName, Phone, Email
    FROM Contacts
    WHERE UserID = ?
      AND (FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ? OR Email LIKE ?)
    ORDER BY LastName, FirstName, ID DESC
  ");
  $stmt->bind_param("issss", $userId, $like, $like, $like, $like);
  $stmt->execute();
  $res = $stmt->get_result();

  $rows = [];
  while ($r = $res->fetch_assoc()) {
    $rows[] = [
      "id"        => (int)$r["ID"],
      "firstName" => $r["FirstName"],
      "lastName"  => $r["LastName"],
      "phone"     => $r["Phone"],
      "email"     => $r["Email"]
    ];
  }
  $stmt->close(); $conn->close();

  out(["results"=>$rows, "count"=>count($rows), "error"=>""]);
} catch (mysqli_sql_exception $e) {
  out(["results"=>[],"error"=>"Database error"], 500);
}
