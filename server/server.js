const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vergerducoin',
});

let loggedInUserId; // Déclaration de la variable globale pour l'ID de l'utilisateur connecté

const products = [
  { id: 1, name: 'Pommes', unit_price: 2.99 },
  { id: 2, name: 'Poires', unit_price: 3.99 },
  { id: 3, name: 'Poivrons rouges', unit_price: 1.99 },
  { id: 4, name: 'Bananes', unit_price: 3.99 },
  { id: 5, name: 'Tomates', unit_price: 4.49 },
  { id: 6, name: 'Courgettes', unit_price: 3.99 },
  { id: 7, name: 'Cerises', unit_price: 1.99 },
  { id: 8, name: 'Oignon', unit_price: 4.49 },
  { id: 9, name: 'Carottes', unit_price: 2.99 },
];

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
  } else {
    console.log('Connecté à la base de données MySQL');

      // Créer la table 'users' si elle n'existe pas
      const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `;
    db.query(createUsersTableQuery, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table users :', err);
      } else {
        console.log('Table users créée avec succès');
      }
    });

    // Créer la table si elle n'existe pas
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL
      )
    `;
    db.query(createTableQuery, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table :', err);
      } else {
        console.log('Table créée avec succès');
      }
    });
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.post('/reservations', (req, res) => {
  const { product, quantity, name, email } = req.body;

  const insertQuery = 'INSERT INTO reservations (product, quantity, name, email) VALUES (?, ?, ?, ?)';
  db.query(insertQuery, [product, quantity, name, email], (err, result) => {
      if (err) {
          console.error('Error during data insertion:', err);
          res.status(500).json({ message: 'Error during reservation' });
      } else {
          console.log('Data inserted successfully');
          res.status(200).json({ message: 'Reservation successful' });
      }
  });
  
});

// Endpoint pour gérer les connexions
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  console.log('Données de connexion reçues :', { username, password });

  // Vérifier les informations de connexion dans la base de données
  const loginQuery = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(loginQuery, [username, password], (err, results) => {
      if (err) {
          console.error('Erreur lors de la vérification des informations de connexion :', err);
          res.status(500).json({ message: 'Erreur lors de la connexion' });
      } else {
          if (results.length > 0) {
              // Utilisez une comparaison insensible à la casse pour le nom d'utilisateur
              const user = results[0];
              const role = user.username.toLowerCase() === 'admin' ? 'admin' : 'client';

              // Stocker l'ID de l'utilisateur dans une variable globale (à des fins de démonstration)
              loggedInUserId = user.id;

              res.status(200).json({ message: 'Connexion réussie', role });
          } else {
              res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
          }
      }
  });
});




// Endpoint pour gérer les inscriptions
app.post('/register', (req, res) => {
  const { username, password, loyalCustomer } = req.body;

  // Insérer les nouvelles informations dans la base de données
  const registerQuery = 'INSERT INTO users (username, password, clients_fideles) VALUES (?, ?, ?)';
  db.query(registerQuery, [username, password, loyalCustomer], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'inscription :', err);
      res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    } else {
      console.log('Utilisateur inscrit avec succès');
      res.status(200).json({ message: 'Inscription réussie' });
    }
  });
});

// Endpoint pour récupérer les données de vente
app.get('/sales', (req, res) => {
  // Récupérer les données de vente depuis la base de données
  const salesQuery = `
    SELECT r.id, r.product, r.quantity, r.name, r.email, r.order_date, u.clients_fideles
    FROM reservations r
    JOIN users u ON LOWER(r.name) = LOWER(u.username)
  `;
  db.query(salesQuery, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des données de vente :', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des données de vente' });
    } else {
      const salesWithLoyalty = results.map(sale => {
        return {
          ...sale,
          clients_fideles: Boolean(sale.clients_fideles), // Convert to boolean
        };
      });

      res.status(200).json({ sales: salesWithLoyalty });
    }
  });
});




// Endpoint pour mettre à jour le statut de fidélité
app.post('/update-loyalty', (req, res) => {
  const { loyaltyStatus } = req.body;

  // Vous devez vérifier l'authentification ici (vérifier la session, le jeton, etc.)
  if (!loggedInUserId) {
    return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
  }

  // Mettez à jour le statut de fidélité dans la base de données pour l'utilisateur connecté
  const updateLoyaltyQuery = 'UPDATE users SET clients_fideles = ? WHERE id = ?';
  db.query(updateLoyaltyQuery, [loyaltyStatus, loggedInUserId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du statut de fidélité :', err);
      res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du statut de fidélité' });
    } else {
      console.log('Statut de fidélité mis à jour avec succès');
      res.status(200).json({ success: true, message: 'Statut de fidélité mis à jour avec succès' });
    }
  });
});

// ...

// Endpoint to get all products (inventory)
app.get('/products', (req, res) => {
  const productsQuery = 'SELECT * FROM products';
  db.query(productsQuery, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ message: 'Error fetching products' });
    } else {
      res.status(200).json({ products: results });
    }
  });
});

// Endpoint to handle product orders
app.post('/order', (req, res) => {
  const { productId, quantity } = req.body;

  // Retrieve current stock quantity of the selected product
  const getProductQuery = 'SELECT quantity FROM products WHERE id = ?';
  db.query(getProductQuery, [productId], (err, results) => {
      if (err) {
          console.error('Error fetching product:', err);
          res.status(500).json({ message: 'Error placing order' });
      } else {
          if (results.length > 0) {
              const currentStockQuantity = results[0].quantity;

              // Calculate new stock quantity after the order
              const newStockQuantity = currentStockQuantity + parseInt(quantity, 10);

              // Update the stock quantity in the database
              const updateProductQuery = 'UPDATE products SET quantity = ? WHERE id = ?';
              db.query(updateProductQuery, [newStockQuantity, productId], (err, result) => {
                  if (err) {
                      console.error('Error updating stock quantity:', err);
                      res.status(500).json({ message: 'Error placing order' });
                  } else {
                      res.status(200).json({ message: 'Order placed successfully' });
                  }
              });
          } else {
              res.status(404).json({ message: 'Product not found' });
          }
      }
  });
});


