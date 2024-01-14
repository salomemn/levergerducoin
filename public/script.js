// Get loggedInUsername from sessionStorage
let loggedInUsername = sessionStorage.getItem('loggedInUsername');

function submitReservation() {
  var product = document.getElementById('product').value;
  var quantity = document.getElementById('quantity').value;
  var name = document.getElementById('name').value;
  var email = document.getElementById('email').value;

  fetch('http://localhost:3000/reservations', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product, quantity, name, email }),
  })
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
  })
  .then(data => {
      console.log('Reservation response:', data); // Log the response for debugging

      alert(data.message);

      // After successfully adding a reservation, fetch and display sales
      fetchAndDisplaySales();
  })
  .catch(error => {
      console.error('Erreur lors de la réservation :', error);
      alert('Erreur lors de la réservation. Veuillez réessayer plus tard.');
  });
}


// Fonction pour gérer la soumission du formulaire d'inscription
function submitRegistration() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
    }

    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (response.ok) {
            alert('Inscription réussie');
            // Rediriger l'utilisateur après une inscription réussie
            window.location.href = 'login.html';
        } else {
            alert('Erreur lors de l\'inscription. Veuillez choisir un nom d\'utilisateur différent.');
        }
    })
    .catch(error => {
        console.error('Erreur lors de l\'inscription :', error);
        alert('Erreur lors de l\'inscription. Veuillez réessayer plus tard.');
    });
}

// Submit login function where you set loggedInUsername
function submitLogin() {
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;

  console.log('Données de connexion envoyées :', { username, password }); // Add this for debugging

  fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
  })
  .then(response => response.json())
  .then(data => {
      console.log('Réponse du serveur :', data); // Add this for debugging

      if (data.message === 'Connexion réussie') {
          // Set the loggedInUsername variable when the login is successful
          loggedInUsername = username;
          // Set loggedInUsername in sessionStorage
          sessionStorage.setItem('loggedInUsername', loggedInUsername);


          // Verify the user's role and redirect accordingly
          if (data.role === 'admin') {
              window.location.href = 'admin_dashboard.html'; // Admin page
          } else {
              window.location.href = 'reservation.html'; // Reservation page for clients
          }
      } else {
          alert('Nom d\'utilisateur ou mot de passe incorrect');
      }
  })
  .catch(error => {
      console.error('Erreur lors de la connexion :', error);
      alert('Erreur lors de la connexion. Veuillez réessayer plus tard.');
  });
}




  
function logout() {
  // Clear the loggedInUsername when the user logs out
  loggedInUsername = null; // or loggedInUsername = '';

  // Redirect the user to the login page
  window.location.href = 'login.html';
}

function loyal() {
    // Vous pouvez envoyer une requête de déconnexion au serveur si nécessaire
    // Ici, nous allons simplement rediriger l'utilisateur vers la page de connexion
    window.location.href = 'account.html';
}

function inventory() {
    // Vous pouvez envoyer une requête de déconnexion au serveur si nécessaire
    // Ici, nous allons simplement rediriger l'utilisateur vers la page de connexion
    window.location.href = 'inventory.html';
}

function order() {
    // Vous pouvez envoyer une requête de déconnexion au serveur si nécessaire
    // Ici, nous allons simplement rediriger l'utilisateur vers la page de connexion
    window.location.href = 'reservation.html';
}

function home() {
    // Vous pouvez envoyer une requête de déconnexion au serveur si nécessaire
    // Ici, nous allons simplement rediriger l'utilisateur vers la page de connexion
    window.location.href = 'admin_dashboard.html';
}

function home2() {
    // Vous pouvez envoyer une requête de déconnexion au serveur si nécessaire
    // Ici, nous allons simplement rediriger l'utilisateur vers la page de connexion
    window.location.href = 'reservation.html';
}

