let baseUrl = "";
let bearerToken = "";

window.onload = function () {
  fetchApiKey();
};

// function insertFailLog(description) {
// chrome.runtime.sendMessage(
//   {
//     type: "insertLog",
//     payload: {
//       description: description,
//       result: "failure",
//       level: "error",
//     },
//   },
//   function (response) {}
// );
// }

// window.onerror = function (error, url, line) {
//   if (url.includes("content-script.js") || url.includes("background.js")) {
//     let logDes = `Line: ${line} Error:${error} URL: ${url}`;
//     insertFailLog(logDes);
//   }
// };

/**
 * Fetch API Key from chrome storage
 */
function fetchApiKey() {
  chrome.storage.sync.get(["baseUrl", "bearerToken"], function (result) {
    try {
      if (result.baseUrl) {
        baseUrl = result.baseUrl.replace(/\/$/, "");
        bearerToken = result.bearerToken;
        init();
        // window.addEventListener("load", init(), false);
      } else {
        vNotify.error({ text: "Set API Url" });
        console.log("came in negative");
        // window.addEventListener("load", init(), false);
      }
    } catch (err) {
      let desc = `${err.toString()} in fetchApiKey() in Content Script`;
      console.log(desc);
    }
  });
}

/**
 * check for the pathname and follow up functions execution
 */
// https://secure.vermont.gov/DPS/criminalrecords/subscriber/request.php
function init() {
  window.addEventListener(
    "hashchange",
    function () {
      console.log("hash url:", window.location.href);
      let url = window.location.href;
      url = url.split("/");
      if (
        url[url.length - 1] === "add" &&
        url[url.length - 2] === "verification_form"
      ) {
        let btnV = document.getElementById("verifybtn");
        if (btnV) {
        } else {
          submitVerificationForm();
        }
      }
    },
    false
  );
  window.addEventListener("popstate", function () {
    console.log("popstate url:", window.location.href);
    // let url = window.location.href;
  });
  // let observer = new MutationObserver(function (mutations) {
  //   mutations.forEach(function (mutation) {
  //     if (mutation.type === "attributes") {
  //       console.log("mutation: ", mutation);
  //       // signInOkta();
  //     }
  //   });
  // });
  // let config = { attributes: true, childList: true, subtree: true };
  // observer.observe(document.body, config);

  try {
    let { pathname, search } = window.location;
    console.log(`pathname`, pathname);
    if (
      pathname.includes("/signin/refresh-auth-state") ||
      window.location.href === "https://otes.okta.com/"
    ) {
      chrome.storage.sync.get(["source"], function (result) {
        if (result && result.source) {
          console.log("came in refresh-auth-state");
          signInOkta();
        }
      });
    }
    switch (pathname) {
      case "/DPS/criminalrecords/subscriber/": {
        console.log("inside /DPS/criminalrecords/subscriber/");
        if (search.includes("email")) {
          // const urlParams = new URLSearchParams(search);
          // let prospectEmail = urlParams.get("email");
          // chrome.storage.sync.set({
          //   baseUrl,
          //   bearerToken,
          //   prospectEmail: prospectEmail,
          //   source: "jazzhr",
          // });
          email = "m@tlcnursing.com";
          password = "1550Williston!";
          // chrome.storage.sync.set({
          //   baseUrl,
          //   bearerToken,
          //   prospectEmail: prospectEmail,
          //   source: "jazzhr",
          // });
          populateLoginFields(email, password);
        }
        break;
      }
      case "/DPS/criminalrecords/subscriber/agreement.php": {
        chrome.storage.sync.get(["source"], function (result) {
          console.log(result);
          if (result && result.source) {
            populateArgreementFields();
          }
        });

        break;
      }
      case "/DPS/criminalrecords/subscriber/request.php": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            fetchCandidateData();
          }
        });

        break;
      }
      case "/DPS/criminalrecords/subscriber/done.php": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            getConvictionRecord();
          }
        });
        break;
      }
      case "/ABC/sign_on.cfm": {
        console.log("at sign on");
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            console.log("inside source");
            populateAhsLoginFields();
          }
        });
        chrome.storage.sync.get(["ahsData"], function (result) {
          if (result && result.ahsData) {
            console.log("inside ahsData");
            populateAhsLoginFields();
          }
        });
        break;
      }
      case "/ABC/Authorize_SU.cfm": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            let submitBtn = document.querySelector("form input");
            submitBtn.click();
          }
        });

        chrome.storage.sync.get(["ahsData"], function (result) {
          if (result && result.ahsData) {
            let submitBtn = document.querySelector("form input");
            submitBtn.click();
          }
        });

        break;
      }
      case "/ABC/SubscriberHome.cfm": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            window.location.pathname = "/ABC/background_check.cfm";
          }
        });
        chrome.storage.sync.get(["ahsData"], function (result) {
          if (result && result.ahsData) {
            window.location.pathname = "/ABC/org_status.cfm";
          }
        });
        break;
      }
      case "/ABC/background_check.cfm": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            fetchAhsFields();
          }
        });
        break;
      }
      case "/ABC/background_checkreview.cfm": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            let submitBtn = document.getElementById("subbut");
            submitBtn.click();
          }
        });

        break;
      }
      case "/ABC/search_registry.cfm": {
        chrome.storage.sync.get(["source"], async function (result) {
          if (result && result.source) {
            window.location =
              "https://sam.gov/search/?index=ex&page=1&sort=-relevance&sfm%5Bstatus%5D%5Bis_active%5D=true&sfm%5BclassificationWrapper%5D%5Bclassification%5D=Individual";
          }
        });
        break;
      }
      case "/ABC/org_status.cfm": {
        chrome.storage.sync.get(["ahsData"], function (result) {
          if (result && result.ahsData) {
            let data = result.ahsData;
            fetchAhsRequestDetails(data);
          }
        });

        break;
      }
      case "/ABC/show_list.cfm": {
        chrome.storage.sync.get(["ahsData"], function (result) {
          if (result && result.ahsData) {
            searchAhsRecord();
          }
        });

        break;
      }
      case "/ABC/show_clears.cfm": {
        chrome.storage.sync.get(["ahsData"], function (result) {
          if (result && result.ahsData) {
            const urlParams = new URLSearchParams(search);
            let recordType = urlParams.get("RegistryRecordTypeID");
            if (recordType === "6") {
              postAhsAdultRecord();
            } else if (recordType === "7") {
              postAhsChildRecord();
            } else {
            }
          }
        });

        break;
      }
      case "/": {
        let url = window.location.href;
        url = url.split("/");
        if (
          url[url.length - 1] === "add" &&
          url[url.length - 2] === "verification_form"
        ) {
          submitVerificationForm();
        }
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            if (window.location.hostname === "exclusions.oig.hhs.gov") {
              searchExclusion();
            }
            if (window.location.hostname === "www.google.com") {
              let fields = result.source;
              searchGoogle(fields);
            }
            if (window.location.hostname === "otes.okta.com") {
              signInOkta();
            }
            if (window.location.hostname === "clientconnect.otes.com") {
              let a = document.querySelector("a[href='/order/applicant']");
              a.click();
            }
          }
        });

        break;
      }
      case "/SearchResults.aspx": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            // window.location.href = 'https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm'
            sendExclusionRecord();
          }
        });

        break;
      }

      //sam search

      case "/search/": {
        // get button with class name "close-btn ng-tns-c66-1 ng-star-inserted" and click it
        let closeBtn = document.querySelector(
          "button.close-btn.ng-tns-c66-1.ng-star-inserted"
        );
        if (closeBtn) {
          closeBtn.click();
        }

        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            console.log(`result`, result);
            chrome.storage.sync.get(["fields"], function (result) {
              let { fields } = result;

              populateNewSamFormFields(fields);
            });
            //searchSam();
          } else {
            console.log(`result`, result);
          }
        });

        break;
      }
      //sam individual
      case "/exclusions-new": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            let interval = setInterval(() => {
              if (document.getElementById("primary-content")) {
                // postRecord(record, 'SAM', 'https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm');
                // navigate(record, "SAM", false);
                clearInterval(interval);
              }
            }, 1000);
          }
        });
        break;
      }
      case "/search": {
        chrome.storage.sync.get(["source"], async function (result) {
          if (result && result.source) {
            if (window.location.hostname === "www.google.com") {
              let captureElement = document.getElementsByTagName("body")[0];

              let width = captureElement.scrollWidth;
              let height = captureElement.scrollHeight;
              const opt = {
                margin: 0,
                filename: "google.pdf",
                image: { type: "jpeg", quality: 1 },
                html2canvas: { scale: 1 },
                enableLinks: false,
                css_media_type: "print",
                jsPDF: {
                  orientation: "l",
                  unit: "in",
                  format: "tabloid",
                  putOnlyUsedFonts: true,
                  floatPrecision: 16, // or "smart", default is 16
                },
                html2canvas: {
                  dpi: 300,
                  // letterRendering: true,
                  height: height,
                  width: width,
                  useCORS: true,
                },
              };
              await html2pdf().from(captureElement).set(opt).save();

              try {
                await html2pdf()
                  .from(captureElement)
                  .set(opt)
                  .outputPdf()
                  .then(function (pdf) {
                    let doc = { google: btoa(pdf) };
                    postDocument(doc);
                    navigate("https://clientconnect.otes.com/login");
                  });
              } catch (err) {
                console.log("err:", err);
              }
            }
          }
        });

        break;
      }
      case "/oauth2/default/v1/authorize": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            signInOkta();
          }
        });
        break;
      }
      case "/login": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            let input = document.getElementById("input-username");
            input.value = "m@tlcnursing.com";
            let button = document.getElementsByClassName("btn-lg")[0];
            button.click();
          }
        });
        break;
      }
      case "/signin" || "/signin/refresh-auth-state/": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            let inputUsername = document.getElementById("okta-signin-username");
            if (inputUsername) {
              inputUsername.value = "m@tlcnursing.com";
            }
            let inputPassword = document.getElementById("okta-signin-password");
            inputPassword.value = "Williston1550!";
            let btnSignIn = document.getElementById("okta-signin-submit");
            btnSignIn.click();
          }
        });
        break;
      }
      case "/order/applicant": {
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            fillApplicantForm();
          }
        });
        break;
      }
      // case '/SAM/pages/public/searchRecords/advancedPIRSearch.jsf': {
      // 	chrome.storage.sync.get(['source'], function (result) {
      // 		if (result && result.source) {
      // 			searchSam();
      // 		}
      // 	});
      // 	break;
      // }
      // case '/SAM/pages/public/searchRecords/advancedPIRSearchResults.jsf': {
      // 	chrome.storage.sync.get(['source'], function (result) {
      // 		if (result && result.source) {
      // 			postSamRecord();
      // 		}
      // 	});
      // 	break;
      // }
      default:
        return false;
    }
  } catch (err) {
    let desc = `${err.toString()} in init() in Content Script`;
    console.log(desc);
  }
  // }
}

