// tsc only emits .ts files. The Handlebars email templates are read from disk at runtime
// (see src/templates/template.handler.ts), so they must be copied next to the compiled output.
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const from = path.join(src, entry.name);
        const to = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(from, to);
        } else {
            fs.copyFileSync(from, to);
        }
    }
}

copyDir(path.join('src', 'templates', 'email'), path.join('dist', 'src', 'templates', 'email'));
console.log('Email templates copied to dist/src/templates/email');
