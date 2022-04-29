let fetchToken = document.getElementById("fetchBtn");
fetchToken.addEventListener("click", fetchApiToken);

let submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", submitDetails);

//to fetch values if already set
fetchOptions();

//Fetch Api Token
async function fetchApiToken() {
  showNotification("info", "Pls wait. Fetching API Token...");
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let baseUrl = document.getElementById("baseUrl").value;
  let bearerToken = document.getElementById("bearerToken");

  if (username && password && baseUrl) {
    baseUrl = baseUrl.replace(/\/$/, "");
    var requestOptions = {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json;charset=UTF-8",
        csrf: "token",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
      },
      body: `{"username" :"${username}", "password" :"${password}"}`, // body: `{"email":"${username}","password":"${password}"}`,
      redirect: "follow",
    };
    try {
      let response = await fetch(
        `${baseUrl}/api/v1/public/auth`,
        requestOptions
      );
      let responseBody = await response.json();
      if (responseBody && responseBody) {
        let { api_token } = responseBody.data;
        bearerToken.value = api_token;
      }
    } catch (error) {
      return undefined;
    }
  }
}

//submit detail
function submitDetails() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let ahsPassword = document.getElementById("ahspassword").value;
  let baseUrl = document.getElementById("baseUrl").value;
  let bearerToken = document.getElementById("bearerToken");

  if (username && password && ahsPassword && baseUrl && bearerToken.value) {
    chrome.storage.sync.set({
      baseUrl: baseUrl,
      bearerToken: bearerToken.value,
      password: password,
      ahsPassword: ahsPassword,
      username: username,
    });
    showNotification("success", "Options saved successfully");
    setTimeout(function () {
      window.close();
    }, 1000);
  } else {
    showNotification("error", "Please enter valid credentials !");
  }
}

//get already set values
function fetchOptions() {
  chrome.storage.sync.get(["auth"], function (result) {
    if (result && result.auth) {
      let { auth } = result;
      let { username, password, baseUrl, bearerToken } = auth;
      document.getElementById("username").value = username;
      document.getElementById("password").value = password;
      document.getElementById("baseUrl").value = baseUrl;
      document.getElementById("bearerToken").value = bearerToken;
    }
  });
}

function showNotification(type, text) {
  var x = document.getElementById("snackbar");
  if (type == "success") {
    x.style.backgroundColor = "rgb(76, 165, 16)";
  }
  if (type == "error") {
    x.style.backgroundColor = "#a52610";
  }
  x.innerText = text;
  x.className = "show";
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 3000);
}

// __________________________________________;