/**
 * populate the login fields and bypass the login page
 * @param {string} email
 * @param {string} password
 */

function populateLoginFields(email, password) {
  try {
    let usernameInp = document.getElementsByName("uname")[0];
    let passwordInp = document.getElementsByName("pass")[0];
    let submitBtn = document.getElementsByName("Submit")[0];
    usernameInp.value = email;
    passwordInp.value = password;
    submitBtn.click();
  } catch (err) {
    console.log("errrr: ", err.toString());
    let desc = `${err.toString()} in populateLoginFields() in Content Script`;
    console.log(desc);
  }
}

/**
 * check all checkboxes on the agreements page
 */
function populateArgreementFields() {
  try {
    console.log(document.getElementsByName("modification"));
    let modification = document.getElementsByName("modification")[0];
    let disclosure = document.getElementsByName("disclosure")[0];
    let pay = document.getElementsByName("pay")[0];
    let vpa = document.getElementsByName("vpa")[0];
    let submitBtn = document.getElementsByName("Submit")[0];
    modification.checked = true;
    disclosure.checked = true;
    pay.checked = true;
    vpa.checked = true;
    submitBtn.click();
  } catch (err) {
    let desc = `${err.toString()} in populateArgreementFields() in Content Script`;
    console.log(desc);
  }
}

/**
 * send request to background page and fetch candidate details
 */

function fetchCandidateData() {
  chrome.storage.sync.get(["source"], function (result) {
    try {
      if (result) {
        let { source } = result;
        console.log("source: ", source);

        // chrome.runtime.sendMessage(
        //   {
        //     baseUrl,
        //     bearerToken,
        //     prospectEmail,
        //     type: "fetchCandidateDetails",
        //   },
        //   function (response) {
        //     if (response) {
        //       let { fields } = response;
        if (source) {
          populateCandidateData(source);
          let submitBtn = document.getElementsByName("Submit")[0];
          submitBtn.click();
        } else {
          // vNotify.error({ text: "Applicant not found" });
        }
        //     }
        //   }
        // );
      }
    } catch (err) {
      let desc = `${err.toString()} in fetchCandidateData() in Content Script`;
      console.log(desc);
    }
  });
}

