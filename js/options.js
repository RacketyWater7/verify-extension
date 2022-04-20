//Add event listener to the submit option values button
// let submitBtn = document.getElementById("submitBtn");
// submitBtn.addEventListener("click", getOptionValues);

// /**
//  * gets options values set by the user
//  */

// function getOptionValues() {
//   //get values from user options
//   let baseUrl = document.getElementById("baseUrl").value;
//   console.log(baseUrl);
//   let bearerToken = document.getElementById("bearerToken").value;
//   let ahsPassword = document.getElementById("ahsPassword").value;
//   if (baseUrl !== "" && bearerToken !== "") {
//     //Set the pandadocapi to chrome storage
//     chrome.storage.sync.set({
//       baseUrl: baseUrl,
//       bearerToken: bearerToken,
//       ahsPassword: ahsPassword,
//     });
//     window.close();
//   }
// }

// //get options user set from chrome storage
// chrome.storage.sync.get(
//   ["baseUrl", "bearerToken", "ahsPassword"],
//   function (result) {
//     console.log(result);
//     if (result.baseUrl != undefined && result.bearerToken != undefined) {
//       //get values from user options
//       document.getElementById("baseUrl").value = result.baseUrl;
//       document.getElementById("bearerToken").value = result.bearerToken;
//       document.getElementById("ahsPassword").value = result.ahsPassword;
//     }
//   }
// );

//////////////////////////////////////////////

//Add event listener to the fetch the api tken as Bearer Token
let fetchToken = document.getElementById("fetchBtn");
fetchToken.addEventListener("click", fetchApiToken);
//Add event listener to the submit option values button
let submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", submitDetails);

//to fetch values if already set
fetchOptions();

//Fetch Api Token
async function fetchApiToken() {
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
    // let auth = {
    //   baseUrl,
    //   username,
    //   password,
    //   bearerToken: bearerToken.value,
    // };
    // console.log("auth", auth);
    // chrome.storage.sync.set({ auth });
    chrome.storage.sync.set({
      baseUrl: baseUrl,
      bearerToken: bearerToken.value,
      password: password,
      ahsPassword: ahsPassword,
      username: username,
    });
    // window.close();
  } else {
    alert("Please enter valid credentials !");
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

// __________________________________________;
