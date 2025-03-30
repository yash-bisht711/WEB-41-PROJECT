import { auth, db } from "./firebase_auth.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

import {
  collection,
  setDoc,
  addDoc,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  let uid;

  let currentName = "";
  let currentEmail = "";

  let product_array = [];
  let filteredProducts = [];
  let currentPage = 1;
  const itemsPerPage = 5;

  document
    .getElementById("priceRange")
    .addEventListener("change", filterProduct);
  document
    .getElementById("vendorFilter")
    .addEventListener("change", filterProduct);
  document
    .getElementById("ratingFilter")
    .addEventListener("change", filterProduct);

 document.getElementById("range-value").innerText = document
 .getElementById("priceRange").value
  async function loadProduct() {
    let collRef = await collection(db, "items");
    let query = await getDocs(collRef);
    product_array = [];
    query.forEach((doc) => {
      let dataDoc = doc.data();
      console.log(dataDoc, doc.id);
      product_array.push([doc.id, dataDoc]);
    });
    filteredProducts = [...product_array];
    displayproduct(filteredProducts);
  }

  loadProduct();

  function displayproduct(data) {
    let Electronics = document.getElementById("Electronics");
    Electronics.innerHTML = ``;
    let clothing = document.getElementById("clothing");
    clothing.innerHTML = ``;
    let groceries = document.getElementById("groceries");
    groceries.innerHTML = ``;
    let home_appliance = document.getElementById("home-appliance");
    home_appliance.innerHTML = ``;

    data.forEach((item) => {
      let items = item[1];
      if (items.Category.toLowerCase() === "electronics") {
        let div = document.createElement("div");
        div.innerHTML = `
                    <div><img src="${items.ItemImage}" alt="product_img" height="70px" width="60px"></div>
                    <div><p>${items.Item_name}</p><p>${items.Price}</p>
                    <p>${items.Rating}</p>
                    <p>${items.vendor_name}</p></div>`;
        Electronics.append(div);
      }

      if (items.Category.toLowerCase() === "groceries") {
        let div = document.createElement("div");
        div.innerHTML = `
                    <div><img src="${items.ItemImage}" alt="product_img" height="70px" width="60px"></div>
                    <div><p>${items.Item_name}</p><p>${items.Price}</p>
                    <p>${items.Rating}</p>
                    <p>${items.vendor_name}</p></div>`;
        groceries.append(div);
      }

      if (items.Category.toLowerCase() === "clothing") {
        let div = document.createElement("div");
        div.innerHTML = `
                    <div><img src="${items.ItemImage}" alt="product_img" height="70px" width="60px"></div>
                    <div><p>${items.Item_name}</p><p>${items.Price}</p>
                    <p>${items.Rating}</p>
                    <p>${items.vendor_name}</p></div>`;
        clothing.append(div);
      }

      if (items.Category.toLowerCase() === "home-appliance") {
        let div = document.createElement("div");
        div.innerHTML = `
                    <div><img src="${items.ItemImage}" alt="product_img" height="70px" width="60px"></div>
                    <div><p>${items.Item_name}</p><p>${items.Price}</p>
                    <p>${items.Rating}</p>
                    <p>${items.vendor_name}</p></div>`;
        home_appliance.append(div);
      }
    });
  }

  document.getElementById("logout").addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert(`${currentName}(${currentEmail}) is sign-out`);
      window.location.href = "home-page.html";
    } catch (error) {
      alert(error.message);
    }
  });

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      uid = user.uid;

      try {
        let data_vendorsSnapshot = await getDoc(doc(db, "vendors", uid));
        let data_usersSnapshot = await getDoc(doc(db, "users", uid));

        if (data_vendorsSnapshot.exists()) {
          let data_vendors = data_vendorsSnapshot.data();
          document.getElementById("login").classList.add("hidden_class");
          document.getElementById("logout").classList.remove("hidden_class");
          let info = document.getElementById("vendor_login");
          info.innerHTML = "";
          info.style.display = "flex";
          info.style.flexDirection = "column";
          info.innerHTML = `<div>${data_vendors.vendor_name}</div> <div>${data_vendors.vendor_email}</div>`;
          currentName = data_vendors.vendor_name;
          currentEmail = data_vendors.vendor_email;
        }

        if (data_usersSnapshot.exists()) {
          let data_users = data_usersSnapshot.data();
          document.getElementById("vendor_login").classList.add("hidden_class");
          document.getElementById("logout").classList.remove("hidden_class");
          let info = document.getElementById("login");
          info.innerHTML = "";
          info.style.display = "flex";
          info.style.flexDirection = "column";
          info.innerHTML = `<div>${data_users.name}</div> <div>${data_users.email}</div>`;
          currentName = data_users.name;
          currentEmail = data_users.email;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  });

  let timer;
  let searchInput = document.getElementById("search-bar");
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      clearTimeout(timer);
      timer = setTimeout(() => {
        searchproduct(event.target.value);
      }, 500);
    }
  });

  async function searchproduct(query) {
    document.getElementById('main').classList.add('hidden_class')
    document.getElementById('serachProduct').classList.remove('hidden_class')
    if (!query) {
      alert("enter the product details");
      return;
    }

    let collRef = await collection(db, "items");
    let querySnapshot = await getDocs(collRef);
    filteredProducts = [];
    querySnapshot.forEach((doc) => {
      let dataDoc = doc.data();
      console.log(dataDoc,query)
      if (
        dataDoc.Item_name.toLowerCase().includes(query.toLowerCase()) ||
        dataDoc.Brand.toLowerCase().includes(query.toLowerCase()) ||
        dataDoc.Category.toLowerCase().includes(query.toLowerCase())
      ) {
        filteredProducts.push([doc.id, dataDoc]);
      }
    });

    console.log(filteredProducts)
    displayFilterProduct()
    filterProduct();
  }

  async function filterProduct() {
    let priceRange = document.getElementById("priceRange").value;
    document.getElementById("range-value").innerText = priceRange
    let vendorFilter = document.getElementById("vendorFilter").value;
    let ratingFilter = document.getElementById("ratingFilter").value;

    let tempProducts = []; //[...product_array];
    if (filteredProducts.length > 0) {
      tempProducts = [...filteredProducts];
    }
    if (priceRange || vendorFilter || ratingFilter){
        filteredProducts = tempProducts.filter((data) => {
            let item = data[1];
            const productNameMatch =
              priceRange === "" || parseInt(item.Price) <= parseInt(priceRange);
            const categoryMatch =
              vendorFilter === "" ||
              item.vendor_name.toLowerCase() === vendorFilter.toLowerCase();
            const ratingMatch =
              ratingFilter === "" || parseInt(item.Rating) <= parseInt(ratingFilter);
            return productNameMatch && categoryMatch && ratingMatch;
          });
    }

    console.log(filteredProducts,tempProducts,typeof filteredProducts)
    displayFilterProduct();
  }

  function displayFilterProduct() {
    let list = document.getElementById("product_collection");
    list.innerText = "";
    console.log("hello");

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, product_array.length);
    const currentItems = filteredProducts.slice(startIndex, endIndex);

    currentItems.forEach((items) => {
      let docx = items[1];
      console.log(docx)
      let div = document.createElement("div");
      div.classList.add("search-filteredProduct");
      div.innerHTML= `<div id="serachProductImage">
                <img src="${docx.ItemImage}" alt="imag.jpg" height="130px" width="120px">
            </div>
            <div id="searchProductDetails">
                <div>product - ${docx.Item_name}</div>
                <div>Brand - ${docx.Brand}</div>
                <div><p>category - ${docx.Category}</p><p>Price - ${docx.Price}</p></div>
                <div>Rating - ${docx.Rating}</div>
                <div>Vendor Name - ${docx.vendor_name}</div>
            </div>`;

      let shop_cart = document.createElement("button");
      shop_cart.classList.add('shop-cart')
      shop_cart.innerText=`🛒add`
      div.appendChild(shop_cart)
      list.append(div);
    });

    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(product_array.length / itemsPerPage);
    for (let i = 1; i <= totalPages; i++) {
      const pageLink = document.createElement("button");
      pageLink.classList.add("page-button");
      pageLink.textContent = i;
      pageLink.addEventListener("click", () => changePage(i));
      pagination.appendChild(pageLink);
    }
  }

  function changePage(page) {
    currentPage = page;
    displayFilterProduct();
  }
});

