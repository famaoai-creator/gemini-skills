const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const rootDir = process.argv[2] || '.';

// Common schema file patterns
const patterns = [
    '**/*.sql',
    '**/schema.prisma',
    '**/swagger.json',
    '**/openapi.yaml',
    '**/openapi.yml',
    '**/models.py', // Django/SQLAlchemy
    '**/Schema.js', // Mongoose
    '**/entity/*.ts' // TypeORM
];

console.log(`Searching for schema definitions in: ${rootDir}...`);

const files = globSync(patterns, { 
    cwd: rootDir, 
    ignore: ['node_modules/**', 'dist/**', 'build/**'] 
});

if (files.length === 0) {
    console.log("No common schema files found.");
    process.exit(0);
}

files.forEach(file => {
    console.log(`\n\n--- [SCHEMA FILE] ${file} ---`);
    try {
        const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
        // Truncate if too huge, but usually schemas are important enough to read fully
        if (content.length > 20000) {
            console.log(content.substring(0, 20000) + "\n... (Truncated)");
        } else {
            console.log(content);
        }
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});
