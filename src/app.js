const {writeFile} = require('fs').promises;
const fs = require('fs');
const f = require('fs/promises');
const path = require('path');
const bodyParser = require('body-parser');


const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));


const messagesFile = 'messages.json';


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=1');
  next();
});

app.get('/', (req, res) => {
  res.render('accueil');
});

app.get('/messages', async (req, res) => {
  try {
    if (!fs.existsSync(messagesFile)) {
      const id = new Date().valueOf();
      // eslint-disable-next-line max-len
      await writeFile(messagesFile, JSON.stringify([{sender: 'sender', sendto: 'sendto', id, message: 'vide'}], null, 2 ));
    }

    const data = await f.readFile(messagesFile, 'utf-8');
    const parsedData = JSON.parse(data);
    res.render('messages', {messages: parsedData});
  } catch (error) {
    res.status(500).send('Erreur : ' + error.message);
  }
});

app.get('/addmessages', (req, res) => {
  res.render('addmessages');
});


app.post('/addmessages', async (req, res) => {
  try {
    const {sender, sendto, message} = req.body;
    const id = new Date().valueOf();

    const data = await f.readFile(messagesFile, 'utf-8');
    const jsonData = JSON.parse(data);

    jsonData.push({sender, sendto, id, message});

    await f.writeFile(messagesFile, JSON.stringify(jsonData, null, 2));


    res.redirect(`/messages?id=${id}`);
  } catch (error) {
    res.status(500).send('Erreur : ' + error.message);
  }
});


// promise then
app.delete('/messages/:id', (req, res) => {
  const messageId = parseInt(req.params.id);

  f.readFile(messagesFile, 'utf-8')
      .then((data) => {
        const messages = JSON.parse(data);
        // eslint-disable-next-line max-len
        const updatedMessages = messages.filter((message) => message.id !== messageId);

        if (updatedMessages.length === messages.length) {
          res.sendStatus(404);
          return;
        }

        // eslint-disable-next-line max-len
        return f.writeFile(messagesFile, JSON.stringify(updatedMessages, null, 2))
            .then(() => {
              res.sendStatus(200);
            });
      })
      .catch((error) => {
        res.sendStatus(500, error);
      });
});

module.exports = app;