/**
 * populate candidate details into the form
 * @param {array} fields | collection of field name and value
 */

function populateCandidateData(fields) {
  try {
    chrome.storage.sync.set({
      fields: fields,
    });
    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        let fieldValue = fields[key];
        if (key === "fname") {
          document.getElementsByName("first_name")[0].value = fieldValue;
          chrome.storage.sync.set({
            firstName: fieldValue,
          });
        }
        if (key === "lname") {
          document.getElementsByName("last_name")[0].value = fieldValue;
          chrome.storage.sync.set({
            lastName: fieldValue,
          });
        }
        if (key === "altfname1" && fieldValue) {
          document.getElementsByName("alias_1_first_name")[0].value =
            fieldValue;
        }
        if (key === "altlname1" && fieldValue) {
          document.getElementsByName("alias_1_last_name")[0].value = fieldValue;
        }
        if (key === "altfname2" && fieldValue) {
          document.getElementsByName("alias_2_first_name")[0].value =
            fieldValue;
        }
        if (key === "altlname2" && fieldValue) {
          document.getElementsByName("alias_2_last_name")[0].value = fieldValue;
        }
        if (key === "bday") {
          let dateField = document.getElementsByName("dob_day")[0],
            monthField = document.getElementsByName("dob_month")[0],
            yearField = document.getElementsByName("dob_year")[0];
          fieldValue = new Date(fieldValue).toISOString();
          let field = fieldValue.split("T")[0];
          field = field.split("-");
          let year = field[0],
            month = field[1],
            day = field[2];
          if (
            dateField.value === "" ||
            monthField.value === "" ||
            yearField.value === ""
          ) {
            dateField.value = day;
            monthField.value = month;
            yearField.value = year;
          }
        }
      }
    }

    document.getElementsByName("purpose")[0].value = "E";
  } catch (err) {
    let desc = `${err.toString()} in populateCandidateData() in Content Script`;
    console.log(desc);
  }
}

/**
 * get conviction record on candidate data submit
 * send request to background page to request the data obtained to api
 */

async function getConvictionRecord() {
  try {
    let captureElement = document.getElementsByTagName("body")[0];
    const opt = {
      margin: 0,
      filename: "vcic.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 1 },
      enableLinks: false,
      jsPDF: {
        orientation: "p",
        unit: "mm",
        format: "tabloid",
        putOnlyUsedFonts: true,
        floatPrecision: 16, // or "smart", default is 16
      },
      html2canvas: {
        // dpi: 300,
        // letterRendering: true,
        useCORS: true,
      },
    };
    await html2pdf().from(captureElement).set(opt).save();
    try {
      await html2pdf()
        .from(captureElement)
        .set(opt)
        .outputPdf()
        .then(function (pdf) {
          let doc = { vcic: btoa(pdf) };

          postDocument(doc);
          navigate("https://exclusions.oig.hhs.gov/");
        });
    } catch (err) {
      console.log("error: ", err);
      let desc = `${err.toString()} in getConvictionRecord() in Content Script`;
      console.log(desc);
    }
  } catch (err) {
    let desc = `${err.toString()} in getConvictionRecord() in Content Script`;
    console.log(desc);
  }
}

/**
 * populate the login form on ahs website
 */
function populateAhsLoginFields() {
  chrome.storage.sync.get(["ahsPassword"], function (result) {
    try {
      console.log(result);
      if (result.ahsPassword != undefined) {
        let firstName = "Moe";
        let lastName = "B";
        let orgId = "CMO023";
        document.getElementsByName("fname")[0].value = firstName;
        document.getElementsByName("lname")[0].value = lastName;
        document.getElementsByName("ID")[0].value = orgId;
        // document.getElementsByName('personalPassword')[0].value = 'Williston3!';
        document.getElementsByName("personalPassword")[0].value =
          result.ahsPassword;
        document.getElementsByName("login")[0].click();
      }
    } catch (err) {
      let desc = `${err.toString()} in getConvictionRecord() in Content Script`;
      console.log(desc);
    }
  });
}

/**
 * fetch the form fields for ahs website
 */

function fetchAhsFields() {
  chrome.storage.sync.get(["fields"], function (result) {
    let { fields } = result;
    populateAhsFormFields(fields);
  });
}

