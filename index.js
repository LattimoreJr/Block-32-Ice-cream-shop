const express = require('express')
const app = express()
const pg = require('pg')
const client = new pg.Client(process.env.DATABASE || 'postgres://localhost/ice_cream_shop')
app.use(express.json())

app.get('/api/flavors', async (req,res,next) => {
    try {
        const SQL = `
            SELECT *
            FROM flavors
        `
        const response = await client.query(SQL)
        res.send(response.rows)

    } catch (error) {
        next(error)
    }
})

app.get('/api/flavors/:id', async (req,res,next) => {
    console.log(req.params.id)
    try {
        const SQL = `
            SELECT *
            FROM flavors
            WHERE id = $1
        `
        const response = await client.query(SQL, [req.params.id])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})

app.post('/api/flavors', async (req,res,next) => {
    try {
        const SQL = `
            INSERT INTO flavors(name, is_favorite)
            VALUES ($1, $2)
            RETURNING *
        `
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite])
    } catch (error) {
        next(error)
    }
})

app.delete('/api/flavors/:id', async (req,res,next) => {
    try {
        const SQL = `
            DELETE FROM flavors
            WHERE id = $1
        `
        await client.query(SQL, [req.params.id])
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

app.put('/api/flavors/:id', async (req,res,next) => {
    try {
        const SQL = `
            UPDATE flavors
            SET name = $1, is_favorite = $2, updated_at = now()
            WHERE id = $3
            RETURNING *
        `
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})


const init = async () => {
    await client.connect()
    console.log('connected to database')

    const SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            is_favorite BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        );

        INSERT INTO flavors (name, is_favorite) VALUES ('chocolate', FALSE);
        INSERT INTO flavors (name, is_favorite) VALUES ('vanilla', FALSE);
        INSERT INTO flavors (name, is_favorite) VALUES ('strawberry', FALSE);
        INSERT INTO flavors (name, is_favorite) VALUES ('cookie dough', TRUE);
    `
    await client.query(SQL)
    

    const PORT = 1337 || process.env.PORT
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`)
    })
}

init()