const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const inputFile = 'work/非機能要求グレード2018/06_活用シート.xls';
const outputFile = 'nonfunctional/requirements.yaml';

try {
    const workbook = XLSX.readFile(inputFile);
    const sheetName = '非機能要求グレード活用シート';
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
    }

    // Convert sheet to array of arrays
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Parse logic
    // Header rows are likely rows 0 and 1 (0-based index)
    // Data starts from row 2
    
    // Column Mapping based on visual inspection
    const COL = {
        ID: 0,
        CATEGORY: 1,
        SUB_CATEGORY: 2,
        ITEM: 3,
        DESC: 4,
        METRICS: 7,
        L0: 8,
        L1: 9,
        L2: 10,
        L3: 11,
        L4: 12,
        L5: 13,
        // Model cases (Approximate indices, need to be flexible)
        MODEL_LOW: 16,
        MODEL_MID: 19,
        MODEL_HIGH: 22
    };

    const requirements = [];
    let currentCategory = null;
    let currentSubCategory = null;
    let currentItemName = null;
    let currentDesc = null;

    // Start iterating from row 2
    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        
        // Skip empty rows or rows without ID
        if (!row[COL.ID]) continue;

        const id = row[COL.ID];
        const categoryName = row[COL.CATEGORY];
        const subCategoryName = row[COL.SUB_CATEGORY];
        const itemName = row[COL.ITEM];
        const desc = row[COL.DESC];
        const metrics = row[COL.METRICS];

        // Update hierarchy state
        if (categoryName) {
            let catObj = requirements.find(c => c.category === categoryName);
            if (!catObj) {
                catObj = { category: categoryName, sub_categories: [] };
                requirements.push(catObj);
            }
            currentCategory = catObj;
        }

        if (subCategoryName) {
            if (!currentCategory) {
                currentCategory = { category: "Unknown", sub_categories: [] };
                requirements.push(currentCategory);
            }
            let subCatObj = currentCategory.sub_categories.find(s => s.name === subCategoryName);
            if (!subCatObj) {
                subCatObj = { name: subCategoryName, items: [] };
                currentCategory.sub_categories.push(subCatObj);
            }
            currentSubCategory = subCatObj;
        }

        // Item Name & Desc inheritance (for merged cells)
        if (itemName) {
            currentItemName = itemName;
        }
        if (desc) {
            currentDesc = desc;
        }

        if (!currentSubCategory) continue;

        const item = {
            id: id,
            name: currentItemName,
            description: currentDesc ? currentDesc.trim() : "",
            metrics: metrics ? metrics.trim() : "",
            levels: {},
            model_case_levels: {}
        };

        // Levels
        if (row[COL.L0] !== undefined) item.levels[0] = String(row[COL.L0]).trim();
        if (row[COL.L1] !== undefined) item.levels[1] = String(row[COL.L1]).trim();
        if (row[COL.L2] !== undefined) item.levels[2] = String(row[COL.L2]).trim();
        if (row[COL.L3] !== undefined) item.levels[3] = String(row[COL.L3]).trim();
        if (row[COL.L4] !== undefined) item.levels[4] = String(row[COL.L4]).trim();
        if (row[COL.L5] !== undefined) item.levels[5] = String(row[COL.L5]).trim();

        // Model Cases (Optional)
        if (row[COL.MODEL_LOW] !== undefined) item.model_case_levels.low_impact = row[COL.MODEL_LOW];
        if (row[COL.MODEL_MID] !== undefined) item.model_case_levels.mid_impact = row[COL.MODEL_MID];
        if (row[COL.MODEL_HIGH] !== undefined) item.model_case_levels.high_impact = row[COL.MODEL_HIGH];

        currentSubCategory.items.push(item);
    }

    // Output YAML
    const yamlStr = yaml.dump({ nonfunctional_requirements: requirements }, { lineWidth: -1 }); // Unlimited line width to prevent weird wrapping
    fs.writeFileSync(outputFile, yamlStr, 'utf8');
    
    console.log(`Successfully converted to ${outputFile}`);

} catch (error) {
    console.error("Error:", error);
    process.exit(1);
}