function getStateAbriviaiton(state) {
  let statesArr = [
    {
      name: "Alabama",
      abbreviation: "AL",
    },
    {
      name: "Alaska",
      abbreviation: "AK",
    },
    {
      name: "American Samoa",
      abbreviation: "AS",
    },
    {
      name: "Arizona",
      abbreviation: "AZ",
    },
    {
      name: "Arkansas",
      abbreviation: "AR",
    },
    {
      name: "California",
      abbreviation: "CA",
    },
    {
      name: "Colorado",
      abbreviation: "CO",
    },
    {
      name: "Connecticut",
      abbreviation: "CT",
    },
    {
      name: "Delaware",
      abbreviation: "DE",
    },
    {
      name: "District Of Columbia",
      abbreviation: "DC",
    },
    {
      name: "Federated States Of Micronesia",
      abbreviation: "FM",
    },
    {
      name: "Florida",
      abbreviation: "FL",
    },
    {
      name: "Georgia",
      abbreviation: "GA",
    },
    {
      name: "Guam",
      abbreviation: "GU",
    },
    {
      name: "Hawaii",
      abbreviation: "HI",
    },
    {
      name: "Idaho",
      abbreviation: "ID",
    },
    {
      name: "Illinois",
      abbreviation: "IL",
    },
    {
      name: "Indiana",
      abbreviation: "IN",
    },
    {
      name: "Iowa",
      abbreviation: "IA",
    },
    {
      name: "Kansas",
      abbreviation: "KS",
    },
    {
      name: "Kentucky",
      abbreviation: "KY",
    },
    {
      name: "Louisiana",
      abbreviation: "LA",
    },
    {
      name: "Maine",
      abbreviation: "ME",
    },
    {
      name: "Marshall Islands",
      abbreviation: "MH",
    },
    {
      name: "Maryland",
      abbreviation: "MD",
    },
    {
      name: "Massachusetts",
      abbreviation: "MA",
    },
    {
      name: "Michigan",
      abbreviation: "MI",
    },
    {
      name: "Minnesota",
      abbreviation: "MN",
    },
    {
      name: "Mississippi",
      abbreviation: "MS",
    },
    {
      name: "Missouri",
      abbreviation: "MO",
    },
    {
      name: "Montana",
      abbreviation: "MT",
    },
    {
      name: "Nebraska",
      abbreviation: "NE",
    },
    {
      name: "Nevada",
      abbreviation: "NV",
    },
    {
      name: "New Hampshire",
      abbreviation: "NH",
    },
    {
      name: "New Jersey",
      abbreviation: "NJ",
    },
    {
      name: "New Mexico",
      abbreviation: "NM",
    },
    {
      name: "New York",
      abbreviation: "NY",
    },
    {
      name: "North Carolina",
      abbreviation: "NC",
    },
    {
      name: "North Dakota",
      abbreviation: "ND",
    },
    {
      name: "Northern Mariana Islands",
      abbreviation: "MP",
    },
    {
      name: "Ohio",
      abbreviation: "OH",
    },
    {
      name: "Oklahoma",
      abbreviation: "OK",
    },
    {
      name: "Oregon",
      abbreviation: "OR",
    },
    {
      name: "Palau",
      abbreviation: "PW",
    },
    {
      name: "Pennsylvania",
      abbreviation: "PA",
    },
    {
      name: "Puerto Rico",
      abbreviation: "PR",
    },
    {
      name: "Rhode Island",
      abbreviation: "RI",
    },
    {
      name: "South Carolina",
      abbreviation: "SC",
    },
    {
      name: "South Dakota",
      abbreviation: "SD",
    },
    {
      name: "Tennessee",
      abbreviation: "TN",
    },
    {
      name: "Texas",
      abbreviation: "TX",
    },
    {
      name: "Utah",
      abbreviation: "UT",
    },
    {
      name: "Vermont",
      abbreviation: "VT",
    },
    {
      name: "Virgin Islands",
      abbreviation: "VI",
    },
    {
      name: "Virginia",
      abbreviation: "VA",
    },
    {
      name: "Washington",
      abbreviation: "WA",
    },
    {
      name: "West Virginia",
      abbreviation: "WV",
    },
    {
      name: "Wisconsin",
      abbreviation: "WI",
    },
    {
      name: "Wyoming",
      abbreviation: "WY",
    },
  ];
  statesArr.forEach((obj) => {
    if (obj.name === state) {
      return obj.abbreviation;
    }
  });
  return state;
}

/**
 * populate the ahs website form
 * @param {array} fieldsArr | form fields array
 */

function populateAhsFormFields(fields) {
  try {
    let resubmitCheck = document.getElementsByName("resubmit");
    resubmitCheck[0].value = "No";
    resubmitCheck[1].checked = true;
    for (let key in fields) {
      if (fields.hasOwnProperty(key)) {
        let fieldValue = fields[key];
        if (key === "fname") {
          document.getElementById("firstn").value = fieldValue;
        }
        if (key === "lname") {
          document.getElementById("lastn").value = fieldValue;
        }
        if (key === "gender") {
          let genderInp = document.getElementsByName("gender");
          fieldValue === "Male" || fieldValue === "male"
            ? (genderInp[1].checked = true)
            : (genderInp[0].checked = true);
        }
        if (key === "last4ssn") {
          document.getElementsByName("ssn")[0].value = fieldValue;
        }
        if (key === "street") {
          document.getElementById("address").value = fieldValue;
        }
        if (key === "city") {
          document.getElementById("city").value = fieldValue;
        }
        if (key === "state") {
          fieldValue = getStateAbriviaiton(fieldValue);
          document.getElementById("state").value = fieldValue;
        }
        if (key === "zip") {
          document.getElementById("zip").value = fieldValue;
        }
        if (key === "bday") {
          let dobField = document.getElementById("dob");
          fieldValue = new Date(fieldValue).toISOString();
          let field = fieldValue.split("T")[0];
          field = field.split("-");
          let year = field[0],
            month = field[1],
            day = field[2];
          let dob = `${month}/${day}/${year}`;
          if (dobField.value === "") {
            document.getElementById("dob").value = dob;
          }
        }
        if (key === "birthplace") {
          document.getElementById("pob").value = fieldValue;
        }
        if (key === "mname") {
          document.getElementById("MI").value = fieldValue;
        }
      }
    }
    let submitBtn = document.getElementById("subbut");
    submitBtn.click();
  } catch (err) {
    let desc = `${err.toString()} in populateAhsFormFields() in Content Script`;
    console.log(desc);
  }
}
/*
 * Submit the verification form
 */
