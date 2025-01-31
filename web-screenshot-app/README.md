# Web Screenshot & Search App

## Overview
This is a simple Express.js application that allows users to:
1. Perform a Google search and download the search results as a zip file containing a screenshot and HTML
2. Take a screenshot of a specific website and download it as a zip file with the screenshot and HTML

## Prerequisites
- Node.js (v14 or higher)
- npm

## Installation
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start the server

## Dependencies
- Express.js
- Puppeteer (for web scraping and screenshots)
- Archiver (for creating zip files)
- Axios (for HTTP requests)

## Usage
1. Open `http://localhost:3000` in your browser
2. Enter a search query or website URL
3. Click the respective button to generate and download results

## Security Note
- Be cautious when entering URLs and search queries
- The application uses Puppeteer to generate screenshots, which requires a browser environment
