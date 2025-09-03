<?php

    $inData = getRequestInfo();

    $contactId = isset($inData["contactId"]) ? intval($inData["contactId"]) :
                 (isset($inData["id"]) ? intval($inData["id"]) : 0);
    $userId    = isset($inData["userId"]) ? intval($inData["userId"]) : 0;

    if ($contactId === 0 || $userId === 0)
    {
        returnWithError("Missing required fields: userId and id/contactId");
    }

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if( $conn->connect_error )
    {
        returnWithError( $conn->connect_error );
    }
    else
    {
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=? AND UserID=?");
        $stmt->bind_param("ii", $contactId, $userId);
        $stmt->execute();

        if ($stmt->affected_rows > 0)
        {
            returnWithInfo("", "", 0);
        }
        else
        {
            returnWithError("No Records Found");
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson( $obj )
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError( $err )
    {
        $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }

    // Reuse the same success envelope format as Login.php
    function returnWithInfo( $firstName, $lastName, $id )
    {
        $retValue = '{"id":' . intval($id) . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
        sendResultInfoAsJson( $retValue );
    }

?>
