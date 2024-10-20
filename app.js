const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config();

const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code to authenticate with WhatsApp');
});

client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

client.on('message', async (message) => {
    console.log(`Message reçu : ${message.body}`);

    if (message.body) {
        const response = await sendToGemini(message.body);
        
        if (response) {
            message.reply(response);
        } else {
            message.reply('Désolé, je n\'ai pas compris votre demande.');
        }
    }
});

async function sendToGemini(userMessage) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        
        const prompt = `Tu es un assistant virtuel. L'utilisateur a dit : "${userMessage}". Réponds de façon claire et concise pour l'aider. Répond de façon simple et résumé.`;


        const body = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt 
                        }
                    ]
                }
            ]
        };

        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Log pour le débogage
        console.log('Réponse API complète:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.candidates && response.data.candidates[0] && 
            response.data.candidates[0].content && response.data.candidates[0].content.parts) {
            
            const generatedText = response.data.candidates[0].content.parts[0].text;
            return generatedText;
        } else {
            return 'Réponse inattendue de l\'API.';
        }

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Gemini :', error.response?.data || error.message);
        return 'Il y a eu un problème avec la génération du contenu.';
    }
}



client.initialize();