/*import { auth, db } from "./firebase_auth.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

import {
    collection,
    setDoc,
    addDoc,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    let uid;

    let currentName = "";
    let currentEmail = "";

    let product_array = [];
    let searchproduct = []
    let currentPage = 1
    const itemsPerPage = 5

    document.getElementById('priceRange').addEventListener('change', filterProduct)
    document.getElementById('vendorFilter').addEventListener('change', filterProduct)
    document.getElementById("ratingFilter").addEventListener('change', filterProduct)
    async function loadProduct() {
        let collRef = await collection(db, "items");
        let query = await getDocs(collRef);
        product_array = [];
        query.forEach((doc) => {
            let dataDoc = doc.data();
            console.log(dataDoc, doc.id);
            product_array.push([doc.id, dataDoc]);
        });

        displayproduct(product_array);
    }
    loadProduct()
    function displayproduct(data) {
        console.log("hello")
        let Electronics = document.getElementById("Electronics");
        Electronics.innerHTML = ``;
        let clothing = document.getElementById("clothing");
        clothing.innerHTML = ``;
        let groceries = document.getElementById("groceries");
        groceries.innerHTML = ``;
        let home_appliance = document.getElementById("home-appliance");
        home_appliance.innerHTML = ``;

        product_array.forEach((item) => {
            let items = item[1]
            console.log(items)
            if (items.Category.toLowerCase() === "electronics") {
                let div = document.createElement("div");
                div.innerHTML = `
        <div><img src="${items.ItemImage}" alt="product_img" height="70px" width="60px"></div>
        <div><p>${items.Item_name}</p><p>${items.Price}</p>
        <p>${items.Rating}</p>
        <p>${items.vendor_name}</p></div>`;;

                Electronics.append(div)
            }

            if (items.Category.toLowerCase() === "groceries") {
                let div = document.createElement("div");
                div.innerHTML = `
        <div><img src="${items.ItemImage}" alt="product_img" height="70px" width="60px"></div>
        <div><p>${items.Item_name}</p><p>${items.Price}</p>
        <p>${items.Rating}</p>
        <p>${items.vendor_name}</p></div>`;;

                groceries.append(div)
            }

            if (items.Category.toLowerCase() === "clothing") {
                let div = document.createElement("div");
                div.innerHTML = `
        <div><img src="${items.ItemImage}" alt="product_img" height="70px" width="60px"></div>
        <div><p>${items.Item_name}</p><p>${items.Price}</p>
        <p>${items.Rating}</p>
        <p>${items.vendor_name}</p></div>`;

                clothing.append(div)
            }

            if (items.Category.toLowerCase() === "home-appliance") {
                let div = document.createElement("div");
                div.innerHTML = `
        <div><img src="${items.ItemImage}" alt="product_img" height="70px" width="60px"></div>
        <div><p>${items.Item_name}</p><p>${items.Price}</p>
        <p>${items.Rating}</p>
        <p>${items.vendor_name}</p></div>`;;

                home_appliance.append(div)
            }
        });
    }

    document.getElementById("logout").addEventListener("click", async () => {
        try {
            await signOut(auth);
            alert(`${currentName}(${currentEmail}) is sign-out`);
            window.location.href = "home-page.html";
        } catch (error) {
            alert(error.message);
        }
    });

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            uid = user.uid;

            try {
                let data_vendorsSnapshot = await getDoc(doc(db, "vendors", uid));
                let data_usersSnapshot = await getDoc(doc(db, "users", uid));

                if (data_vendorsSnapshot.exists()) {
                    let data_vendors = data_vendorsSnapshot.data();
                    document.getElementById("login").classList.add("hidden_class");
                    document.getElementById("logout").classList.remove("hidden_class");
                    // (function () {
                    let info = document.getElementById("vendor_login");
                    info.innerHTML = "";
                    info.style.display = "flex";
                    info.style.flexDirection = "column";
                    info.innerHTML = `<div>${data_vendors.vendor_name}</div> <div>${data_vendors.vendor_email}</div>`;
                    console.log("hello", data_vendors);
                    // })();

                    currentName = data_vendors.vendor_name;
                    currentEmail = data_vendors.vendor_email;
                }

                if (data_usersSnapshot.exists()) {
                    let data_users = data_usersSnapshot.data();
                    document.getElementById("vendor_login").classList.add("hidden_class");
                    // document.getElementById('login').classList.add('hidden_class');
                    document.getElementById("logout").classList.remove("hidden_class");
                    // (function () {
                    let info = document.getElementById("login");
                    info.innerHTML = "";
                    info.style.display = "flex";
                    info.style.flexDirection = "column";
                    info.innerHTML = `<div>${data_users.name}</div> <div>${data_users.email}</div>`;
                    console.log("hello", data_users);
                    // })();

                    currentName = data_vendors.name;
                    currentEmail = data_vendors.email;
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                // Handle the error appropriately (e.g., display an error message to the user).
            }
        }
    });

    let timer
    let searchInput = document.getElementById('search-bar')
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            clearTimeout(timer)
            timer = setTimeout(() => {
                searchproduct(event.target.value)
            }, 500);
        }

    })

    async function searchproduct(query) {
        if (!query) {
            alert("enter the product details")
            return
        }

        let collRef = await collection(db, "items");
        let query = await getDocs(collRef);
        searchproduct = [];
        query.forEach((doc) => {
            let dataDoc = doc.data();
            console.log(dataDoc, doc.id);
            if (dataDoc.Item_name.toLowerCase().includes(query.toLowerCase()) || dataDoc.Brand.toLowerCase().includes(query.toLowerCase()) || dataDoc.Category.toLowerCase().includes(query.toLowerCase())) {
                searchproduct.push([doc.id, dataDoc])
            };
        });

        filterProduct()
    }

    async function filterProduct() {
        let priceRange = document.getElementById('priceRange').value
        let vendorFilter = document.getElementById('vendorFilter').value
        let ratingFilter = document.getElementById("ratingFilter").value
        if (priceRange || vendorFilter || ratingFilter) {
            searchproduct = searchproduct.filter((data) => {
                let item = data[1]
                const productNameMatch = parseInt(item.Price) < parseInt(priceRange)
                const categoryMatch = vendorFilter === "" || item.vendor_name.toLowerCase() === vendorFilter.toLowerCase();

                const ratingMatch = parseInt(item.Rating) < parseInt(ratingFilter)

                return productNameMatch && categoryMatch && ratingMatch;
            });
        }
        console.log(searchproduct, priceRange, ratingFilter, vendorFilter)
        displayFilterProduct()
    }

    function displayFilterProduct() {
        let list = document.getElementById("product_collection");
        list.innerHTML = ""

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, product_array.length);
        const currentItems = searchproduct.slice(startIndex, endIndex);

        currentItems.forEach((data) => {
            let docx=data[1]
            console.log(data[0],typeof data[0])
            console.log(docx)
            

            list.appendChild(row)
        });

        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";

        const totalPages = Math.ceil(product_array.length / itemsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement("button");
            pageLink.classList.add("page-button");
            pageLink.textContent = i;
            pageLink.addEventListener("click", () => changePage(i));
            pagination.appendChild(pageLink);
        }
    }

    function changePage(page) {
        currentPage = page;
        displayProduct();
    }
});
*/
