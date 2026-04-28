// Vercel Serverless Function — Create Yoco Checkout Session
// POST /api/create-checkout
// Securely calls Yoco API with the secret key stored in environment variables

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS headers for same-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const secretKey = process.env.YOCO_SECRET_KEY;

    if (!secretKey) {
        console.error('YOCO_SECRET_KEY environment variable is not set');
        return res.status(500).json({ error: 'Payment service not configured' });
    }

    try {
        const { amount, currency, packageName, customerName, customerEmail, customerPhone, businessName, notes } = req.body;

        // Validate required fields
        if (!amount || !currency) {
            return res.status(400).json({ error: 'Amount and currency are required' });
        }

        if (amount < 100) {
            return res.status(400).json({ error: 'Amount must be at least 100 cents (R1.00)' });
        }

        // Determine the base URL dynamically from the request headers
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const baseUrl = `${protocol}://${host}`;

        // Build metadata for reconciliation
        const metadata = {
            packageName: packageName || 'Unknown',
            customerName: customerName || '',
            customerEmail: customerEmail || '',
            customerPhone: customerPhone || '',
            businessName: businessName || '',
            notes: notes || '',
            source: 'm1creative-website'
        };

        // Create checkout session with Yoco
        const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: parseInt(amount, 10),
                currency: currency || 'ZAR',
                successUrl: `${baseUrl}/success.html?package=${encodeURIComponent(packageName || '')}`,
                cancelUrl: `${baseUrl}/cancel.html`,
                failureUrl: `${baseUrl}/cancel.html?reason=failed`,
                metadata: metadata
            })
        });

        const yocoData = await yocoResponse.json();

        if (!yocoResponse.ok) {
            console.error('Yoco API error:', yocoData);
            return res.status(yocoResponse.status).json({
                error: yocoData.message || 'Failed to create checkout session'
            });
        }

        // Return the redirect URL to the frontend
        return res.status(200).json({
            redirectUrl: yocoData.redirectUrl,
            checkoutId: yocoData.id
        });

    } catch (error) {
        console.error('Checkout creation error:', error);
        return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
    }
};
