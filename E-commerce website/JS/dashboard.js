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
    let addItem = document.getElementById("additem");
    let vendor_name = "";
    let uid, vendor_email;
    let product_array = []
    let currentPage = 1
    const itemsPerPage = 5

    document.getElementById('productFilter').addEventListener('input',loadProduct)
    document.getElementById('categoryFilter').addEventListener('change',loadProduct)
    document.getElementById("stockFilter").addEventListener('change',loadProduct)

    if (addItem) {
        document.getElementById("additem").addEventListener("click", async () => {
            let Brand = document.getElementById("brand").value;
            let Price = document.getElementById("price").value;
            let Rating = document.getElementById("rating").value;
            let Category = document.getElementById("category").value;
            let Stock = document.getElementById("stock").value;
            let ItemImage = document.getElementById("item_image").value;
            let Item_name = document.getElementById("name").value;

            // Display the values in the console (for testing purposes)
            console.log("name:", Item_name);
            console.log("Brand:", Brand);
            console.log("Price:", Price);
            console.log("Rating:", Rating);
            console.log("Category:", Category);
            console.log("Stock Quantity:", Stock);
            console.log("Item Image URL:", ItemImage);

            if (
                Item_name &&
                ItemImage &&
                Brand &&
                setDoc &&
                Category &&
                Rating &&
                Price
            ) {
                await addDoc(collection(db, "items"), {
                    vendor_name,
                    vendor_email,
                    Item_name,
                    Brand,
                    Price,
                    Rating,
                    Category,
                    Stock,
                    ItemImage,
                })
                    .then((docRef) => {
                        alert("successfully added to database");
                        console.log(docRef.id)
                    })
                    .catch((error) => {
                        alert(error.message);
                    });
                document.getElementById("brand").value = "";
                document.getElementById("price").value = "";
                document.getElementById("rating").value = "";
                document.getElementById("category").value = "";
                document.getElementById("stock").value = "";
                document.getElementById("item_image").value = "";
                document.getElementById("name").value = "";
            }
            loadProduct();
        });
    }

    document.getElementById('logout').addEventListener('click',async () => {
        try {
            await signOut(auth)
            alert(`${vendor_name}(${vendor_email}) is sign-out`)
            window.location.href="home-page.html"
        } catch (error) {
            alert(error.message)
        }
    })

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            uid = user.uid;
            console.log(uid);

            let data = await getDoc(doc(db, "vendors", uid));
            vendor_name = data.data().vendor_name;
            vendor_email = data.data().vendor_email;
            console.log(data.data(), vendor_name, vendor_email);
            displayVendorInfo(data.data());
        }else{
            alert(user.vendor_name," is signout")
        }
    });

    function displayVendorInfo(data) {
        let info = document.getElementById("vendor-info");
        info.innerHTML = "";
        info.innerHTML = `<div>Name - ${data.vendor_name}</div>
              <div>Email - ${data.vendor_email}</div>
              <div>Mobile - ${data.vendor_mobile}</div>
              <div>Shope Name -${data.vendor_shop_name}</div>`;
        console.log("hello", data);
    }

    async function loadProduct() {
        let productFilter = document.getElementById('productFilter').value
        let categoryFilter = document.getElementById('categoryFilter').value
        let stockFilter = document.getElementById("stockFilter").value
        let rangeStock=10
        let collRef = await collection(db, "items");
        let query = await getDocs(collRef);
        console.log(query, typeof query);
        product_array = []
        query.forEach((doc) => {
            let dataDoc = doc.data();
            console.log(dataDoc,doc.id);
            if(vendor_email===dataDoc.vendor_email){
                product_array.push([doc.id,dataDoc])
            }
        });
        if (productFilter || categoryFilter || stockFilter) {
            product_array = product_array.filter((data) => {
                let item = data[1]
                const productNameMatch = item.Item_name.toLowerCase().includes(productFilter);
                const categoryMatch = categoryFilter === "" || item.Category === categoryFilter;
        
                let stockMatch = true;
        
                if (stockFilter === "Low Stock") {
                    stockMatch = item.Stock < rangeStock;
                } else if (stockFilter === "High Stock") {
                    stockMatch = item.Stock >= rangeStock;
                }
        
                return productNameMatch && categoryMatch && stockMatch;
            });
        }
        console.log(product_array, productFilter, stockFilter, categoryFilter)
        displayProduct()
    }

    function displayProduct() {
        let list = document.getElementById("product_list");
        list.innerHTML = ""

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, product_array.length);
        const currentItems = product_array.slice(startIndex, endIndex);

        currentItems.forEach((data) => {
            let docx=data[1]
            console.log(data[0],typeof data[0])
            console.log(docx)
            let row = document.createElement("tr");
            let td1 = document.createElement('td')
            td1.innerText=docx.Item_name
            let td2 = document.createElement('td')
            td2.innerText=docx.Stock
            let td3 = document.createElement('td')
            td3.innerText=docx.Category
            let td4 = document.createElement('td')
            td4.innerHTML=`<img src="${docx.ItemImage}" alt="image of product" height="50px" width="40px">`

            row.append(td1,td2,td3,td4)
            let td5 = document.createElement('td')
            
            let editBtn = document.createElement('button')
            editBtn.innerText="✍Edit"
            editBtn.classList.add('edit-btn')
            editBtn.onclick = () => {
                let edit2 = document.createElement('textarea');
                edit2.classList.add('edit-text')
                edit2.value = td2.innerText;
                let saveBtn = document.createElement('button');
                saveBtn.innerText = 'Save';
                saveBtn.classList.add('save-btn');
                saveBtn.onclick = async () => {
                    let Stock = edit2.value.trim();
                    try {
                        await updateDoc(doc(db, "items", data[0]), {
                            Stock: Stock
                        });
                        td2.innerText = Stock;
                        alert("edit successfully");
                    } catch (error) {
                        alert(error.message, "editing task failed");
                    }
                    row.replaceChild(td2, edit2);
                    row.replaceChild(editBtn, saveBtn);
                };
                row.replaceChild(edit2, td2);
                row.replaceChild(saveBtn, editBtn);
            };
            row.appendChild(editBtn)

            let deleteBtn = document.createElement('button')
            deleteBtn.innerText="Delete"
            deleteBtn.classList.add('delete-btn')
            deleteBtn.onclick = async () => {
                if (confirm("Are you sure you want to delete this item?")) {
                    try {
                        await deleteDoc(doc(db, "items", data[0]));
                        console.log("deleted successfully");
                        loadProduct();
                    } catch (error) {
                        alert(error.message, "deletion process is unsuccessful");
                    }
                }
            };
            row.appendChild(deleteBtn)

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
    loadProduct()
});

