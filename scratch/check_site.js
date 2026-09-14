const fs = require('fs');
const path = require('path');

const root = __dirname ? path.dirname(__dirname) : process.cwd();

function getHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file !== 'scratch' && file !== 'node_modules' && file !== '.git') {
                results = results.concat(getHtmlFiles(filePath));
            }
        } else if (file.endsWith('.html')) {
            results.push(filePath);
        }
    });
    return results;
}

const htmlFiles = getHtmlFiles(root);
console.log(`Found ${htmlFiles.length} HTML files to verify.`);

let totalMissing = 0;

htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(root, file);
    const srcRegex = /(?:src|href)=["']([^"']+)["']/g;
    let match;
    const missing = [];

    while ((match = srcRegex.exec(content)) !== null) {
        const ref = match[1];
        if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('#') || ref.startsWith('data:') || ref.startsWith('mailto:') || ref.startsWith('tel:')) {
            continue;
        }
        const cleanRef = ref.split('?')[0].split('#')[0];
        if (!cleanRef) continue;
        const fullPath = path.join(path.dirname(file), cleanRef);
        if (!fs.existsSync(fullPath)) {
            missing.push(ref);
        }
    }

    if (missing.length > 0) {
        console.log(`❌ ${relativePath}: Missing ${missing.length} reference(s):`, missing);
        totalMissing += missing.length;
    } else {
        console.log(`✓ ${relativePath}: All local references valid.`);
    }
});

console.log(`\nVerification complete. Total missing references: ${totalMissing}`);
