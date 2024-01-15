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

let loggedInUserId;

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

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  console.log('Données de connexion reçues :', { username, password });

  const loginQuery = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(loginQuery, [username, password], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification des informations de connexion :', err);
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    } else {
      if (results.length > 0) {
        const user = results[0];
        const role = user.username.toLowerCase() === 'admin' ? 'admin' : 'client';

        loggedInUserId = user.id;

        res.status(200).json({ message: 'Connexion réussie', role });
      } else {
        res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
      }
    }
  });
});

app.post('/register', (req, res) => {
  const { username, password, loyalCustomer } = req.body;

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

app.get('/sales', (req, res) => {
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
          clients_fideles: Boolean(sale.clients_fideles), 
        };
      });

      res.status(200).json({ sales: salesWithLoyalty });
    }
  });
});


app.post('/update-loyalty', (req, res) => {
  const { loyaltyStatus } = req.body;

  if (!loggedInUserId) {
    return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
  }

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

app.post('/order', (req, res) => {
  const { productId, quantity } = req.body;

  const getProductQuery = 'SELECT quantity FROM products WHERE id = ?';
  db.query(getProductQuery, [productId], (err, results) => {
    if (err) {
      console.error('Error fetching product:', err);
      res.status(500).json({ message: 'Error placing order' });
    } else {
      if (results.length > 0) {
        const currentStockQuantity = results[0].quantity;

        const newStockQuantity = currentStockQuantity + parseInt(quantity, 10);

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

app.get('/client-orders/:username', (req, res) => {
  const clientName = req.params.username;

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

app.get('/sales/:username', (req, res) => {
  const loggedInUsername = req.params.username;

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
          order_date: new Date(sale.order_date).toLocaleString(), 
          clients_fideles: Boolean(sale.clients_fideles),
        };
      });

      res.status(200).json({ sales: salesWithLoyalty });
    }
  });
});

app.post('/place-order', (req, res) => {
  const { product, quantity, name, email } = req.body;

  console.log('Request Body:', req.body);
  console.log('Product:', product);
  console.log('Quantity:', quantity);
  console.log('Name:', name);
  console.log('Email:', email);

  if (!product || !quantity || !name || !email) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const checkStockQuery = 'SELECT quantity FROM products WHERE name = ?';

  db.query(checkStockQuery, [product], (stockErr, stockResult) => {
    if (stockErr) {
      console.error('Error checking stock:', stockErr);
      return res.status(500).json({ success: false, message: 'Error placing order' });
    }

    const availableStock = stockResult[0].quantity;

    if (quantity > availableStock) {
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }

    const updateProductQuery = 'UPDATE products SET quantity = quantity - ? WHERE name = ?';

    db.query(updateProductQuery, [quantity, product], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Error updating stock quantity:', updateErr);
        return res.status(500).json({ success: false, message: 'Error placing order' });
      }

      const insertReservationQuery = 'INSERT INTO reservations (product, quantity, name, email) VALUES (?, ?, ?, ?)';
      db.query(insertReservationQuery, [product, quantity, name, email], (insertErr, reservationResult) => {
        if (insertErr) {
          console.error('Error inserting reservation:', insertErr);
          return res.status(500).json({ success: false, message: 'Error placing order and creating reservation' });
        }

        console.log('Order placed successfully:', updateResult);
        console.log('Reservation created successfully:', reservationResult);

        res.json({ success: true, message: 'Order placed successfully and reservation created' });
      });
    });
  });
});

app.post('/admin-place-order', (req, res) => {
  const { product, quantity, name, unitPrice } = req.body;

  console.log('Request Body:', req.body);

  const updateProductQuery = 'UPDATE products SET quantity = quantity + ? WHERE name =?';
  let totalSpending = unitPrice * quantity;

  db.query(updateProductQuery, [quantity, product], (err, result) => {
    if (err) {
      console.error('Error updating stock quantity:', err);
      res.status(500).json({ success: false, message: 'Error placing order' });
    } else {
      console.log('SQL Query:', updateProductQuery);
      console.log('Parameters:', [quantity, product]);

      console.log('Order placed successfully:', result);

      res.json({ success: true, message: 'Order placed successfully' });
    }
  });
});

app.get('/loyal-customers', (req, res) => {
  const loyalCustomersQuery = 'SELECT * FROM users WHERE clients_fideles = 1';

  db.query(loyalCustomersQuery, (err, results) => {
    if (err) {
      console.error('Error executing loyal customers query:', err);
      res.status(500).json({ message: 'Error fetching loyal customers' });
    } else {
      console.log('Loyal Customers Results:', results); 
      res.status(200).json({ loyalCustomers: results });
    }
  });
});


app.get('/product-unit-price/:productName', (req, res) => {
  const productName = req.params.productName;

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
