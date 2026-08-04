const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');

content = content.replace(/@default\("([0-9.]+)"\)/g, '@default($1)');

fs.writeFileSync('prisma/schema.prisma', content);
