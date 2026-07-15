exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json; charset=utf-8'
    };

    // Handle CORS preflight options request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { message } = JSON.parse(event.body);

        // Fallback to hardcoded default values if Netlify environment variables are not set
        const token = process.env.TELEGRAM_BOT_TOKEN || '8802469465:AAE776SGF3vZEKe1RXRdSRf_R0h6-KnmCd4';
        const chatId = process.env.TELEGRAM_CHAT_ID || '712256368';

        const botUrl = `https://api.telegram.org/bot${token}/sendMessage`;

        // Using Node 18+ global fetch API
        const response = await fetch(botUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        });

        const resData = await response.json();

        if (resData.ok) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        } else {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Telegram API returned error', details: resData })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