// Update the /client-orders endpoint
app.get('/client-orders/:username', (req, res) => {
  const clientName = req.params.username;

  // Retrieve the client's orders from the database
  const clientOrdersQuery = 'SELECT * FROM reservations WHERE name = ?';
  db.query(clientOrdersQuery, [clientName], (err, results) => {
      if (err) {
          console.error('Error fetching client orders:', err);
          res.status(500).json({ message: 'Error fetching client orders' });
      } else {
          res.status(200).json({ orders: results });
      }
  });
});

// Endpoint to retrieve sales data for the logged-in user
app.get('/sales/:username', (req, res) => {
  const loggedInUsername = req.params.username;

  // Retrieve sales data for the specific user from the database
  const salesQuery = `
      SELECT r.id, r.product, r.quantity, r.name, r.email, r.order_date, u.clients_fideles
      FROM reservations r
      JOIN users u ON LOWER(r.name) = LOWER(u.username)
      WHERE u.username = ?
  `;
  db.query(salesQuery, [loggedInUsername], (err, results) => {
      if (err) {
          console.error('Error fetching sales data:', err);
          res.status(500).json({ message: 'Error fetching sales data' });
      } else {
          const salesWithLoyalty = results.map(sale => {
              return {
                  ...sale,
                  order_date: new Date(sale.order_date).toLocaleString(), // Format the date
                  clients_fideles: Boolean(sale.clients_fideles),
              };
          });

          res.status(200).json({ sales: salesWithLoyalty });
      }
  });
});




app.post('/place-order', (req, res) => {
  const { product, quantity, name, email } = req.body;

  // Debugging: Log the entire request body
  console.log('Request Body:', req.body);

  // Debugging: Log individual fields
  console.log('Product:', product);
  console.log('Quantity:', quantity);
  console.log('Name:', name);
  console.log('Email:', email);

  // Check if the required fields are present
  if (!product || !quantity || !name || !email) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Check if the requested quantity is available in stock
  const checkStockQuery = 'SELECT quantity FROM products WHERE name = ?';

  db.query(checkStockQuery, [product], (stockErr, stockResult) => {
    if (stockErr) {
      console.error('Error checking stock:', stockErr);
      return res.status(500).json({ success: false, message: 'Error placing order' });
    }

    const availableStock = stockResult[0].quantity;

    if (quantity > availableStock) {
      // Not enough stock available
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }

    // Proceed with updating the products table
    const updateProductQuery = 'UPDATE products SET quantity = quantity - ? WHERE name = ?';

    db.query(updateProductQuery, [quantity, product], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Error updating stock quantity:', updateErr);
        return res.status(500).json({ success: false, message: 'Error placing order' });
      }

      // Insert reservation information into the reservations table
      const insertReservationQuery = 'INSERT INTO reservations (product, quantity, name, email) VALUES (?, ?, ?, ?)';
      db.query(insertReservationQuery, [product, quantity, name, email], (insertErr, reservationResult) => {
        if (insertErr) {
          console.error('Error inserting reservation:', insertErr);
          // Handle the error if insertion fails, you might want to consider rolling back the stock update
          return res.status(500).json({ success: false, message: 'Error placing order and creating reservation' });
        }

        // Handle the success response
        console.log('Order placed successfully:', updateResult);
        console.log('Reservation created successfully:', reservationResult);

        // Send a response to the client (optional)
        res.json({ success: true, message: 'Order placed successfully and reservation created' });
      });
    });
  });
});





app.post('/admin-place-order', (req, res) => {
  const { product, quantity, name, unitPrice } = req.body;

  // Log the entire request body
  console.log('Request Body:', req.body);

  // Update the products table in your database
  const updateProductQuery = 'UPDATE products SET quantity = quantity + ? WHERE name =?';
  let totalSpending = unitPrice * quantity;

  db.query(updateProductQuery, [quantity, product], (err, result) => {
      if (err) {
          console.error('Error updating stock quantity:', err);
          res.status(500).json({ success: false, message: 'Error placing order' });
      } else {
          // Log the SQL query and parameters
          console.log('SQL Query:', updateProductQuery);
          console.log('Parameters:', [quantity, product]);

          // Handle the success response
          console.log('Order placed successfully:', result);

          // Send a response to the client (optional)
          res.json({ success: true, message: 'Order placed successfully' });
      }
  });
});

// Endpoint to retrieve loyal customers
app.get('/loyal-customers', (req, res) => {
  const loyalCustomersQuery = 'SELECT * FROM users WHERE clients_fideles = 1';
  
  db.query(loyalCustomersQuery, (err, results) => {
    if (err) {
      console.error('Error executing loyal customers query:', err);
      res.status(500).json({ message: 'Error fetching loyal customers' });
    } else {
      console.log('Loyal Customers Results:', results); // Log results for debugging
      res.status(200).json({ loyalCustomers: results });
    }
  });
});


// Endpoint to get the unit price of a product
app.get('/product-unit-price/:productName', (req, res) => {
  const productName = req.params.productName;

  // Find the product in your array or database
  const product = products.find(p => p.name === productName);

  if (product) {
    res.json({ unitPrice: product.unit_price });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
