#!/bin/bash

echo "Testing status update endpoint..."

# Create a JSON file
cat > /tmp/status.json << 'EOF'
{"status":"Processing"}
EOF

# Test the endpoint
curl -X PATCH http://localhost:5000/api/order-tracking/2/status \
  -H "Content-Type: application/json" \
  -d @/tmp/status.json

echo ""
echo "Done"
