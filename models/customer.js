/** Customer for Lunchly */

const db = require('../db');
const Reservation = require('./reservation');

/** Customer of the restaurant. */
class Customer {
    constructor({ id, firstName, lastName, phone, notes }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.notes = notes;
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    /** find all customers. */
    static async all() {
        const results = await db.query(
            `SELECT id,
         first_name AS "firstName",
         last_name AS "lastName",
         phone,
         notes
       FROM customers
       ORDER BY last_name, first_name`
        );
        return results.rows.map((c) => new Customer(c));
    }

    // find customers by name.
    static async getByName(name) {
        const results = await db.query(
            `SELECT id, first_name AS "firstName", last_name AS "lastName", phone, notes FROM customers
             WHERE LOWER(first_name) = $1`,
            [name.toLowerCase()]
        );

        if (results.rows.length === 0) {
            const err = new Error(`There's no customer with the name: ${name}`);
            err.status = 404;
            throw err;
        }

        const customers = results.rows.map(
            (customer) => new Customer(customer)
        );
        return customers;
    }

    // finds top 10 customers by reservations
    static async getTopTenCustomersByReservations() {
        const results = await db.query(
            `
            SELECT c.id AS "id", c.first_name AS "firstName", c.last_name AS "lastName", c.phone AS "phone", c.notes AS "notes", COUNT(r.customer_id) AS num_reservations FROM customers c JOIN reservations r ON c.id = r.customer_id GROUP BY c.id ORDER BY num_reservations DESC LIMIT 10;
            `
        );

        const customers = results.rows.map((customer) => {
            const { id, firstName, lastName, phone, notes } = customer;
            return new Customer({ id, firstName, lastName, phone, notes });
        });

        return customers;
    }

    /** get a customer by ID. */
    static async get(id) {
        const results = await db.query(
            `SELECT id,
         first_name AS "firstName",
         last_name AS "lastName",
         phone,
         notes
        FROM customers WHERE id = $1`,
            [id]
        );

        const customer = results.rows[0];

        if (customer === undefined) {
            const err = new Error(`No such customer: ${id}`);
            err.status = 404;
            throw err;
        }

        return new Customer(customer);
    }

    /** get all reservations for this customer. */
    async getReservations() {
        return await Reservation.getReservationsForCustomer(this.id);
    }

    /** save this customer. */
    async save() {
        if (this.id === undefined) {
            const result = await db.query(
                `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
                [this.firstName, this.lastName, this.phone, this.notes]
            );
            this.id = result.rows[0].id;
        } else {
            await db.query(
                `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
                [this.firstName, this.lastName, this.phone, this.notes, this.id]
            );
        }
    }
}

module.exports = Customer;
