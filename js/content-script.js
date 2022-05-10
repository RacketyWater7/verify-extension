/**
 * Generates the pdf of body content
 * @param {string} fileName
 * @param {string} orientation
 * @param {string} unit
 * @returns pdf file
 */
async function generateAndSavePdf(fileName, orientation, unit) {
  try {
    const image = document.getElementsByClassName("sds-header__logo")[0];
    if (image) {
      // editing the SAM logo to add width and height
      fetch(image.src)
        .then((res) => res.text())
        .then((data) => {
          const parser = new DOMParser();
          const svg = parser
            .parseFromString(data, "image/svg+xml")
            .querySelector("svg");

          if (image.id) svg.id = image.id;
          if (image.className) svg.classList = image.classList;
          svg.setAttribute("x", "0");
          svg.setAttribute("y", "0");
          svg.setAttribute("width", "200");
          svg.setAttribute("height", "50");
          let aTag = image.parentNode;
          let header = image.parentNode.parentNode;
          aTag.parentNode.removeChild(aTag);
          header.appendChild(svg);
        });
      await sleep(2000);
    }
    let captureElement = document.getElementsByTagName("body")[0];

    const opt = {
      margin: 0,
      filename: `${fileName}`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 1 },
      enableLinks: false,

      jsPDF: {
        orientation: `${orientation}`,
        unit: `${unit}`,
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
    const pdf = await html2pdf().from(captureElement).set(opt).outputPdf();
    return pdf;
  } catch (error) {
    const desc = `${error.toString()} in generateAndSavePdf() in Content Script`;
    console.log(desc);
  }
}

/**
 *
 * @param {number} ms
 * @returns promise
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let baseUrl = "";
let bearerToken = "";

window.onload = function () {
  fetchApiKey();
};

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
      } else {
        vNotify.error({ text: "Set API Url" });
      }
    } catch (err) {
      let desc = `${err.toString()} in fetchApiKey() in Content Script`;
      console.log(desc);
    }
  });
}
// Main Function
/**
 * check for the pathname and follow up functions execution
 */
// https://secure.vermont.gov/DPS/criminalrecords/subscriber/request.php
function init() {
  // below code and hashchange listener is for the case when user is on the React app of extension
  appUrlDetection();
  window.addEventListener(
    "hashchange",
    function () {
      appUrlDetection();
    },
    false
  );

  try {
    let { pathname, search } = window.location;
    console.log(`pathname`, pathname);

    // the below pathname is seperated from switch case because this path has a token in it,
    //      which keeps changing, hence we're using .includes() to target the static path
    if (pathname.includes("/signin/refresh-auth-state")) {
      chrome.storage.sync.get(["source"], function (result) {
        if (result && result.source) {
          signInOkta();
        }
      });
    }

    switch (pathname) {
      case "/DPS/criminalrecords/subscriber/": {
        if (search.includes("email")) {
          email = "m@tlcnursing.com";
          password = "1550Williston!";
          populateLoginFields(email, password);
        }
        break;
      }
      case "/DPS/criminalrecords/subscriber/agreement.php": {
        chrome.storage.sync.get(["source"], function (result) {
          // console.log(result);
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
        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            populateAhsLoginFields();
          }
        });
        chrome.storage.sync.get(["ahsData"], function (result) {
          if (result && result.ahsData) {
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
            sendExclusionRecord();
          }
        });

        break;
      }
      //sam search
      case "/search/": {
        let closeBtn = document.querySelector(
          "button.close-btn.ng-tns-c66-1.ng-star-inserted"
        );
        if (closeBtn) {
          closeBtn.click();
        }

        chrome.storage.sync.get(["source"], function (result) {
          if (result && result.source) {
            chrome.storage.sync.get(["fields"], function (result) {
              let { fields } = result;

              populateNewSamFormFields(fields);
            });
          } else {
            // console.log(`result`, result);
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
              const pdf = await generateAndSavePdf("google.pdf", "l", "in");
              let doc = { google: btoa(pdf) };
              postDocument(doc);
              await sleep(2000);

              window.location.href = "https://clientconnect.otes.com/login";
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
    let desc = `${err.toString()} in populateLoginFields() in Content Script`;
    console.log(desc);
  }
}

/**
 * check all checkboxes on the agreements page
 */
function populateArgreementFields() {
  try {
    // console.log(document.getElementsByName("modification"));
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
        if (source) {
          populateCandidateData(source);
          let submitBtn = document.getElementsByName("Submit")[0];
          submitBtn.click();
        } else {
          vNotify.error({ text: "Applicant not found" });
        }
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
 * App URL detection
 */
function appUrlDetection() {
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
}

/**
 * get conviction record on candidate data submit
 * send request to background page to request the data obtained to api
 */

async function getConvictionRecord() {
  try {
    const pdf = await generateAndSavePdf("vcic.pdf", "p", "mm");
    let doc = { vcic: btoa(pdf) };
    postDocument(doc);
    await sleep(2000);

    window.location.href = "https://exclusions.oig.hhs.gov/";
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
      // console.log(result);
      if (result.ahsPassword != undefined) {
        let firstName = "Moe";
        let lastName = "B";
        let orgId = "CMO023";
        document.getElementsByName("fname")[0].value = firstName;
        document.getElementsByName("lname")[0].value = lastName;
        document.getElementsByName("ID")[0].value = orgId;
        document.getElementsByName("personalPassword")[0].value =
          result.ahsPassword;
        // current = Williston3!
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
        switch (key) {
          case "fname": {
            document.getElementById("firstn").value = fieldValue;
            break;
          }
          case "lname": {
            document.getElementById("lastn").value = fieldValue;
            break;
          }
          case "gender": {
            let genderInp = document.getElementsByName("gender");
            fieldValue === "Male" || fieldValue === "male"
              ? (genderInp[1].checked = true)
              : (genderInp[0].checked = true);
            break;
          }
          case "last4ssn": {
            document.getElementsByName("ssn")[0].value = fieldValue;
            break;
          }
          case "street": {
            document.getElementById("address").value = fieldValue;
            break;
          }
          case "city": {
            document.getElementById("city").value = fieldValue;
            break;
          }
          case "state": {
            fieldValue = getStateAbriviaiton(fieldValue);
            document.getElementById("state").value = fieldValue;
            break;
          }
          case "zip": {
            document.getElementById("zip").value = fieldValue;
            break;
          }
          case "bday": {
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
            break;
          }
          case "birthplace": {
            document.getElementById("pob").value = fieldValue;
            break;
          }
          case "mname": {
            document.getElementById("MI").value = fieldValue;
            break;
          }
          default: {
            break;
          }
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
 * Fill the Order Applicant form
 */
function fillApplicantForm() {
  try {
    chrome.storage.sync.get(["source"], async function (result) {
      if (result.source) {
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
          document.getElementsByName("add-alias")[0].click();
          document.getElementById("aliases1.name.firstName").value =
            result.source.altfname2;
          document.getElementById("aliases1.name.lastName").value =
            result.source.altlname2;
        }
        document.getElementById("ssn").value = result.source.ssn;
        document.getElementById("currentAddress.street").value =
          result.source.street;
        document.getElementById("currentAddress.city").value =
          result.source.city;
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
        document.getElementById("contactInformation.emailAddress").value =
          result.source.email;
        document.getElementById("dob").value = result.source.bday;

        await sleep(1000);
        chrome.storage.sync.remove("source");
        chrome.storage.sync.remove("fields");
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

/**
 * performing google search with fname, lname, state, city, and keyword from source
 *  */
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

async function loginClientConnect() {
  try {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let loginButton = document.getElementsByClassName("btn btn-primary")[0];
    loginButton.click();
    await sleep(1000);
    let searchInputGoogle = document.getElementsByClassName("gLFyf gsfi")[0];
    searchInputGoogle.value = `${email} ${password}`;
    document.getElementsByClassName("gNO89b")[0].click();
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
      window.location.href =
        "https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm";
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
  try {
    const pdf = await generateAndSavePdf("oig.pdf", "p", "mm");
    let doc = { oig: btoa(pdf) };
    postDocument(doc);
    await sleep(2000);
    window.location.href = "https://www.ahsnet.ahs.state.vt.us/ABC/sign_on.cfm";
  } catch (err) {
    let desc = `${err.toString()} in sendExclusionRecord() in Content Script`;
    console.log(desc);
  }
}

/**
 * populate the sam form fields
 */
async function populateNewSamFormFields(fields) {
  await sleep(3000);
  try {
    btnClose = document.getElementsByClassName(
      "close-btn ng-tns-c72-1 ng-star-inserted"
    )[0];
    if (btnClose) {
      btnClose.click();
    }
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
    await sleep(3000);
    document
      .querySelector("#usa-accordion-item-5")
      .getElementsByTagName("button")[0]
      .click();
    await sleep(2000);
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
      const pdf = await generateAndSavePdf("sam.pdf", "l", "in");
      let doc = { sam: btoa(pdf) };
      postDocument(doc);
      await sleep(2000);
      window.location.href = "https://www.google.com";
    }
  } catch (err) {
    let desc = `${err.toString()} in populateSamFormFields() in Content Script`;
    console.log(desc);
  }
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
                // console.log("id set");
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
function postDocument(doc) {
  chrome.storage.sync.get(["id"], function (result) {
    try {
      let id = result.id;
      chrome.runtime.sendMessage(
        { baseUrl, bearerToken, doc, id, type: "postDoc" },
        function (response) {
          // console.log("response: ", response);
        }
      );
    } catch (err) {
      let desc = `${err.toString()} in postDocument() in Content Script`;
      console.log(desc);
    }
  });
  return true;
}
/**
 * this function sets candidates details and populates the date range field of Ahs record fetch
 * @param {string} prospectEmail | applicant id of candidate
 * @param {string} name | name of the candidate
 */

function fetchAhsRequestDetails(data) {
  if (data) {
    let from = new Date(data.created_at);
    // checking if from and current date are the same then minus 1 day from the "from" date
    if (
      from.getDate() === new Date().getDate() &&
      from.getMonth() === new Date().getMonth() &&
      from.getFullYear() === new Date().getFullYear()
    ) {
      from.setDate(from.getDate() - 1);
    }

    let fromDate = formatAhsDate(from);
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
  chrome.storage.sync.get(["ahsData"], async function (result) {
    try {
      let { fname, lname, subFname, subLname } = result.ahsData;
      if (fname) {
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
                await sleep(5000);
                window.close();
              }
              break;
            }
          }
        }
        if (!recordFound) {
          vNotify.error({ text: "No record found" });
          alert("No record found");
          await sleep(3000);
          chrome.storage.sync.remove("ahsData");
          window.close();
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
      const pdf = await generateAndSavePdf("ahs_adult.pdf", "p", "mm");
      let doc = { ahs_adult: btoa(pdf) };
      postDocument(doc);
      await sleep(2000);
      if (child) {
        window.location.href = redirectUrl;
      } else {
        await sleep(3000);
        chrome.storage.sync.remove("ahsData");
        chrome.storage.sync.remove("ahsRecord");
        window.close();
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
    const pdf = await generateAndSavePdf("ahs_child.pdf", "p", "mm");
    let doc = { ahs_child: btoa(pdf) };
    postDocument(doc);

    await sleep(3000);
    chrome.storage.sync.remove("ahsRecord");
    chrome.storage.sync.remove("ahsData");
    window.close();
  } catch (err) {
    let desc = `${err.toString()} in postAhsChildRecord() in Content Script`;
    console.log(desc);
  }
}

/**
 * this function performs the sign in process to otes.okta.com
 * */
const signInOkta = async () => {
  await sleep(2500);
  let idpUsername = document.getElementById("idp-discovery-username");
  let idpSubmit = document.getElementById("idp-discovery-submit");
  if (idpUsername) {
    idpUsername.value = "m@tlcnursing.com";
    idpUsername.dispatchEvent(new CustomEvent("input", { bubbles: true }));
    idpSubmit.click();
  }
  await sleep(4000);
  let oktaPassword = document.getElementById("okta-signin-password");
  let oktaSubmit = document.getElementById("okta-signin-submit");
  if (oktaPassword) {
    oktaPassword.value = "Williston1550!";
    oktaPassword.dispatchEvent(new CustomEvent("input", { bubbles: true }));
    oktaSubmit.click();
  }
};
