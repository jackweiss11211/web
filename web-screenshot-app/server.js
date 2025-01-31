const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure results directory exists
const RESULTS_DIR = path.join(__dirname, 'results');
if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static('public'));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Browser launch options for Render
const BROWSER_OPTIONS = process.env.NODE_ENV === 'production' 
    ? { 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        headless: true 
    } 
    : {};

app.post('/search', async (req, res) => {
    const { query } = req.body;
    
    try {
        console.log(`Starting search for query: ${query}`);
        const browser = await puppeteer.launch(BROWSER_OPTIONS);
        const page = await browser.newPage();
        
        // Navigate to Google search
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // Create a directory for this search
        const searchDir = path.join(RESULTS_DIR, `search_${Date.now()}`);
        fs.mkdirSync(searchDir, { recursive: true });
        
        // Take screenshot
        await page.screenshot({ path: path.join(searchDir, 'search_results.png'), fullPage: true });
        
        // Get HTML content
        const htmlContent = await page.content();
        fs.writeFileSync(path.join(searchDir, 'search_results.html'), htmlContent);
        
        await browser.close();
        
        // Create zip file
        const zipPath = path.join(searchDir, 'search_results.zip');
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip');
        
        output.on('close', () => {
            console.log(`Search results zipped: ${zipPath}`);
            res.download(zipPath);
        });
        
        archive.pipe(output);
        archive.file(path.join(searchDir, 'search_results.png'), { name: 'search_results.png' });
        archive.file(path.join(searchDir, 'search_results.html'), { name: 'search_results.html' });
        
        await archive.finalize();
        
    } catch (error) {
        console.error('Error in search:', error);
        res.status(500).json({ 
            error: 'Failed to perform search', 
            details: error.message 
        });
    }
});

app.post('/screenshot', async (req, res) => {
    const { url } = req.body;
    
    try {
        console.log(`Taking screenshot of: ${url}`);
        const browser = await puppeteer.launch(BROWSER_OPTIONS);
        const page = await browser.newPage();
        
        // Navigate to specified URL
        await page.goto(url, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // Create a directory for this screenshot
        const screenshotDir = path.join(RESULTS_DIR, `screenshot_${Date.now()}`);
        fs.mkdirSync(screenshotDir, { recursive: true });
        
        // Take screenshot
        await page.screenshot({ path: path.join(screenshotDir, 'webpage_screenshot.png'), fullPage: true });
        
        // Get HTML content
        const htmlContent = await page.content();
        fs.writeFileSync(path.join(screenshotDir, 'webpage.html'), htmlContent);
        
        await browser.close();
        
        // Create zip file
        const zipPath = path.join(screenshotDir, 'webpage_results.zip');
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip');
        
        output.on('close', () => {
            console.log(`Webpage screenshot zipped: ${zipPath}`);
            res.download(zipPath);
        });
        
        archive.pipe(output);
        archive.file(path.join(screenshotDir, 'webpage_screenshot.png'), { name: 'webpage_screenshot.png' });
        archive.file(path.join(screenshotDir, 'webpage.html'), { name: 'webpage.html' });
        
        await archive.finalize();
        
    } catch (error) {
        console.error('Error in screenshot:', error);
        res.status(500).json({ 
            error: 'Failed to take screenshot', 
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
