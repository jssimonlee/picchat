const fs = require('fs');
const path = require('path');

// Source SQLite file (engStudy D1 local DB cache)
const srcDir = 'C:\\Users\\user\\Documents\\python\\engStudy\\.wrangler\\state\\v3\\d1\\miniflare-D1DatabaseObject';
const destDir = path.join(__dirname, 'cloudflare-worker', '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');

try {
    if (!fs.existsSync(srcDir)) {
        console.error('Source directory does not exist. Make sure engStudy has been run locally:', srcDir);
        process.exit(1);
    }

    const srcFiles = fs.readdirSync(srcDir).filter(f => f.endsWith('.sqlite'));
    if (srcFiles.length === 0) {
        console.error('No .sqlite file found in the source directory.');
        process.exit(1);
    }

    const srcFile = path.join(srcDir, srcFiles[0]);

    if (!fs.existsSync(destDir)) {
        console.log('Destination directory does not exist yet. Creating directory...');
        fs.mkdirSync(destDir, { recursive: true });
    }

    const destFiles = fs.readdirSync(destDir).filter(f => f.endsWith('.sqlite'));
    if (destFiles.length === 0) {
        console.log('--------------------------------------------------');
        console.log('Tip: Please run wrangler dev first!');
        console.log('Go to "cloudflare-worker" and run "npx wrangler dev".');
        console.log('This will auto-generate the local D1 SQLite cache files.');
        console.log('After that, run this script again to sync the vocabulary data.');
        console.log('--------------------------------------------------');
    } else {
        // Copy the SQLite file into all generated database instances in picComm worker to ensure VOCAB_DB is populated
        destFiles.forEach(destFileName => {
            const destPath = path.join(destDir, destFileName);
            fs.copyFileSync(srcFile, destPath);
            console.log(`[Synced] Copied vocabulary database to: ${destFileName}`);
        });
        console.log('Vocabulary D1 Local Database is successfully synced!');
    }
} catch (e) {
    console.error('Failed to sync database:', e.message);
}
