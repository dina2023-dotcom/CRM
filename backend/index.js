require("dotenv").config();

const express = require("express");
const { Client } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.use(express.json());


// ==============================
// CONNEXION À POSTGRESQL
// ==============================

async function startServer() {
    try {
        await client.connect();

        console.log("Connecté à PostgreSQL");

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Erreur de connexion :", error);
    }
}


// ==============================
// ROUTE D'ACCUEIL
// ==============================

app.get("/", (req, res) => {
    res.send("Bienvenue dans mon CRM");
});


// ==============================
// CLIENTS
// ==============================

// GET - Tous les clients
app.get("/clients", async (req, res) => {
    try {
        const result = await client.query(
            "SELECT * FROM clients"
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la récupération des clients"
        );
    }
});


// POST - Ajouter un client
app.post("/clients", async (req, res) => {
    try {
        const {
            nom,
            prenom,
            adresse,
            email,
            telephone
        } = req.body;

        if (!nom || !prenom || !adresse || !email || !telephone) {
            return res.status(400).send(
                "Tous les champs sont obligatoires"
            );
        }

        const result = await client.query(
            `INSERT INTO clients
            (nom, prenom, adresse, email, telephone)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [nom, prenom, adresse, email, telephone]
        );

        res.status(201).json({
            message: "Client ajouté avec succès !",
            client: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de l'ajout du client"
        );
    }
});


// GET - Un client par son ID
app.get("/clients/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send("ID invalide");
        }

        const result = await client.query(
            "SELECT * FROM clients WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send(
                "Client introuvable"
            );
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la récupération du client"
        );
    }
});


// PUT - Modifier l'adresse d'un client
app.put("/clients/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { adresse } = req.body;

        if (isNaN(id)) {
            return res.status(400).send("ID invalide");
        }

        if (!adresse) {
            return res.status(400).send(
                "L'adresse est obligatoire"
            );
        }

        const result = await client.query(
            `UPDATE clients
             SET adresse = $1
             WHERE id = $2
             RETURNING *`,
            [adresse, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send(
                "Client introuvable"
            );
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la modification du client"
        );
    }
});


// DELETE - Supprimer un client
app.delete("/clients/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send("ID invalide");
        }

        const result = await client.query(
            "DELETE FROM clients WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send(
                "Client introuvable"
            );
        }

        res.send(
            "Client supprimé avec succès !"
        );

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la suppression du client"
        );
    }
});


// ==============================
// PRODUITS
// ==============================

// POST - Ajouter un produit
app.post("/products", async (req, res) => {
    try {
        const {
            nom,
            description,
            prix,
            quantite,
            date_expiration,
            category_id
        } = req.body;

        if (
            !nom ||
            !description ||
            prix === undefined ||
            quantite === undefined ||
            !date_expiration ||
            !category_id
        ) {
            return res.status(400).send(
                "Tous les champs sont obligatoires"
            );
        }

        if (typeof prix !== "number" || typeof quantite !== "number") {
            return res.status(400).send(
                "Le prix et la quantité doivent être des nombres"
            );
        }

        if (prix < 0) {
            return res.status(400).send(
                "Le prix ne peut pas être négatif"
            );
        }

        if (quantite < 0) {
            return res.status(400).send(
                "La quantité ne peut pas être négative"
            );
        }

        const result = await client.query(
            `INSERT INTO products
            (nom, description, prix, quantite, date_expiration, category_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                nom,
                description,
                prix,
                quantite,
                date_expiration,
                category_id
            ]
        );

        res.status(201).json({
            message: "Produit ajouté avec succès !",
            product: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de l'ajout du produit"
        );
    }
});


// GET - Tous les produits
app.get("/products", async (req, res) => {
    try {
        const result = await client.query(`
            SELECT
                products.*,
                categories.nom AS categorie
            FROM products
            LEFT JOIN categories
                ON products.category_id = categories.id
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la récupération des produits"
        );
    }
});


// GET - Un produit par ID
app.get("/products/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        const result = await client.query(
            "SELECT * FROM products WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send(
                "Produit introuvable"
            );
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la récupération du produit"
        );
    }
});


// PUT - Modifier un produit
app.put("/products/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const {
            prix,
            quantite,
            category_id
        } = req.body;

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        if (
            prix === undefined ||
            quantite === undefined ||
            category_id === undefined
        ) {
            return res.status(400).send(
                "prix, quantite et category_id sont obligatoires"
            );
        }

        if (typeof prix !== "number" || typeof quantite !== "number") {
            return res.status(400).send(
                "Le prix et la quantité doivent être des nombres"
            );
        }

        if (prix < 0) {
            return res.status(400).send(
                "Le prix ne peut pas être négatif"
            );
        }

        if (quantite < 0) {
            return res.status(400).send(
                "La quantité ne peut pas être négative"
            );
        }

        const result = await client.query(
            `UPDATE products
             SET prix = $1,
                 quantite = $2,
                 category_id = $3
             WHERE id = $4
             RETURNING *`,
            [prix, quantite, category_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send(
                "Produit introuvable"
            );
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la modification du produit"
        );
    }
});


// DELETE - Supprimer un produit
app.delete("/products/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        const result = await client.query(
            "DELETE FROM products WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send(
                "Produit introuvable"
            );
        }

        res.send(
            "Produit supprimé avec succès !"
        );

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la suppression du produit"
        );
    }
});


// ==============================
// CATÉGORIES
// ==============================

// POST - Ajouter une catégorie
app.post("/categories", async (req, res) => {
    try {
        const { nom } = req.body;

        if (!nom) {
            return res.status(400).send(
                "Le nom de la catégorie est obligatoire"
            );
        }

        const result = await client.query(
            `INSERT INTO categories (nom)
             VALUES ($1)
             RETURNING *`,
            [nom]
        );

        res.status(201).json({
            message: "Catégorie ajoutée avec succès !",
            category: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de l'ajout de la catégorie"
        );
    }
});


// GET - Toutes les catégories
app.get("/categories", async (req, res) => {
    try {
        const result = await client.query(
            "SELECT * FROM categories"
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la récupération des catégories"
        );
    }
});


// GET - Une catégorie par ID
app.get("/categories/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        const result = await client.query(
            "SELECT * FROM categories WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send(
                "Catégorie introuvable"
            );
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la récupération de la catégorie"
        );
    }
});


// PUT - Modifier une catégorie
app.put("/categories/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nom } = req.body;

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        if (!nom) {
            return res.status(400).send(
                "Le nom de la catégorie est obligatoire"
            );
        }

        const result = await client.query(
            `UPDATE categories
             SET nom = $1
             WHERE id = $2
             RETURNING *`,
            [nom, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send(
                "Catégorie introuvable"
            );
        }

        res.send(
            "Catégorie mise à jour avec succès !"
        );

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la modification de la catégorie"
        );
    }
});


// DELETE - Supprimer une catégorie
app.delete("/categories/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        const result = await client.query(
            "DELETE FROM categories WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send(
                "Catégorie introuvable"
            );
        }

        res.send(
            "Catégorie supprimée avec succès !"
        );

    } catch (error) {
        console.error(error);

        if (error.code === "23503") {
            return res.status(409).send(
                "Impossible de supprimer cette catégorie car elle est utilisée par un ou plusieurs produits"
            );
        }

        res.status(500).send(
            "Erreur lors de la suppression de la catégorie"
        );
    }
});


// ==============================
// COMMANDES
// ==============================

// POST - Créer une commande
app.post("/orders", async (req, res) => {
    try {
        const { client_id } = req.body;

        if (!client_id) {
            return res.status(400).send(
                "Le client_id est obligatoire"
            );
        }

        const existingClient = await client.query(
            "SELECT id FROM clients WHERE id = $1",
            [client_id]
        );

        if (existingClient.rows.length === 0) {
            return res.status(404).send(
                "Client introuvable"
            );
        }

        const result = await client.query(
            `INSERT INTO orders (client_id)
             VALUES ($1)
             RETURNING *`,
            [client_id]
        );

        res.status(201).json(
            result.rows[0]
        );

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la création de la commande"
        );
    }
});


// GET - Toutes les commandes
app.get("/orders", async (req, res) => {
    try {
        const result = await client.query(`
            SELECT
                orders.*,
                clients.nom,
                clients.prenom,
                clients.email
            FROM orders
            JOIN clients
                ON orders.client_id = clients.id
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la récupération des commandes"
        );
    }
});


// GET - Une commande
app.get("/orders/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        const result = await client.query(`
            SELECT
                orders.*,
                clients.nom,
                clients.prenom,
                clients.email
            FROM orders
            JOIN clients
                ON orders.client_id = clients.id
            WHERE orders.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).send(
                "Commande introuvable"
            );
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la récupération de la commande"
        );
    }
});