function historique() {
    // Vous pouvez envoyer une requête de déconnexion au serveur si nécessaire
    // Ici, nous allons simplement rediriger l'utilisateur vers la page de connexion
    window.location.href = 'historique.html?username=' + encodeURIComponent(loggedInUsername);

}
function clients() {
  // Vous pouvez envoyer une requête de déconnexion au serveur si nécessaire
  // Ici, nous allons simplement rediriger l'utilisateur vers la page de connexion
  window.location.href = 'listeclients.html';
}
function orderadmin() {
  // Vous pouvez envoyer une requête de déconnexion au serveur si nécessaire
  // Ici, nous allons simplement rediriger l'utilisateur vers la page de connexion
  window.location.href = 'order.html';
}
function historiqueadmin() {
  // Vous pouvez envoyer une requête de déconnexion au serveur si nécessaire
  // Ici, nous allons simplement rediriger l'utilisateur vers la page de connexion
  window.location.href = 'historiqueadmin.html';
}

// Fetch and display client's orders
function fetchAndDisplaySales() {
  // Ensure loggedInUsername is set
  if (!loggedInUsername) {
      console.error('Error: loggedInUsername is not set');
      return;
  }
  console.log('Current loggedInUsername:', loggedInUsername);  // Add this line to log the value


  fetch(`http://localhost:3000/sales/${loggedInUsername}`)
      .then(response => response.json())
      .then(data => {
          const salesTableBody = document.getElementById('salesTableBody');

          // Clear existing rows
          salesTableBody.innerHTML = '';

          // Add new rows for sales data only
          if (data.sales) {
              data.sales.forEach(sale => {
                  const row = salesTableBody.insertRow();
                  row.insertCell().textContent = sale.product;
                  row.insertCell().textContent = sale.quantity;
                  row.insertCell().textContent = sale.name;
                  row.insertCell().textContent = sale.email;
              });
          } else {
              const row = salesTableBody.insertRow();
              const cell = row.insertCell();
              cell.colSpan = 4;
              cell.textContent = 'No sales available.';
          }
      })
      .catch(error => console.error('Error fetching client orders:', error));
}

  

  function updateLoyaltyStatus() {
    const loyaltyStatus = document.getElementById('loyaltyStatus').checked;
  
    // Envoyer une requête au serveur pour mettre à jour le statut de fidélité
    fetch('http://localhost:3000/update-loyalty', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loyaltyStatus }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Statut de fidélité mis à jour avec succès');
        } else {
          alert('Erreur lors de la mise à jour du statut de fidélité');
        }
      })
      .catch(error => {
        console.error('Erreur lors de la mise à jour du statut de fidélité :', error);
        alert('Erreur lors de la mise à jour du statut de fidélité. Veuillez réessayer plus tard.');
      });
  }


      // Fetch and display inventory data
      /** 
function fetchAndDisplayInventory() {
    fetch('http://localhost:3000/inventory')
      .then(response => response.json())
      .then(data => {
        if (data.inventory) {
          const inventoryTableBody = document.getElementById('inventoryTableBody');
  
          if (!inventoryTableBody) {
            console.error('Inventory table body element does not exist.');
            return;
          }
  
          inventoryTableBody.innerHTML = '';
  
          data.inventory.forEach(product => {
            const row = inventoryTableBody.insertRow();
            row.insertCell().textContent = product.id;
            row.insertCell().textContent = product.name;
            row.insertCell().textContent = product.category;
            const quantityCell = row.insertCell();
            quantityCell.textContent = product.quantity;
  
            // Check if stock quantity is below 10 and apply style
            if (product.quantity < 10) {
              quantityCell.style.color = 'red'; // Change text color to red
              quantityCell.style.fontWeight = 'bold'; // Make text bold
            }
  
            row.insertCell().textContent = product.unit_price.toFixed(2);
            row.insertCell().textContent = product.reception_date || '-';
            row.insertCell().textContent = product.sale_date || '-';
            row.insertCell().textContent = product.supplier || '-';
          });
  
          console.log('Inventory data retrieved successfully:', data.inventory);
        } else {
          console.error('Error retrieving inventory data:', data.message);
        }
      })
      .catch(error => {
        console.error('Error retrieving inventory data:', error);
      });
  }
*/
// Fetch and display loyal customers
function fetchAndDisplayLoyalCustomers() {
  fetch('http://localhost:3000/loyal-customers')
      .then(response => response.json())
      .then(data => {
          console.log('Loyal Customers Data:', data); // Log data for debugging
          const loyalCustomersTableBody = document.getElementById('loyalCustomersTableBody');

  
          // Clear existing rows
          loyalCustomersTableBody.innerHTML = '';

          // Add new rows for loyal customers data only
          if (data.loyalCustomers) {
              data.loyalCustomers.forEach(customer => {
                  const row = loyalCustomersTableBody.insertRow();
                  row.insertCell().textContent = customer.id;
                  row.insertCell().textContent = customer.username;
              });
          } else {
              const row = loyalCustomersTableBody.insertRow();
              const cell = row.insertCell();
              cell.colSpan = 2;
              cell.textContent = 'No loyal customers available.';
          }
      })
      .catch(error => console.error('Error fetching loyal customers:', error));
}



