const request = require('supertest');
const {app} = require('../src/app');

describe('Tests des endpoints', () => {
  it('Devrait retourner les messages via GET /messages', async () => {
    const response = await request(app).get('/messages');
    expect(response.status).toBe(200);
  });

  it('Devrait retourner la vue addmessages via GET /addmessages', async () => {
    const response = await request(app).get('/addmessages');
    expect(response.status).toBe(200);
  });

  it('Devrait ajouter un nouveau message via POST /addmessages', async () => {
    const newMessage = {
      sender: 'Expéditeur',
      sendto: 'Destinataire',
      message: 'Contenu du message',
    };

    const response = await request(app).post('/addmessages').send(newMessage);

    expect(response.status).toBe(302);
  });

  it('Devrait supprimer un message via DELETE /messages/:id', async () => {
    // Ajoutez un message pour le supprimer ensuite
    const newMessage = {
      sender: 'test',
      sendto: 'test',
      message: 'message test',
    };

    const addResponse = await request(app).post('/addmessages')
        .send(newMessage);

    const redirectUrl = addResponse.headers.location;
    const urlParts = redirectUrl.split('?');
    const params = new URLSearchParams(urlParts[1]);
    const messageId = params.get('id');

    const deleteResponse = await request(app).delete(`/messages/${messageId}`);
    expect(deleteResponse.status).toBe(200);
  });
});
