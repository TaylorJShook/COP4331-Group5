<?php
// --- CORS for local dev ---
header("Access-Control-Allow-Origin: http://127.0.0.1:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
//

header('Content-Type: application/json; charset=utf-8');

function out($arr, $code=200){ http_response_code($code); echo json_encode($arr); exit; }

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) out(["id"=>0,"firstName"=>"","lastName"=>"","error"=>"Invalid JSON"], 400);

$contactId = isset($in["contactId"]) ? (int)$in["contactId"] : (int)($in["id"] ?? 0);
$userId    = (int)($in["userId"] ?? 0);

if ($contactId <= 0 || $userId <= 0) {
  out(["id"=>0,"firstName"=>"","lastName"=>"","error"=>"Missing required fields: userId and contactId"], 400);
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
  $conn = new mysqli("127.0.0.1", "xxx", "xxx", "COP4331", 3306);
  $conn->set_charset('utf8mb4');

  $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=? AND UserID=?");
  $stmt->bind_param("ii", $contactId, $userId);
  $stmt->execute();

  if ($stmt->affected_rows > 0) {
    out(["id"=>0,"firstName"=>"","lastName"=>"","error"=>""]); 
  } else {
    out(["id"=>0,"firstName"=>"","lastName"=>"","error"=>"No Records Found"], 404);
  }
} catch (mysqli_sql_exception $e) {
  out(["id"=>0,"firstName"=>"","lastName"=>"","error"=>"DB error: ".$e->getMessage()], 500);
}
