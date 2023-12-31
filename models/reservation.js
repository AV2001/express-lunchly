/** Reservation for Lunchly */

const moment = require('moment');

const db = require('../db');

/** A reservation for a party */
class Reservation {
    constructor({ id, customerId, numGuests, startAt, notes }) {
        this.id = id;
        this.customerId = customerId;
        this.numGuests = numGuests;
        this._startAt = startAt;
        this.notes = notes;
    }

    // Getter for startAt
    get startAt() {
        return this._startAt;
    }

    // Setter for startAt
    set startAt(val) {
        if (!(val instanceof Date)) {
            throw new Error('startAt must be a Date object.');
        }
        this._startAt = val;
    }

    /** formatter for startAt */
    getformattedStartAt() {
        return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
    }

    /** given a customer id, find their reservations. */
    static async getReservationsForCustomer(customerId) {
        const results = await db.query(
            `SELECT id,
           customer_id AS "customerId",
           num_guests AS "numGuests",
           start_at AS "startAt",
           notes AS "notes"
         FROM reservations
         WHERE customer_id = $1`,
            [customerId]
        );

        return results.rows.map((row) => new Reservation(row));
    }

    // save a reservation
    async save() {
        const result = await db.query(
            `
                INSERT INTO reservations (customer_id, start_at, num_guests, notes)
                VALUES ($1, $2, $3, $4)
                RETURNING id;
                `,
            [this.customerId, this.startAt, this.numGuests, this.notes]
        );

        this.id = result.rows[0].id;
    }
}

module.exports = Reservation;
