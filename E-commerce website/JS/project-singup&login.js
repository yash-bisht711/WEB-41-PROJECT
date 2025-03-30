import { auth, db } from "./firebase_auth.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged ,
  signOut
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

import {
  collection,
  setDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

/*document.addEventListener('DOMContentLoaded', () => {
  let login = document.getElementById('login_btn')
  let signup = document.getElementById('signup_btn')
  let vendors_signin_btn = document.getElementById("vendors_signup_btn")
  let vendor_login_btn = document.getElementById('vendors_login_btn')

  let login_check = false

  if (login) {
    login.addEventListener('click', async () => {
      let Email = document.getElementById('email').value
      let password = document.getElementById('password').value

      try {
        await signInWithEmailAndPassword(auth, Email, password)
        window.location.href
      } catch (error) {
        alert(error.message)
      }
    })
  }

  if (signup) {
    signup.addEventListener('click', async () => {
      let Email = document.getElementById('email').value
      let password = document.getElementById('password').value
      let Name = document.getElementById('name').value
      try {
        let userCredentials = await createUserWithEmailAndPassword(auth, Email, password)
        console.log(userCredentials.user)
        await setDoc(doc(db, "users", userCredentials.user.uid), {
          Name,
          Email,
        })
        window.location.href = "login.html"
      } catch (error) {
        alert(error.message,error.code)
      }
    })
  }

  if (vendors_signin_btn) {
    vendors_signin_btn.addEventListener('click', async () => {
      let email = document.getElementById('vendor_email').value;
      let password = document.getElementById('vendor_password').value;
      let name = document.getElementById('vendor_name').value;
      let mobile = document.getElementById('vendor_mobile').value;
      let shopName = document.getElementById('vendor_shop-name').value;

      try {
        let userCredentials = await createUserWithEmailAndPassword(auth, email, password);
        console.log(userCredentials);

        await setDoc(doc(db, "vendor", userCredentials.user.uid), {
          Name: name,
          Email: email,
          Mobile: mobile,
          ShopName: shopName,
        });

        window.location.href = "dashboard.html";
      } catch (error) {
        alert(error.message);
      }
    });
  }

  if(vendor_login_btn){
    vendor_login_btn.addEventListener('click', async () => {
      let Email = document.getElementById('vendor_email').value
      let password = document.getElementById('vendor_password').value

      try {
        await signInWithEmailAndPassword(auth, Email, password)
        window.location.href="dashboard.html"
      } catch (error) {
        alert(error.message)
      }
    })
  }
})

// let timer
// let container = document.getElementById('product-list')
// document.getElementById('search-bar').addEventListener('input',async (event)=>{
  
// })
console.log() */

document.addEventListener("DOMContentLoaded", () => {
  let signup_btn = document.getElementById("signup_btn");
  let login_btn = document.getElementById("login_btn");
  let vendors_signup_btn = document.getElementById("vendors_signup_btn");

  if (signup_btn) {
    document
      .getElementById("signup_btn")
      .addEventListener("click", async () => {
        let name = document.getElementById("name").value;
        let pwd = document.getElementById("password").value;
        let email = document.getElementById("email").value;
        console.log(name, email, pwd);

        try {
          let userCredentials = await createUserWithEmailAndPassword(
            auth,
            email,
            pwd
          );
          console.log(userCredentials.user);
          await setDoc(doc(db, "users", userCredentials.user.uid), {
            name,
            email,
          });
          window.location.href = "login-user.html";
        } catch (error) {
          alert(error.message);
        }
      });
  }

  if (login_btn) {
    login_btn.addEventListener("click", async () => {
      let email = document.getElementById("email").value;
      let pwd = document.getElementById("password").value;

      try {
        let userCredentials = await signInWithEmailAndPassword(
          auth,
          email,
          pwd
        );
        console.log("Logged in user:", userCredentials.user);

        let list_vendors = await getDoc(
          doc(db, "vendors", userCredentials.user.uid)
        );
        let list_users = await getDoc(
          doc(db, "users", userCredentials.user.uid)
        );

        if (list_users.exists()) {
          console.log("User found:", list_users.data().name, "(user)");
          window.location.href='home-page.html'
        }

        if (list_vendors.exists()) {
          console.log(
            "Vendor found:",
            list_vendors.data().vendor_name,
            "(seller)"
          );
          let data = list_vendors.data();
          console.log(data)
          window.location.href = "dashboard.html";
          displayVendorInfo(data);
        } else {
          console.log("No vendor document found");
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }

  console.log("hello");

  if (vendors_signup_btn) {
    vendors_signup_btn.addEventListener("click", async () => {
      let vendor_name = document.getElementById("vendor_name").value;
      let vendor_email = document.getElementById("vendor_email").value;
      let vendor_mobile = document.getElementById("vendor_mobile").value;
      let vendor_shop_name = document.getElementById("vendor_shop-name").value;
      let vendor_password = document.getElementById("vendor_password").value;
      let vendor_image = document.getElementById('vendor-image')

      console.log(
        vendor_name,
        vendor_email,
        vendor_mobile,
        vendor_shop_name,
        vendor_password
      );

      try {
        let userCredentials = await createUserWithEmailAndPassword(
          auth,
          vendor_email,
          vendor_password
        );
        console.log(userCredentials.user);
        await setDoc(doc(db, "vendors", userCredentials.user.uid), {
          vendor_name,
          vendor_email,
          vendor_mobile,
          vendor_shop_name,
        });
        window.location.href = "login-user.html";
      } catch (error) {
        alert(error.message);
      }
    });
  }
  
  function displayVendorInfo(data) {
    // let img_info = document.getElementById('vendor-img')
    // img_info.innerHTML=""
    // // img.innerHTML=`<img src="${}" alt="${}">`

    // let info = document.getElementById('vendor-info')
    // info.innerHTML=""
    // info.innerHTML=`<div>Name - ${data.vendor_name}</div>
    //       <div>Email - ${data.vendor_email}</div>
    //       <div>Mobile - ${data.vendor_mobile}</div>
    //       <div>Shope Name -${data.vendor_shop_name}</div>`
    console.log("hello", data);
  }
});