function submitVerificationForm() {
  try {
    let btnContainer = document.getElementsByClassName("verify")[0];
    let btn = document.createElement("button");

    let btnFetch = document.createElement("button");
    btn.innerText = "Verify";
    btnFetch.innerText = "Fetch AHS Status";
    btn.className = "btn-verify";
    btnFetch.className = "btn-verify";
    btn.id = "verifybtn";
    btnFetch.id = "fetchbtn";
    btn.style.width = "132px";
    btnContainer.appendChild(btn);
    btnContainer.appendChild(btnFetch);

    document
      .getElementById("verifybtn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        let last4ssn = document.getElementById("last4ssn").value;
        let ssn = document.getElementById("ssn").value;
        let email = document.getElementById("email").value;

        let zip = document.getElementById("zip").value;

        let bday = document.getElementById("bday").value;
        if (!bday) {
          alert("Please fill out all fields");
        } else {
          if (
            document.getElementById("fname").value &&
            document.getElementById("lname").value &&
            document.getElementById("mname").value &&
            // document.getElementById("altfname1").value &&
            // document.getElementById("altlname1").value &&
            // document.getElementById("altfname2").value &&
            // document.getElementById("altlname2").value &&
            document.getElementById("ssn").value &&
            last4ssn &&
            document.getElementById("street").value &&
            document.getElementById("city").value &&
            document.getElementById("city2").value &&
            document.getElementById("state").value &&
            document.getElementById("state2").value &&
            document.getElementById("country").value &&
            zip &&
            document.getElementById("keyword").value &&
            bday &&
            (document.getElementById("male").checked === true ||
              document.getElementById("female").checked === true ||
              document.getElementById("other").checked === true)
          ) {
            if (
              email.length > 1 &&
              email.includes("@") &&
              email.includes(".")
            ) {
              if (zip.length === 5 && !isNaN(zip) && zip > 0) {
                if (ssn <= 0 || last4ssn <= 0) {
                  alert("Please enter a valid SSN");
                } else {
                  if (last4ssn.length === 4 && !isNaN(last4ssn)) {
                    let today = new Date();
                    let bdayDate = new Date(bday);
                    if (bdayDate > today) {
                      alert("Birthdate cannot be in the future");
                    } else {
                      let gender =
                        document.getElementById("male").checked === true
                          ? "male"
                          : "female";
                      // is using female fine instead of empty string?
                      let id = document.getElementById("user_id").value;
                      if (id) {
                        // => if id exists, then saving it for the pdf documents to be sent against this id
                        // => if id doesn't exist, then it's a new user and we don't need to save it, because id will be generated by the server
                        // => if the user loads an existing data, then changes the ssn and presses submit, then the id will be saved, but we need new id for the pdf documents
                        //       in this case, since the ssn is changed, it is considered as a new userData, and it be overwritten by the id received from the server
                        chrome.storage.sync.set(
                          {
                            id: document.getElementById("user_id").value,
                          },
                          function () {
                            console.log("id set");
                          }
                        );
                      }
                      chrome.storage.sync.set(
                        {
                          source: {
                            fname: document.getElementById("fname").value,
                            lname: document.getElementById("lname").value,
                            gender: gender,
                            mname: document.getElementById("mname").value,
                            altfname1:
                              document.getElementById("altfname1").value,
                            altlname1:
                              document.getElementById("altlname1").value,
                            altfname2:
                              document.getElementById("altfname2").value,
                            altlname2:
                              document.getElementById("altlname2").value,
                            ssn: document.getElementById("ssn").value,
                            last4ssn: document.getElementById("last4ssn").value,
                            street: document.getElementById("street").value,
                            city: document.getElementById("city").value,
                            state: document.getElementById("state").value,
                            zip: document.getElementById("zip").value,
                            keyword: document.getElementById("keyword").value,
                            birthplace: `${
                              document.getElementById("city2").value
                            }, ${document.getElementById("state2").value}, ${
                              document.getElementById("country").value
                            }`,
                            bday: document.getElementById("bday").value,
                            email: document.getElementById("email").value,
                          },
                        },
                        function () {
                          console.log("data saved");
                          chrome.storage.sync.get(
                            ["source"],
                            function (result) {
                              console.log("saved data: ", result.source);
                              clearVerificationFields();
                            }
                          );
                          postData();
                        }
                      );
                      chrome.storage.sync.remove("ahsData", function () {
                        console.log("ahsData removed");
                      });
                      // chrome.tabs.create({
                      //   url: `https://secure.vermont.gov/DPS/criminalrecords/subscriber?email=${email}`,
                      // });

                      window.open(
                        `https://secure.vermont.gov/DPS/criminalrecords/subscriber?email=${email}&name=${
                          document.getElementById("fname").value
                        }`,
                        "_blank"
                      );
                      chrome.tabs.query(
                        { active: true, currentWindow: true },
                        function (tabs) {
                          chrome.tabs.executeScript(
                            tabs[0].id,
                            { file: "content-script.js" },
                            function (result) {
                              console.log(result);
                            }
                          );
                        }
                      );
                    }
                  } else {
                    alert("Please enter a valid last 4 digits of SSN");
                  }
                }
              } else {
                alert("Please enter a valid zip code");
              }
            } else {
              alert("Please enter a valid email address");
            }
          } else {
            alert("Please fill out all fields");
          }
        }
      });
    document.getElementById("fetchbtn").addEventListener("click", function (e) {
      e.preventDefault();
      let created_at = document.getElementById("created_at").value;
      let date = new Date(created_at);
      let yyyy = date.getFullYear();

      let mm = date.getMonth() + 1;
      if (mm < 10) {
        mm = "0" + mm;
      }
      let dd = date.getDate();
      let dateString = `${yyyy}-${mm}-${dd}`;
      let last4ssn = document.getElementById("last4ssn").value;
      let ssn = document.getElementById("ssn").value;
      let email = document.getElementById("email").value;

      let zip = document.getElementById("zip").value;

      let bday = document.getElementById("bday").value;
      if (!bday) {
        alert("Please fill out all fields");
      } else {
        if (
          document.getElementById("fname").value &&
          document.getElementById("lname").value &&
          document.getElementById("mname").value &&
          document.getElementById("user_id").value &&
          // document.getElementById("altfname1").value &&
          // document.getElementById("altlname1").value &&
          // document.getElementById("altfname2").value &&
          // document.getElementById("altlname2").value &&
          document.getElementById("ssn").value &&
          last4ssn &&
          document.getElementById("street").value &&
          document.getElementById("city").value &&
          document.getElementById("city2").value &&
          document.getElementById("state").value &&
          document.getElementById("state2").value &&
          document.getElementById("country").value &&
          zip &&
          document.getElementById("keyword").value &&
          bday &&
          (document.getElementById("male").checked === true ||
            document.getElementById("female").checked === true ||
            document.getElementById("other").checked === true)
        ) {
          if (email.length > 1 && email.includes("@") && email.includes(".")) {
            if (zip.length === 5 && !isNaN(zip) && zip > 0) {
              if (ssn <= 0 || last4ssn <= 0) {
                alert("Please enter a valid SSN");
              } else {
                if (last4ssn.length === 4 && !isNaN(last4ssn)) {
                  let today = new Date();
                  let bdayDate = new Date(bday);
                  if (bdayDate > today) {
                    alert("Birthdate cannot be in the future");
                  } else {
                    // let gender =
                    //   document.getElementById("male").checked === true
                    //     ? "male"
                    //     : "";
                    if (created_at) {
                      chrome.storage.sync.set(
                        {
                          ahsData: {
                            fname: document.getElementById("fname").value,
                            lname: document.getElementById("lname").value,
                            subFname: "Moe",
                            subLname: "B",
                            created_at: dateString,
                          },
                        },
                        function () {
                          console.log(
                            "Value is set to " +
                              document.getElementById("fname").value
                          );
                        }
                      );
                      chrome.storage.sync.set(
                        {
                          id: document.getElementById("user_id").value,
                        },
                        function () {
                          console.log("id set");
                        }
                      );
                      // remove source from storage
                      chrome.storage.sync.remove("source", function () {
                        console.log("source removed");
                      });
                      window.open(
                        `https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm`,
                        "_blank"
                      );
                      // get current tab and execute script
                      chrome.tabs.query(
                        { active: true, currentWindow: true },
                        function (tabs) {
                          chrome.tabs.executeScript(
                            tabs[0].id,
                            { file: "content_script.js" },
                            function (result) {
                              console.log(result);
                            }
                          );
                        }
                      );
                    } else {
                      alert(
                        "You need to perform the initial search first by pressing the Verify Button"
                      );
                    }
                  }
                } else {
                  alert("Please enter a valid last 4 digits of SSN");
                }
              }
            } else {
              alert("Please enter a valid zip code");
            }
          } else {
            alert("Please enter a valid email address");
          }
        } else {
          alert("Please fill out all fields");
        }
      }
    });
  } catch (err) {
    let desc = `${err.toString()} in submitVerificationForm() in Content Script`;
    console.log(desc);
  }
}

