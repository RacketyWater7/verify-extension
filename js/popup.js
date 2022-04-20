// document.getElementById("verify").addEventListener("click", function (e) {
//   e.preventDefault();
//   let last4ssn = document.getElementById("last4ssn").value;
//   let ssn = document.getElementById("ssn").value;
//   let email = document.getElementById("email").value;

//   let zip = document.getElementById("zip").value;

//   let bday = document.getElementById("bday").value;
//   if (!bday) {
//     alert("Please fill out all fields");
//   } else {
//     if (
//       document.getElementById("fname").value &&
//       document.getElementById("lname").value &&
//       document.getElementById("mname").value &&
//       document.getElementById("altfname1").value &&
//       document.getElementById("altlname1").value &&
//       document.getElementById("altfname2").value &&
//       document.getElementById("altlname2").value &&
//       document.getElementById("ssn").value &&
//       last4ssn &&
//       document.getElementById("street").value &&
//       document.getElementById("city").value &&
//       document.getElementById("city2").value &&
//       document.getElementById("state").value &&
//       document.getElementById("state2").value &&
//       document.getElementById("country").value &&
//       zip &&
//       document.getElementById("keyword").value &&
//       bday &&
//       (document.getElementById("male").checked === true ||
//         document.getElementById("female").checked === true ||
//         document.getElementById("other").checked === true)
//     ) {
//       if (email.length > 1 && email.includes("@") && email.includes(".")) {
//         if (zip.length === 5 && !isNaN(zip) && zip > 0) {
//           if (ssn <= 0 || last4ssn <= 0) {
//             alert("Please enter a valid SSN");
//           } else {
//             if (last4ssn.length === 4 && !isNaN(last4ssn)) {
//               let today = new Date();
//               let bdayDate = new Date(bday);
//               if (bdayDate > today) {
//                 alert("Birthdate cannot be in the future");
//               } else {
//                 let gender =
//                   document.getElementById("male").checked === true
//                     ? "male"
//                     : "";

//                 chrome.storage.sync.set(
//                   {
//                     source: {
//                       fname: document.getElementById("fname").value,
//                       lname: document.getElementById("lname").value,
//                       gender: gender,
//                       mname: document.getElementById("mname").value,
//                       altfname1: document.getElementById("altfname1").value,
//                       altlname1: document.getElementById("altlname1").value,
//                       altfname2: document.getElementById("altfname2").value,
//                       altlname2: document.getElementById("altlname2").value,
//                       ssn: document.getElementById("ssn").value,
//                       last4ssn: document.getElementById("last4ssn").value,
//                       street: document.getElementById("street").value,
//                       city: document.getElementById("city").value,
//                       state: document.getElementById("state").value,
//                       zip: document.getElementById("zip").value,
//                       keyword: document.getElementById("keyword").value,
//                       birthplace: `${document.getElementById("city2").value}, ${
//                         document.getElementById("state2").value
//                       }, ${document.getElementById("country").value}`,
//                       bday: document.getElementById("bday").value,
//                       email: document.getElementById("email").value,
//                     },
//                   },
//                   function () {
//                     console.log(
//                       "Value is set to " +
//                         document.getElementById("fname").value
//                     );
//                   }
//                 );
//                 chrome.tabs.create({
//                   url: `https://secure.vermont.gov/DPS/criminalrecords/subscriber?email=${email}`,
//                 });
//               }
//             } else {
//               alert("Please enter a valid last 4 digits of SSN");
//             }
//           }
//         } else {
//           alert("Please enter a valid zip code");
//         }
//       } else {
//         alert("Please enter a valid email address");
//       }
//     } else {
//       alert("Please fill out all fields");
//     }
//   }
// });
