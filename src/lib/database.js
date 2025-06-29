import sqlite3 from 'sqlite3';

let db = null;

const getDatabase = () => {
  if (!db) {
    db = new sqlite3.Database('./database.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('Error connecting to the database:', err.message);
        // Depending on your application's needs, you might want to
        // throw the error, exit the process, or handle it differently.
      } else {
        console.log('Connected to the SQLite database.');
      }
    });

    // Set the database to serialized mode to ensure queries are executed one after another
    db.serialize(() => {
      // This block is just to ensure serialize is called,
      // actual queries will be handled where the db object is used.
    });
  }
  return db;
};

export default getDatabase;