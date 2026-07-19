const fs = require('fs');
const path = require('path');

const filesToRestyle = [
  'app/admin/kasir/page.tsx',
  'app/admin/laporan/page.tsx',
  'app/admin/pesanan/page.tsx',
  'app/admin/produk/page.tsx',
];

const colorMap = {
  'bg-[#1d1a24]': 'bg-admin-inverse-surface',
  'text-[#1d1a24]': 'text-admin-on-surface',
  'text-[#4a4455]': 'text-admin-on-surface-variant',
  'bg-[#e8dfee]': 'bg-admin-surface-container',
  'border-[#e8dfee]': 'border-admin-outline-variant/30',
  'bg-[#ccc3d8]': 'bg-admin-surface-container-high',
  'text-[#ccc3d8]': 'text-admin-outline-variant',
  'bg-[#d2bbff]': 'bg-admin-secondary-container/50',
  'text-[#5a00c6]': 'text-admin-secondary',
  'bg-[#630ed4]': 'bg-admin-primary',
  'text-[#630ed4]': 'text-admin-primary',
  'border-[#630ed4]': 'border-admin-primary',
  'bg-[#eddfe0]': 'bg-admin-surface-container',
  'text-[#6c6263]': 'text-admin-on-surface-variant',
  'bg-[#732ee4]': 'bg-admin-secondary-container',
  'text-[#732ee4]': 'text-admin-secondary',
  'border-[#732ee4]': 'border-admin-secondary-container',
  'bg-[#10b981]': 'bg-admin-primary',
  'text-[#10b981]': 'text-admin-primary',
  'bg-[#f0fdf4]': 'bg-admin-primary/5',
  'border-[#dcfce7]': 'border-admin-primary/20',
  'bg-[#ffe4e6]': 'bg-admin-error-container/20',
  'text-[#dfd7e6]': 'text-admin-outline-variant',
  'border-[#dfd7e6]': 'border-admin-outline-variant/50',
  'shadow-[#630ed4]': 'shadow-admin-primary',
  // Specific tweaks
  'placeholder-[#4a4455]/50': 'placeholder-admin-on-surface-variant/50',
};

filesToRestyle.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${file}, not found.`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;
  
  Object.keys(colorMap).forEach(oldClass => {
      content = content.split(oldClass).join(colorMap[oldClass]);
  });

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Restyled ${file}`);
  } else {
    console.log(`No changes needed for ${file}`);
  }
});