/*
 * Fill the Order Applicant form
 */
function fillApplicantForm() {
  try {
    chrome.storage.sync.get(["source"], function (result) {
      console.log("here");
      if (result.source) {
        console.log(result.source);
        document.getElementById("name.firstName").value = result.source.fname;
        document.getElementById("name.lastName").value = result.source.lname;
        document.getElementById("name.middleName").value = result.source.mname;
        if (
          result.source.altfname1 &&
          result.source.altlname1 &&
          result.source.altfname2 &&
          result.source.altlname2
        ) {
          document.getElementById("aliases0.name.firstName").value =
            result.source.altfname1;
          document.getElementById("aliases0.name.lastName").value =
            result.source.altlname1;
          // click button with name add-alias
          document.getElementsByName("add-alias")[0].click();
          document.getElementById("aliases1.name.firstName").value =
            result.source.altfname2;
          document.getElementById("aliases1.name.lastName").value =
            result.source.altlname2;
        }
        document.getElementById("ssn").value = result.source.ssn;
        // document.getElementById("last4ssn").value = result.source.last4ssn;
        document.getElementById("currentAddress.street").value =
          result.source.street;
        document.getElementById("currentAddress.city").value =
          result.source.city;
        // document.getElementById("city2").value = result.source.birthplace;
        // document.getElementById("state").value = result.source.state;
        // document.getElementById("state2").value = result.source.birthplace;
        // find and select country from select list in option groups

        let countrySelect = document.getElementById(
          "currentAddress.country.countryId"
        );
        for (let i = 0; i < countrySelect.options.length; i++) {
          if (
            countrySelect.options[i].text ===
            result.source.birthplace.split(", ")[2]
          ) {
            countrySelect.selectedIndex = i;
            break;
          }
        }
        let stateSelect = document.getElementById(
          "currentAddress.state.stateId"
        );
        let internationalState = document.getElementById(
          "currentAddress.internationalState"
        );
        if (stateSelect) {
          for (let i = 0; i < stateSelect.options.length; i++) {
            if (stateSelect.options[i].text === result.source.state) {
              stateSelect.selectedIndex = i;
              break;
            }
          }
        }
        if (internationalState) {
          internationalState.value = result.source.state;
        }

        document.getElementById("currentAddress.zipCode").value =
          result.source.zip;
        // document.getElementById("keyword").value = result.source.keyword;
        document.getElementById("contactInformation.emailAddress").value =
          result.source.email;
        document.getElementById("dob").value = result.source.bday;

        // setTimeout(() => {
        //   chrome.storage.sync.remove("source");
        //   chrome.storage.sync.remove("fields");
        // }, 1000);
      }
    });
  } catch (err) {
    let desc = `${err.toString()} in fillApplicantForm() in Content Script`;
    console.log(desc);
  }
}
/**
 * search the exculsion website
 */

function searchExclusion() {
  chrome.storage.sync.get(["fields"], function (result) {
    let { fields } = result;
    populateExclusionLogin(fields);
  });
}

// perform google search with fname, lname, state, city, and keyword from source
function searchGoogle(fields) {
  try {
    let searchInputGoogle = document.getElementsByClassName("gLFyf gsfi")[0];
    searchInputGoogle.value = `${fields.fname} ${fields.lname} ${fields.state} ${fields.city} ${fields.keyword}`;
    document.getElementsByClassName("gNO89b")[0].click();
  } catch (err) {
    let desc = `${err.toString()} in searchGoogle() in Content Script`;
    console.log(desc);
  }
}

function loginClientConnect() {
  try {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let loginButton = document.getElementsByClassName("btn btn-primary")[0];
    loginButton.click();
    setTimeout(() => {
      let searchInputGoogle = document.getElementsByClassName("gLFyf gsfi")[0];
      searchInputGoogle.value = `${email} ${password}`;
      document.getElementsByClassName("gNO89b")[0].click();
    }, 1000);
  } catch (err) {
    let desc = `${err.toString()} in loginClientConnect() in Content Script`;
    console.log(desc);
  }
}

/**
 * populate the exclusion login form
 * @param {array} fieldsArr | form fields array
 */

function populateExclusionLogin(fields) {
  try {
    if (
      document.getElementsByTagName("h2")[0].innerText === "Service Unavailable"
    ) {
      navigate("https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm");
    } else {
      for (let key in fields) {
        if (fields.hasOwnProperty(key)) {
          let fieldValue = fields[key];
          if (key === "fname") {
            document.getElementById("ctl00_cpExclusions_txtSPFirstName").value =
              fieldValue;
          }
          if (key === "lname") {
            document.getElementById("ctl00_cpExclusions_txtSPLastName").value =
              fieldValue;
          }
        }
      }
      let submitBtn = document.getElementById("ctl00_cpExclusions_ibSearchSP");
      submitBtn.click();
    }
  } catch (err) {
    let desc = `${err.toString()} in populateExclusionLogin() in Content Script`;
    console.log(desc);
  }
}

/**
 * post the exclusion record to the jazz hr
 */