// PUT - Modifier une commande
app.put("/orders/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { client_id } = req.body;

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        if (!client_id) {
            return res.status(400).send(
                "Le client_id est obligatoire"
            );
        }

        const existingClient = await client.query(
            "SELECT id FROM clients WHERE id = $1",
            [client_id]
        );

        if (existingClient.rows.length === 0) {
            return res.status(404).send(
                "Client introuvable"
            );
        }

        const result = await client.query(
            `UPDATE orders
             SET client_id = $1
             WHERE id = $2
             RETURNING *`,
            [client_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send(
                "Commande introuvable"
            );
        }

        res.send(
            "Commande mise à jour avec succès !"
        );

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la modification de la commande"
        );
    }
});


// DELETE - Supprimer une commande
app.delete("/orders/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        const result = await client.query(
            "DELETE FROM orders WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send(
                "Commande introuvable"
            );
        }

        res.send(
            "Commande supprimée avec succès !"
        );

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la suppression de la commande"
        );
    }
});


// ==============================
// PRODUITS DES COMMANDES
// ==============================

// POST - Ajouter un produit à une commande
app.post("/order-products", async (req, res) => {
    try {
        const {
            order_id,
            product_id,
            quantite
        } = req.body;

        if (
            !order_id ||
            !product_id ||
            quantite === undefined
        ) {
            return res.status(400).send(
                "Tous les champs sont obligatoires"
            );
        }

        if (quantite <= 0) {
            return res.status(400).send(
                "La quantité doit être supérieure à 0"
            );
        }

        const existingOrder = await client.query(
            "SELECT id FROM orders WHERE id = $1",
            [order_id]
        );

        if (existingOrder.rows.length === 0) {
            return res.status(404).send(
                "Commande introuvable"
            );
        }

        const existingProduct = await client.query(
            "SELECT id FROM products WHERE id = $1",
            [product_id]
        );

        if (existingProduct.rows.length === 0) {
            return res.status(404).send(
                "Produit introuvable"
            );
        }

        const result = await client.query(
            `INSERT INTO order_products
            (order_id, product_id, quantite)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [order_id, product_id, quantite]
        );

        res.status(201).json({
            message: "Produit ajouté à la commande avec succès !",
            order_product: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de l'ajout du produit à la commande"
        );
    }
});


// GET - Tous les produits des commandes
app.get("/order-products", async (req, res) => {
    try {
        const result = await client.query(`
            SELECT
                order_products.id,
                order_products.order_id,
                order_products.product_id,
                products.nom AS produit,
                order_products.quantite
            FROM order_products
            JOIN products
                ON order_products.product_id = products.id
        `);

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la récupération des produits des commandes"
        );
    }
});


// GET - Un produit d'une commande
app.get("/order-products/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        const result = await client.query(`
            SELECT
                order_products.*,
                products.nom AS produit
            FROM order_products
            JOIN products
                ON order_products.product_id = products.id
            WHERE order_products.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).send(
                "Produit de commande introuvable"
            );
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la récupération"
        );
    }
});


