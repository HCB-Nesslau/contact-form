const { Octokit } = require('@octokit/rest');

// CORS headers for iframe embedding
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // In production, replace with your Jimdo domain
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
            .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
            .setHeader('Access-Control-Allow-Headers', 'Content-Type')
            .end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get GitHub token from environment variable
        const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
        const REPO_OWNER = process.env.REPO_OWNER; // Your GitHub username
        const REPO_NAME = 'member-list'; // Your private repo name

        if (!GITHUB_TOKEN || !REPO_OWNER) {
            console.error('Missing environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const octokit = new Octokit({ auth: GITHUB_TOKEN });

        // Extract form data
        const { anrede, name, vorname, adresse, plz, ort, email, tel, status, betrag, beitritt, referenz } = req.body;

        // Validate required fields
        if (!anrede || !name || !vorname || !adresse || !plz || !ort || !email || !status || !betrag) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get current members.csv file
        let currentContent = '';
        let currentSha = '';

        try {
            const { data } = await octokit.repos.getContent({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: 'members.csv',
            });

            currentContent = Buffer.from(data.content, 'base64').toString('utf-8');
            currentSha = data.sha;
        } catch (error) {
            if (error.status === 404) {
                // File doesn't exist, create header
                currentContent = 'Anrede,Name,Vorname,Adresse,PLZ,Ort,Email,Tel.,Status,Betrag,Beitritt,Referenz:\n';
            } else {
                throw error;
            }
        }

        // Create CSV row (escape fields that might contain commas)
        const csvRow = `${anrede},${name},${vorname},${adresse},${plz},${ort},${email},${tel || ''},${status},${betrag},${beitritt},${referenz || ''}\n`;

        // Append new row to content
        const newContent = currentContent + csvRow;

        // Commit the updated file
        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: 'members.csv',
            message: `Add new member: ${vorname} ${name}`,
            content: Buffer.from(newContent, 'utf-8').toString('base64'),
            sha: currentSha || undefined,
        });

        // Set CORS headers and return success
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        return res.status(200).json({
            success: true,
            message: 'Member added successfully'
        });

    } catch (error) {
        console.error('Error:', error);

        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(500).json({
            error: 'Failed to process submission',
            details: error.message
        });
    }
};