async function sendExclusionRecord() {
  // const conversion = async () => {

  // };
  console.log("came in exclusion");

  try {
    let captureElement = document.getElementsByTagName("body")[0];

    const opt = {
      margin: 0,
      filename: "oig.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      enableLinks: false,
      jsPDF: {
        orientation: "p",
        unit: "mm",
        format: "tabloid",
        putOnlyUsedFonts: true,
        floatPrecision: 16, // or "smart", default is 16
      },
      html2canvas: {
        // dpi: 300,
        // letterRendering: true,
        useCORS: true,
      },
    };
    await html2pdf().from(captureElement).set(opt).save();
    await html2pdf()
      .from(captureElement)
      .set(opt)
      .outputPdf()
      .then(function (pdf) {
        let doc = { oig: btoa(pdf) };
        postDocument(doc);
      });
    navigate("https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm");
    // let exclusionDiv = document.getElementById("ctl00_cpExclusions_pnlEmpty");
    // if (exclusionDiv) {
    //   try {
    //     conversion();
    //     navigate("https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm");
    //   } catch (err) {
    //     let desc = `${err.toString()} in sendExclusionRecord() in Content Script`;
    //     console.log(desc);
    //   }
    // } else {
    //   try {
    //     conversion();
    //     navigate("https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm");
    //   } catch (err) {
    //     console.log("err: ", err);
    //   }
    // }
  } catch (err) {
    let desc = `${err.toString()} in sendExclusionRecord() in Content Script`;
    console.log(desc);
  }
}

// /**
//  * search sam website
//  */

// function searchSam() {
// 	chrome.storage.sync.get(['fields'], function (result) {
// 		let { fields } = result;
// 		populateSamFormFields(fields);
// 	});
// }

/**
 * populate the sam form fields
 */
function populateNewSamFormFields(fields) {
  setTimeout(() => {
    try {
      document.querySelector("#usa-accordion-item-5-header > button").click();

      for (let key in fields) {
        if (fields.hasOwnProperty(key)) {
          let fieldValue = fields[key];
          if (key === "fname") {
            document.getElementById("firstname").value = fieldValue;
            document
              .getElementById("firstname")
              .dispatchEvent(new CustomEvent("input", { bubbles: true }));
          }
          if (key === "lname") {
            document.getElementById("lastname").value = fieldValue;
            document
              .getElementById("lastname")
              .dispatchEvent(new CustomEvent("input", { bubbles: true }));
          }
          if (key === "ssn") {
            document.getElementById("ssn").value = fieldValue;
            document
              .getElementById("ssn")
              .dispatchEvent(new CustomEvent("input", { bubbles: true }));
          }
        }
      }

      setTimeout(() => {
        document
          .querySelector("#usa-accordion-item-5")
          .getElementsByTagName("button")[0]
          .click();
        setTimeout(async () => {
          if (
            document
              .getElementsByTagName("sds-search-result-list")[0]
              ?.children[0].getElementsByTagName("a")[0]
          ) {
            document
              .getElementsByTagName("sds-search-result-list")[0]
              .children[0].getElementsByTagName("a")[0]
              .click();
          } else {
            let captureElement = document.getElementsByTagName("body")[0];
            let width = captureElement.scrollWidth;
            let height = captureElement.scrollHeight;
            const opt = {
              margin: 0,
              filename: "sam.pdf",
              image: { type: "jpeg", quality: 1 },
              html2canvas: { scale: 1 },
              enableLinks: false,
              jsPDF: {
                orientation: "l",
                unit: "in",
                format: "tabloid",
                putOnlyUsedFonts: true,
                floatPrecision: 16, // or "smart", default is 16
              },
              html2canvas: {
                // dpi: 300,
                // letterRendering: true,
                height: height,
                width: width,
                useCORS: true,
              },
            };

            await html2pdf().from(captureElement).set(opt).save();
            await html2pdf()
              .from(captureElement)
              .set(opt)
              .outputPdf()
              .then(function (pdf) {
                let doc = { sam: btoa(pdf) };
                postDocument(doc);
                navigate("https://www.google.com");
              });
            return;
          }
        }, 2000);
      }, 3000);
    } catch (err) {
      let desc = `${err.toString()} in populateSamFormFields() in Content Script`;
      console.log(desc);
    }
  }, 3000);
}

/**
 * This function sends message to background
 * to post record retreived from the verification website
 * @param {string} record | record to be posted
 * @param {string} siteName | name of site from which record was verified
 *  @param {string} redirect | site on to which redirect upon record successfully posted
 */

function navigate(redirect) {
  window.location.href = redirect;
}
/**
 * This function sends message to background to send the data to the server
 */
function postData() {
  chrome.storage.sync.get(["source"], function (result) {
    try {
      let data = result.source;
      chrome.runtime.sendMessage(
        { baseUrl, bearerToken, data, type: "postData" },
        function (response) {
          if (response?.data?.id) {
            chrome.storage.sync.set(
              {
                id: response.data.id,
              },
              function () {
                console.log("id set");
                return true;
              }
            );
          }
        }
      );
    } catch (err) {
      let desc = `${err.toString()} in postData() in Content Script`;
      console.log(desc);
    }
  });
}
/**
 * This function sends message to background to send the document to the server
 */
async function postDocument(doc) {
  chrome.storage.sync.get(["id"], function (result) {
    try {
      let id = result.id;
      chrome.runtime.sendMessage(
        { baseUrl, bearerToken, doc, id, type: "postDoc" },
        function (response) {
          console.log("response: ", response);
        }
      );
    } catch (err) {
      let desc = `${err.toString()} in postDocument() in Content Script`;
      console.log(desc);
    }
  });
}
/**
 * this function sets candidates details and populates the date range field of Ahs record fetch
 * @param {string} prospectEmail | applicant id of candidate
 * @param {string} name | name of the candidate
 */

function fetchAhsRequestDetails(data) {
  if (data) {
    let fromDate = formatAhsDate(data.created_at);
    let toDate = formatAhsDate(new Date());
    populateAhsDate(fromDate, toDate);
  }
}

/**
 * this function formats the date time into MM-DD-YYYY format
 * @param {date-time} datetime
 */

function formatAhsDate(datetime) {
  datetime = new Date(datetime).toISOString();
  let field = datetime.split("T")[0];
  field = field.split("-");
  // 06/11/1992
  let year = field[0],
    month = field[1],
    day = field[2];
  return `${month}-${day}-${year}`;
}

/**
 * this function populates to and from date of the Ahs website
 * @param {date-string} from
 * @param {date-string} to
 */

function populateAhsDate(from, to) {
  chrome.storage.sync.get(["ahsData"], function (result) {
    try {
      let { ahsData } = result;
      if (ahsData) {
        let fromInp = document.getElementsByName("from_dt")[0];
        fromInp.value = from;
        let toInp = document.getElementsByName("to_dt")[0];
        toInp.value = to;
        let submitBtn = document.getElementsByName("submit")[0];
        submitBtn.click();
      }
    } catch (err) {
      let desc = `${err.toString()} in populateAhsDate() in Content Script`;
      console.log(desc);
    }
  });
}

/**
 * this function searches for the ahs records table by name
 */

