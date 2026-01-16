#!/bin/bash

# This script adds Authorization headers to all fetch calls that are missing them

echo "🔧 Fixing fetch calls to include JWT token..."

# Fix OrderSheet.jsx - Line 85
echo "Fixing OrderSheet.jsx..."
sed -i "85s|const response = await fetch('https://16.171.161.150.nip.io/api/order-tracking');|const token = localStorage.getItem('token');\n            const response = await fetch('https://16.171.161.150.nip.io/api/order-tracking', {\n                headers: { 'Authorization': \`Bearer \${token}\` }\n            });|" src/app/order/OrderSheet.jsx

# Fix OrderSheet.jsx - Line 149
sed -i "149s|const response = await fetch(\`https://16.171.161.150.nip.io/api/order-tracking/\${order.id}/timeline\`);|const token = localStorage.getItem('token');\n            const response = await fetch(\`https://16.171.161.150.nip.io/api/order-tracking/\${order.id}/timeline\`, {\n                headers: { 'Authorization': \`Bearer \${token}\` }\n            });|" src/app/order/OrderSheet.jsx

echo "✅ All fetch calls fixed!"
echo "📝 Please review the changes and test the application"
