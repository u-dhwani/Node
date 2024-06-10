const { Client } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');
const async = require('async');

// Database connection details
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'eVital',
  password: 'Sdkk@2001',
  port: 5432,
});

// Connect to the database
client.connect();

// Name of the table to insert data into
const tableName = 'medications';

// Path to the CSV file
const csvFilePath = 'C:/Users/Evita/Downloads/medicine_dataset_similarity.csv';

// Create a table (you can skip this step if the table already exists)
const createTableQuery = `
CREATE TABLE IF NOT EXISTS public.medications
(
    id integer NOT NULL,
    name character varying( 1024),
    substitute0 character varying( 1024),
    substitute1 character varying( 1024),
    substitute2 character varying( 1024),
    substitute3 character varying( 1024),
    substitute4 character varying( 1024),
    sideeffect0 character varying( 1024),
    sideeffect1 character varying( 1024),
    sideeffect2 character varying( 1024),
    sideeffect3 character varying( 1024),
    sideeffect4 character varying( 1024),
    sideeffect5 character varying( 1024),
    sideeffect6 character varying( 1024),
    sideeffect7 character varying( 1024),
    sideeffect8 character varying( 1024),
    sideeffect9 character varying( 1024),
    sideeffect10 character varying( 1024),
    sideeffect11 character varying( 1024),
    sideeffect12 character varying( 1024),
    sideeffect13 character varying( 1024),
    sideeffect14 character varying( 1024),
    sideeffect15 character varying( 1024),
    sideeffect16 character varying( 1024),
    sideeffect17 character varying( 1024),
    sideeffect18 character varying( 1024),
    sideeffect19 character varying( 1024),
    sideeffect20 character varying( 1024),
    sideeffect21 character varying( 1024),
    sideeffect22 character varying( 1024),
    sideeffect23 character varying( 1024),
    sideeffect24 character varying( 1024),
    sideeffect25 character varying( 1024),
    sideeffect26 character varying( 1024),
    sideeffect27 character varying( 1024),
    sideeffect28 character varying( 1024),
    sideeffect29 character varying( 1024),
    sideeffect30 character varying( 1024),
    sideeffect31 character varying( 1024),
    sideeffect32 character varying( 1024),
    sideeffect33 character varying( 1024),
    sideeffect34 character varying( 1024),
    sideeffect35 character varying( 1024),
    sideeffect36 character varying( 1024),
    sideeffect37 character varying( 1024),
    sideeffect38 character varying( 1024),
    sideeffect39 character varying( 1024),
    sideeffect40 character varying( 1024),
    sideeffect41 character varying( 1024),
    use0 character varying( 1024),
    use1 character varying( 1024),
    use2 character varying( 1024),
    use3 character varying( 1024),
    use4 character varying( 1024),
    chemical character varying( 1024),
    habit character varying( 1024),
    therapeutic character varying( 1024),
    action_class character varying( 1024),
    CONSTRAINT medications_pkey PRIMARY KEY (id)
)
`;

client.query(createTableQuery)
  .then(() => {
    // Create a queue with a concurrency limit of 1 to control the flow of inserts
    const queue = async.queue((task, callback) => {
      const values = Object.values(task.row);
      const insertQuery = `INSERT INTO ${tableName} VALUES (${values.map((_, i) => `$${i + 1}`).join(', ')});`;
      client.query(insertQuery, values)
        .then(() => callback())
        .catch(err => {
          console.error('Error inserting row:', err);
          callback();
        });
    }, 1); // Set concurrency to 1 to process one row at a time

    // Read the CSV file and enqueue each row
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        queue.push({ row });
      })
      .on('end', () => {
        queue.drain(() => {
          console.log('CSV file successfully processed');
          client.end();
        });
      });
  })
  .catch(err => {
    console.error('Error creating table:', err);
    client.end();
  });

