CREATE DATABASE IF NOT EXISTS vergerducoin;

USE vergerducoin;

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL
);

-- Créez la table "users" pour stocker les informations d'identification des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Ajoutez un utilisateur administrateur pour les démonstrations (à changer dans un environnement réel)
INSERT INTO users (username, password) VALUES ('admin', 'admin');
