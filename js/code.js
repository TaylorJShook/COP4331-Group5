const urlBase = 'http://127.0.0.1:8000';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "home.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function doRegister()
{
	userId = 0;
	firstName = "";
	lastName = "";

	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	let fName = document.getElementById("firstName").value;
	let lName = document.getElementById("lastName").value;

	document.getElementById("loginResult").innerHTML = "";

	let tmp = { firstName: fName, lastName: lName, login: login, password: password };
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/Register.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);

				if (jsonObject.error && jsonObject.error !== "")
				{
					document.getElementById("loginResult").innerHTML = jsonObject.error;
					return;
				}

				userId = jsonObject.id;
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();

				window.location.href = "home.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch (err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addContact() {
  const firstName = document.getElementById("contactFirstName")?.value.trim() || "";
  const lastName  = document.getElementById("contactLastName")?.value.trim()  || "";
  const phone     = document.getElementById("contactPhone")?.value.trim()     || "";
  const email     = document.getElementById("contactEmail")?.value.trim()     || "";
  const resultEl  = document.getElementById("contactAddResult");
  const btn       = document.getElementById("addContactButton");

  resultEl.textContent = "";

  // 1) Required fields
  if (!firstName || !lastName || !phone || !email) {
    resultEl.textContent = "Please fill out all fields.";
    return;
  }

  // 2) Phone validation: only digits/space/()+-. and 7–20 digits total
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneCharsOk = /^[0-9()\s\-+.]+$/.test(phone);
  if (!phoneCharsOk || phoneDigits.length < 7 || phoneDigits.length > 20) {
    resultEl.textContent = "Please enter a valid phone number (7–20 digits).";
    return;
  }

  // 3) Email validation
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    resultEl.textContent = "Please enter a valid email address.";
    return;
  }

  // 4) Must be logged in
  if (!userId || userId <= 0) {
    resultEl.textContent = "You appear to be logged out. Please sign in again.";
    return;
  }

  // Send
  const payload = { firstName, lastName, phone, email, userId };
  btn && (btn.disabled = true);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", urlBase + "/AddContact." + extension, true);
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    btn && (btn.disabled = false);

    if (xhr.status !== 200) {
      resultEl.textContent = "Request failed: " + xhr.status;
      return;
    }

    let data = {};
    try { data = JSON.parse(xhr.responseText || "{}"); }
    catch { resultEl.textContent = "Bad JSON from server."; return; }

    if (data.error) { resultEl.textContent = data.error; return; }

    resultEl.textContent = "Contact added successfully.";
    // clear fields
    document.getElementById("contactFirstName").value = "";
    document.getElementById("contactLastName").value  = "";
    document.getElementById("contactPhone").value     = "";
    document.getElementById("contactEmail").value     = "";
  };

  xhr.send(JSON.stringify(payload));
}


function delContact() {
	let newContact = document.getElementById("contactText").value;
	document.getElementById("contactAddResult").innerHTML = "";

	let tmp = { contact: newContact, userId, userId };
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/AddContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				document.getElementById("contactAddResult").innerHTML = "Contact has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch (err) {
		document.getElementById("contactAddResult").innerHTML = err.message;
	}

}

function searchContacts() {
  const q = document.getElementById("searchText").value.trim();
  const resultMsg = document.getElementById("contactSearchResult");
  const listEl = document.getElementById("contactList");

  resultMsg.textContent = "";
  listEl.innerHTML = "";

  if (!userId || userId <= 0) {
    resultMsg.textContent = "You appear to be logged out. Please sign in again.";
    return;
  }

  const payload = { userId, search: q };

  const xhr = new XMLHttpRequest();
  xhr.open("POST", urlBase + "/SearchContacts." + extension, true);
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;

    if (xhr.status !== 200) {
      resultMsg.textContent = "Search failed: " + xhr.status;
      return;
    }

    let data = {};
    try { data = JSON.parse(xhr.responseText || "{}"); }
    catch { resultMsg.textContent = "Bad JSON from server."; return; }

    if (data.error) {
      resultMsg.textContent = data.error;
      return;
    }

    if (!data.results || data.results.length === 0) {
      resultMsg.textContent = "No contacts found.";
      return;
    }

    const lines = data.results.map(c => (
      `${escapeHtml(c.firstName)} ${escapeHtml(c.lastName)} — ` +
      `${escapeHtml(c.phone || "")} — ${escapeHtml(c.email || "")}`
    ));
    listEl.innerHTML = lines.join("<br>");
    resultMsg.textContent = `Found ${data.results.length} contact(s).`;
  };

  xhr.send(JSON.stringify(payload));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