function searchAhsRecord() {
  chrome.storage.sync.get(["ahsData"], function (result) {
    try {
      let { fname, lname, subFname, subLname } = result.ahsData;
      if (fname) {
        console.log("went in fname");
        let nameRows = document.querySelectorAll("[nowrap]");
        let recordFound = false;
        let firstName = fname;
        let lastName = lname;
        let subFirstname = subFname;
        let subLastname = subLname;
        let name = `${lastName}, ${firstName}`;
        let recordVerify = { child: false, adult: false };
        for (let i = 0; i < nameRows.length; i++) {
          if (
            nameRows[i].innerText.includes(name) &&
            nameRows[i].parentNode.cells[2].innerText.includes(
              `${subFirstname} ${subLastname}`
            )
          ) {
            chrome.storage.sync.set({
              firstName,
              lastName,
            });
            let rowMatched = nameRows[i].parentNode;
            let recordsRow = rowMatched.getElementsByTagName("a");
            recordsRow.length === 0
              ? (recordFound = false)
              : (recordFound = true);
            if (recordsRow.length > 0) {
              for (let i = 0; i < recordsRow.length; i++) {
                const urlParams = new URLSearchParams(recordsRow[i].href);
                const recordType = urlParams.get("RegistryRecordTypeID");
                if (recordType === "6") {
                  recordVerify.adult = true;
                }
                if (recordType === "7") {
                  recordVerify.child = true;
                }
              }
              chrome.storage.sync.set({
                ahsRecord: recordVerify,
              });
              if (recordsRow.length === 2) {
                if (recordVerify.adult === true) {
                  window.location.href = recordsRow[0].href;
                }
              } else {
                const urlParams = new URLSearchParams(recordsRow[0].href);
                const recordType = urlParams.get("RegistryRecordTypeID");
                if (recordType === "6") {
                  window.location.href = recordsRow[0].href;
                } else if (recordType === "7") {
                  window.location.href = recordsRow[1].href;
                } else {
                }
                vNotify.error({ text: "One Record is under process" });
                alert("One Record is under process");
                setTimeout(() => {
                  window.close();
                }, 5000);
              }
              break;
            }
          }
        }
        if (!recordFound) {
          vNotify.error({ text: "No record found" });
          alert("No record found");
          setTimeout(() => {
            chrome.storage.sync.remove("ahsData");
            window.close();
          }, 3000);
        }
      }
    } catch (err) {
      let desc = `${err.toString()} in searchAhsRecord() in Content Script`;
      console.log(desc);
    }
  });
}

/**
 * this function sends message to background to post the ahs adult record of candidate
 */

function postAhsAdultRecord() {
  chrome.storage.sync.get(["ahsRecord"], async function (result) {
    try {
      let { child } = result.ahsRecord;
      let { search } = window.location;
      const urlParams = new URLSearchParams(search);
      let requestId = urlParams.get("requestID");
      let redirectUrl = `https://www.ahsnet.ahs.state.vt.us/ABC/show_clears.cfm?requestID=${requestId}&RegistryRecordTypeID=7`;

      let captureElement = document.getElementsByTagName("body")[0];

      const opt = {
        margin: 0,
        filename: "ahs_adult.pdf",
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2 },
        enableLinks: false,
        jsPDF: {
          orientation: "p",
          unit: "mm",
          format: "tabloid",
          putOnlyUsedFonts: true,
          floatPrecision: 16, // or "smart", default is 16
        },
        html2canvas: {
          // dpi: 300,
          // letterRendering: true,
          useCORS: true,
        },
      };
      await html2pdf().from(captureElement).set(opt).save();

      await html2pdf()
        .from(captureElement)
        .set(opt)
        .outputPdf()
        .then(function (pdf) {
          let doc = { ahs_adult: btoa(pdf) };
          postDocument(doc);
        });
      if (child) {
        window.location.href = redirectUrl;
      } else {
        setTimeout(() => {
          chrome.storage.sync.remove("ahsData");
          chrome.storage.sync.remove("ahsRecord");
          window.close();
        }, 3000);
      }
    } catch (err) {
      let desc = `${err.toString()} in postAhsAdultRecord() in Content Script`;
      console.log(desc);
    }
  });
}

/**
 * this function sends message to background to post the ahs child record of candidate
 */

async function postAhsChildRecord() {
  try {
    let captureElement = document.getElementsByTagName("body")[0];

    const opt = {
      margin: 0,
      filename: "ahs_child.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      enableLinks: false,
      jsPDF: {
        orientation: "p",
        unit: "mm",
        format: "tabloid",
        putOnlyUsedFonts: true,
        floatPrecision: 16, // or "smart", default is 16
      },
      html2canvas: {
        // dpi: 300,
        // letterRendering: true,
        useCORS: true,
      },
    };
    await html2pdf().from(captureElement).set(opt).save();

    await html2pdf()
      .from(captureElement)
      .set(opt)
      .outputPdf()
      .then(function (pdf) {
        let doc = { ahs_child: btoa(pdf) };
        postDocument(doc);
        setTimeout(() => {
          chrome.storage.sync.remove("ahsRecord");
          chrome.storage.sync.remove("ahsData");
          window.close();
        }, 3000);
      });
  } catch (err) {
    let desc = `${err.toString()} in postAhsChildRecord() in Content Script`;
    console.log(desc);
  }
}

/**
 * this function performs the sign in process to otes.okta.com
 * */

const signInOkta = () => {
  console.log("trying signin");

  if (document.getElementById("okta-signin-submit")) {
    if (document.getElementById("okta-signin-username")) {
      document.getElementById("okta-signin-username").value =
        "m@tlcnursing.com";
    }
    if (document.getElementById("okta-signin-password")) {
      document.getElementById("okta-signin-password").value = "Williston1550!";
    }
    document.getElementById("okta-signin-submit").click();
  }
  if (document.getElementById("idp-discovery-submit")) {
    if (document.getElementById("idp-discovery-username")) {
      document.getElementById("idp-discovery-username").value =
        "m@tlcnursing.com";
    }
    if (document.getElementById("idp-discovery-password")) {
      document.getElementById("idp-discovery-password").value =
        "Williston1550!";
    }
    document.getElementById("idp-discovery-submit").click();
  }
  if (document.getElementById("form18")) {
    document.getElementById("form18").submit();
  }

  // let buttonBar = document.getElementsByClassName("o-form-button-bar")[0];
  // if (buttonBar) {
  //   buttonBar.click();
  // }
};
