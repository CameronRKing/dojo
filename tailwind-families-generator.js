// get all tailwind classes, barring variants (for now)
const fs = require('fs');
const postcss = require('postcss');

let str;
fs.readFile('node_modules/tailwindcss/dist/utilities.css', 'utf8', (err, s) => str = s);
let root = postcss.parse(str);
let classRules = [];
root.walkRules(/^\.[^:]+$/, rule => classRules.push(rule));

// group by property affected
const families = classRules.reduce((families, rule) => {
    const propsHash = rule.nodes.map(node => node.prop).sort().join('-');
    if (!families[propsHash]) families[propsHash] = [];
    families[propsHash].push(rule.selector.replace('\\', ''));
    return families;
}, {})

fs.writeFile('tailwind-families.json', JSON.stringify(families, null, 4), () => {});

