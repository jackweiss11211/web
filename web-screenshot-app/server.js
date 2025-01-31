const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/search', async (req, res) => {
    const { query } = req.body;
    
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Navigate to Google search
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle0' });
        
        // Create a directory for this search
        const searchDir = path.join(__dirname, 'results', `search_${Date.now()}`);
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
            res.download(zipPath);
        });
        
        archive.pipe(output);
        archive.file(path.join(searchDir, 'search_results.png'), { name: 'search_results.png' });
        archive.file(path.join(searchDir, 'search_results.html'), { name: 'search_results.html' });
        
        await archive.finalize();
        
    } catch (error) {
        console.error('Error in search:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

app.post('/screenshot', async (req, res) => {
    const { url } = req.body;
    
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Navigate to specified URL
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        // Create a directory for this screenshot
        const screenshotDir = path.join(__dirname, 'results', `screenshot_${Date.now()}`);
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
            res.download(zipPath);
        });
        
        archive.pipe(output);
        archive.file(path.join(screenshotDir, 'webpage_screenshot.png'), { name: 'webpage_screenshot.png' });
        archive.file(path.join(screenshotDir, 'webpage.html'), { name: 'webpage.html' });
        
        await archive.finalize();
        
    } catch (error) {
        console.error('Error in screenshot:', error);
        res.status(500).json({ error: 'Failed to take screenshot' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