// Add this function to script.js
function submitOrder() {
  var product = document.getElementById('product').value;
  var quantity = document.getElementById('quantity').value;
  var name = document.getElementById('name').value;
  var email = document.getElementById('email').value;

  // Convert quantity to a number
  quantity = parseInt(quantity, 10);

  // Check if quantity is a valid number
  if (isNaN(quantity) || quantity < 1) {
    alert('Invalid quantity');
    return;
  }

  // Fetch to your server endpoint for handling the order
  fetch('http://localhost:3000/place-order', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product, quantity, name, email }),
  })
  .then(response => response.json())
  .then(data => {
      // Handle the response from the server (if needed)
      console.log('Order response:', data);
      alert(data.message);

      // Optionally, you can fetch and display updated data on the client side
      // For example, fetchAndDisplayInventory();
  })
  .catch(error => {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again later.');
  });
}

function submitOrderAdmin() {
  var product = document.getElementById('product').value;
  var quantity = document.getElementById('quantity').value;

  // Convert quantity to a number
  quantity = parseInt(quantity, 10);

  // Check if quantity is a valid number
  if (isNaN(quantity) || quantity < 1) {
    alert('Invalid quantity');
    return;
  }

  // Fetch unit price for the selected product
  fetch(`http://localhost:3000/product-unit-price/${product}`)
    .then(response => response.json())
    .then(data => {
      let unitPrice = data.unitPrice;

      // Fetch to your server endpoint for handling the order
      fetch('http://localhost:3000/admin-place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product, quantity, name, unitPrice }),
      })
        .then(response => response.json())
        .then(data => {
          // Handle the response from the server (if needed)
          console.log('Order response:', data);
          alert(data.message);

          // Optionally, you can fetch and display updated data on the client side
          // For example, fetchAndDisplayInventory();
        })
        .catch(error => {
          console.error('Error placing order:', error);
          alert('Error placing order. Please try again later.');
        });
    })
    .catch(error => {
      console.error(`Error fetching unit price for ${product}:`, error);
      alert('Error fetching unit price. Please try again later.');
    });
}

function subscribeToNewsletter() {
  const emailInput = document.getElementById('email');
  const email = emailInput.value;

  // You can add additional validation for the email address if needed

  // Send the email to your server for processing
  fetch('http://localhost:3000/subscribe-to-newsletter', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
  })
  .then(response => response.json())
  .then(data => {
      // Handle the response from the server (if needed)
      console.log('Subscription response:', data);
      alert(data.message);
  })
  .catch(error => {
      console.error('Error subscribing to newsletter:', error);
      alert('Error subscribing to newsletter. Please try again later.');
  });
}

// Call this function when the page loads
window.onload = function () {
  //fetchAndDisplayInventory();
  fetchAndDisplayLoyalCustomers();
};

        