/*
//     const inventoryData = [
//         { product: "Laptop", vendor: "TechZone", stock: 10, imageUrl:"laptop.jpg" },
//         { product: "Mouse", vendor: "GadgetHub", stock: 50, imageUrl:"mouse.jpg" },
//         { product: "Keyboard", vendor: "TechZone", stock: 5, imageUrl:"keyboard.jpg" },
//         { product: "Monitor", vendor: "Electronix", stock: 20, imageUrl:"monitor.jpg" },
//         { product: "Headphones", vendor: "GadgetHub", stock: 150, imageUrl:"headphones.jpg" },
//         { product: "Printer", vendor: "Electronix", stock: 2, imageUrl:"printer.jpg" },
//         { product: "USB Drive", vendor: "TechZone", stock: 100, imageUrl:"usb.jpg" },
//         { product: "Webcam", vendor: "GadgetHub", stock: 30, imageUrl:"webcam.jpg" },
//         { product: "Speaker", vendor: "Electronix", stock: 8, imageUrl:"speaker.jpg" },
//         { product: "Tablet", vendor: "TechZone", stock: 25, imageUrl:"tablet.jpg" },
//         { product: "Camera", vendor: "GadgetHub", stock: 12, imageUrl:"camera.jpg" },
//         { product: "Router", vendor: "Electronix", stock: 3, imageUrl:"router.jpg" },
//     ];

//     let currentPage = 1;
//     const itemsPerPage = 5;
//     let sortColumn = null;
//     let sortDirection = "asc";

//     function displayTable(data) {
//         const tableBody = document.querySelector("#inventoryTable tbody");
//         tableBody.innerHTML = "";

//         const start = (currentPage - 1) * itemsPerPage;
//         const end = start + itemsPerPage;
//         const pageData = data.slice(start, end);

//         pageData.forEach((item, index) => {
//             const row = document.createElement("tr");
//             if (item.stock < 10) row.classList.add("stock-alert");

//             row.innerHTML = `
//                 <td>${item.product}</td>
//                 <td>${item.vendor}</td>
//                 <td>${item.stock}</td>
//                 <td><img src="${item.imageUrl}" class="image-preview">
//                     <div class="image-upload-container">
//                     <input type="file" accept="image/*" data-index="${start + index}">
//                     </div>
//                 </td>
//                 <td>
//                     <button onclick="editItem(${start + index})">Edit</button>
//                     <button onclick="deleteItem(${start + index})">Delete</button>
//                 </td>
//             `;
//             tableBody.appendChild(row);
//         });
//         setupImageUpload();
//     }

//     function setupImageUpload(){
//         const imageInputs = document.querySelectorAll('input[type="file"]');
//         imageInputs.forEach(input => {
//             input.addEventListener('change',(event)=>{
//                 const file = event.target.files[0];
//                 if(file){
//                     const reader = new FileReader();
//                     reader.onload = (e) => {
//                         const index = parseInt(event.target.dataset.index);
//                         inventoryData[index].imageUrl = e.target.result;
//                         displayTable(filterItems());
//                     };
//                     reader.readAsDataURL(file);
//                 }
//             });
//         });
//     }

//     function displayPagination(data) {
//         const paginationDiv = document.getElementById("pagination");
//         paginationDiv.innerHTML = "";

//         const pageCount = Math.ceil(data.length / itemsPerPage);
//         for (let i = 1; i <= pageCount; i++) {
//             const button = document.createElement("button");
//             button.textContent = i;
//             if (i === currentPage) button.classList.add("active");
//             button.onclick = () => {
//                 currentPage = i;
//                 displayTable(filterItems());
//                 displayPagination(filterItems());
//             };
//             paginationDiv.appendChild(button);
//         }
//     }

//     function sortItems(column) {
//         if (sortColumn === column) {
//             sortDirection = sortDirection === "asc" ? "desc" : "asc";
//         } else {
//             sortColumn = column;
//             sortDirection = "asc";
//         }

//         inventoryData.sort((a, b) => {
//             const valA = a[column];
//             const valB = b[column];
//             if (typeof valA === "number" && typeof valB === "number") {
//                 return sortDirection === "asc" ? valA - valB : valB - valA;
//             } else {
//                 return sortDirection === "asc" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
//             }
//         });
//         displayTable(filterItems());
//     }

//     function filterItems() {
//         const productFilter = document.getElementById("productFilter").value.toLowerCase();
//         const vendorFilter = document.getElementById("vendorFilter").value.toLowerCase();
//         const stockFilter = document.getElementById("stockFilter").value;

//         return inventoryData.filter(item => {
//             const productMatch = item.product.toLowerCase().includes(productFilter);
//             const vendorMatch = item.vendor.toLowerCase().includes(vendorFilter);
//             let stockMatch = true;

//             if (stockFilter === "low") stockMatch = item.stock < 10;
//             if (stockFilter === "high") stockMatch = item.stock >= 50;

//             return productMatch && vendorMatch && stockMatch;
//         });
//     }

//     function editItem(index) {
//         const row = document.querySelector(`#inventoryTable tbody tr:nth-child(${index - ((currentPage - 1) * itemsPerPage) + 1})`);
//         row.classList.add("edit-row");

//         row.innerHTML = `
//             <td><input type="text" value="${inventoryData[index].product}"></td>
//             <td><input type="text" value="${inventoryData[index].vendor}"></td>
//             <td><input type="number" value="${inventoryData[index].stock}"></td>
//             <td><img src="${inventoryData[index].imageUrl}" class="image-preview"></td>
//             <td>
//                 <button onclick="saveItem(${index})">Save</button>
//                 <button onclick="cancelEdit(${index})">Cancel</button>
//             </td>
//         `;
//     }

//     function saveItem(index) {
//         const row = document.querySelector(`#inventoryTable tbody tr:nth-child(${index - ((currentPage - 1) * itemsPerPage) + 1})`);
//         inventoryData[index].product = row.querySelector("td:nth-child(1) input").value;
//         inventoryData[index].vendor = row.querySelector("td:nth-child(2) input").value;
//         inventoryData[index].stock = parseInt(row.querySelector("td:nth-child(3) input").value);
//         displayTable(filterItems());
//     }

//     function cancelEdit(index) {
//         displayTable(filterItems());
//     }

//     function deleteItem(index) {
//         inventoryData.splice(index, 1);
//         displayTable(filterItems());
//         displayPagination(filterItems());
//     }

//     document.querySelectorAll("th[data-sort]").forEach(th => {
//         th.onclick = () => sortItems(th.dataset.sort);
//     });

//     document.getElementById("productFilter").oninput = () => {
//         displayTable(filterItems());
//         displayPagination(filterItems());
//     };
//     document.getElementById("vendorFilter").oninput = () => {
//         displayTable(filterItems());
//         displayPagination(filterItems());
//     };
//     document.getElementById("stockFilter").onchange = () => {
//         displayTable(filterItems());
//         displayPagination(filterItems());
//     };

//     displayTable(filterItems());
//     displayPagination(filterItems());

//     console.log("hello")
//
*/
