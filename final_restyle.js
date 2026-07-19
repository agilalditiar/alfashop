const fs = require('fs');
const path = require('path');

const filesToRestyle = [
  'app/admin/pesanan/page.tsx',
  'app/admin/produk/page.tsx',
];

const colorMap = {
  'bg-[#dcfce7]': 'bg-admin-primary/10',
  'text-[#10b981]': 'text-admin-primary',
  'bg-[#d2bbff]': 'bg-admin-secondary-container/50',
  'bg-[#ffe4e6]': 'bg-admin-error-container/20',
  'text-[#dfd7e6]': 'text-admin-outline-variant',
  'border-[#dfd7e6]': 'border-admin-outline-variant/50',
  'bg-[#f0fdf4]': 'bg-admin-primary/5',
  'divide-[#e8dfee]': 'divide-admin-outline-variant/30',
  'border-[#e8dfee]': 'border-admin-outline-variant/30',
};

filesToRestyle.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;
  
  Object.keys(colorMap).forEach(oldClass => {
      content = content.split(oldClass).join(colorMap[oldClass]);
  });

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Restyled ${file}`);
  }
});
