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
      console.log('Reservation response:', data); 

      alert(data.message);

      fetchAndDisplaySales();
    })
    .catch(error => {
      console.error('Erreur lors de la réservation :', error);
      alert('Erreur lors de la réservation. Veuillez réessayer plus tard.');
    });
}

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

function submitLogin() {
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;

  console.log('Données de connexion envoyées :', { username, password }); 

  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Réponse du serveur :', data);

      if (data.message === 'Connexion réussie') {
        loggedInUsername = username;
        sessionStorage.setItem('loggedInUsername', loggedInUsername);

        if (data.role === 'admin') {
          window.location.href = 'admin_dashboard.html'; 
        } else {
          window.location.href = 'reservation.html'; 
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
  loggedInUsername = null;
  window.location.href = 'login.html';
}

function loyal() {
  window.location.href = 'account.html';
}

function inventory() {
  window.location.href = 'inventory.html';
}

function order() {
  window.location.href = 'reservation.html';
}

function home() {$
  window.location.href = 'admin_dashboard.html';
}

function home2() {
  window.location.href = 'reservation.html';
}

function historique() {
  window.location.href = 'historique.html?username=' + encodeURIComponent(loggedInUsername);

}
function clients() {
  window.location.href = 'listeclients.html';
}
function orderadmin() {
  window.location.href = 'order.html';
}
function historiqueadmin() {
  window.location.href = 'historiqueadmin.html';
}

function fetchAndDisplaySales() {
  if (!loggedInUsername) {
    console.error('Error: loggedInUsername is not set');
    return;
  }
  console.log('Current loggedInUsername:', loggedInUsername);  

  fetch(`http://localhost:3000/sales/${loggedInUsername}`)
    .then(response => response.json())
    .then(data => {
      const salesTableBody = document.getElementById('salesTableBody');

      salesTableBody.innerHTML = '';

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

function fetchAndDisplayLoyalCustomers() {
  fetch('http://localhost:3000/loyal-customers')
    .then(response => response.json())
    .then(data => {
      console.log('Loyal Customers Data:', data); 
      const loyalCustomersTableBody = document.getElementById('loyalCustomersTableBody');

      loyalCustomersTableBody.innerHTML = '';

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

function submitOrder() {
  var product = document.getElementById('product').value;
  var quantity = document.getElementById('quantity').value;
  var name = document.getElementById('name').value;
  var email = document.getElementById('email').value;

  quantity = parseInt(quantity, 10);

  if (isNaN(quantity) || quantity < 1) {
    alert('Invalid quantity');
    return;
  }

  fetch('http://localhost:3000/place-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product, quantity, name, email }),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Order response:', data);
      alert(data.message);

    })
    .catch(error => {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again later.');
    });
}

function submitOrderAdmin() {
  var product = document.getElementById('product').value;
  var quantity = document.getElementById('quantity').value;

  quantity = parseInt(quantity, 10);

  if (isNaN(quantity) || quantity < 1) {
    alert('Invalid quantity');
    return;
  }

  fetch(`http://localhost:3000/product-unit-price/${product}`)
    .then(response => response.json())
    .then(data => {
      let unitPrice = data.unitPrice;

      fetch('http://localhost:3000/admin-place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product, quantity, name, unitPrice }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Order response:', data);
          alert(data.message);
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

  fetch('http://localhost:3000/subscribe-to-newsletter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Subscription response:', data);
      alert(data.message);
    })
    .catch(error => {
      console.error('Error subscribing to newsletter:', error);
      alert('Error subscribing to newsletter. Please try again later.');
    });
}

window.onload = function () {
  fetchAndDisplayLoyalCustomers();
};

