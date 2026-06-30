const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app       = express();
const USER      = process.env.LOJINHA_USER || 'admin';
const PASS      = process.env.LOJINHA_PASS || 'lojinha123';
const PORT      = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Token gerado uma vez por sessão do servidor (uso local)
const TOKEN = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Abre o app em localhost:3000
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'minha-lojinha.html'));
});

// ---------- LOGIN ----------
app.post('/api/login', (req, res) => {
  const { user, pass } = req.body || {};
  if (user === USER && pass === PASS) {
    res.json({ ok: true, token: TOKEN });
  } else {
    res.status(401).json({ ok: false, msg: 'Usuário ou senha incorretos.' });
  }
});

// ---------- AUTH ----------
function auth(req, res, next) {
  if ((req.headers.authorization || '') === 'Bearer ' + TOKEN) return next();
  res.status(401).json({ ok: false, msg: 'Não autorizado.' });
}

// ---------- CARREGAR DADOS ----------
app.get('/api/data', auth, (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) return res.json({});
    res.json(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
  } catch {
    res.json({});
  }
});

// ---------- SALVAR DADOS ----------
app.post('/api/data', auth, (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, msg: e.message });
  }
});

app.listen(PORT, () => {
  console.log('\n🌸  Minha Lojinha rodando!');
  console.log(`    Abra no navegador: http://localhost:${PORT}`);
  console.log(`    Usuário: ${USER}   |   Senha: ${PASS}\n`);
});