// PUT - Modifier la quantité
app.put("/order-products/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { quantite } = req.body;

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        if (quantite === undefined) {
            return res.status(400).send(
                "La quantité est obligatoire"
            );
        }

        if (quantite <= 0) {
            return res.status(400).send(
                "La quantité doit être supérieure à 0"
            );
        }

        const result = await client.query(
            `UPDATE order_products
             SET quantite = $1
             WHERE id = $2
             RETURNING *`,
            [quantite, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send(
                "Produit de commande introuvable"
            );
        }

        res.send(
            "Quantité du produit de commande mise à jour avec succès !"
        );

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la modification"
        );
    }
});


// DELETE - Supprimer un produit d'une commande
app.delete("/order-products/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        const result = await client.query(
            "DELETE FROM order_products WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send(
                "Produit de commande introuvable"
            );
        }

        res.send(
            "Produit supprimé de la commande avec succès !"
        );

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la suppression"
        );
    }
});


// ==============================
// DÉTAILS D'UNE COMMANDE
// ==============================

app.get("/orders/:id/details", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).send(
                "ID invalide"
            );
        }

        const result = await client.query(`
            SELECT
                orders.id AS commande_id,
                orders.date_commande,
                clients.nom AS client_nom,
                clients.prenom AS client_prenom,
                products.nom AS produit,
                order_products.quantite
            FROM orders
            JOIN clients
                ON orders.client_id = clients.id
            JOIN order_products
                ON orders.id = order_products.order_id
            JOIN products
                ON order_products.product_id = products.id
            WHERE orders.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).send(
                "Commande introuvable"
            );
        }

        res.json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Erreur lors de la récupération des détails"
        );
    }
});


// ==============================
// DÉMARRAGE DU SERVEUR
// ==============================

startServer();