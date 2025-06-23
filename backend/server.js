const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
});

async function waitForDB() {
  while (true) {
    try {
      await pool.query('SELECT 1');
      console.log('Banco de dados disponível');
      return;
    } catch (err) {
      console.log('Tentando conectar ao banco...');
      await new Promise(res => setTimeout(res, 5000)); // tenta a cada 5 segundos
    }
  }
}
async function waitForDB(retries = 10, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Banco de dados disponível');
      return;
    } catch (err) {
      console.log(`Tentando conectar ao banco... (${i + 1}/${retries})`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error('Não foi possível conectar ao banco de dados após várias tentativas');
}

async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id SERIAL PRIMARY KEY,
        descricao TEXT NOT NULL,
        concluida BOOLEAN DEFAULT false
      );
    `);
    console.log('Tabela "tarefas" verificada/criada com sucesso.');
  } catch (err) {
    console.error('Erro ao criar tabela:', err);
    process.exit(1);
  }
}

app.get('/api/tarefas', async (req, res) => {
  const result = await pool.query('SELECT * FROM tarefas ORDER BY id');
  res.json(result.rows);
});

app.post('/api/tarefas', async (req, res) => {
  const { descricao } = req.body;
  const result = await pool.query(
    'INSERT INTO tarefas (descricao, concluida) VALUES ($1, false) RETURNING *',
    [descricao]
  );
  res.status(201).json(result.rows[0]);
});

app.put('/api/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  const { descricao, concluida } = req.body;
  const result = await pool.query(
    'UPDATE tarefas SET descricao = $1, concluida = $2 WHERE id = $3 RETURNING *',
    [descricao, concluida, id]
  );
  res.json(result.rows[0]);
});

app.delete('/api/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM tarefas WHERE id = $1', [id]);
  res.sendStatus(204);
});

async function startServer() {
  try {
    await waitForDB();    
    await initDB();        
    app.listen(3000, () => {
      console.log('Servidor rodando na porta 3000');
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();
