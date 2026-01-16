# How to Run Timeline API Test on Server

## Step 1: Upload the test script to server

From your local machine (Windows), run:

```bash
scp -i "C:\Users\Admin\awsconection.pem" test-timeline-apis.sh ubuntu@16.171.161.150:~/
```

## Step 2: SSH into server

```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150
```

## Step 3: Make script executable

```bash
chmod +x test-timeline-apis.sh
```

## Step 4: Run the test

```bash
bash test-timeline-apis.sh
```

## Step 5: View saved responses

The script saves responses to JSON files. View them with:

```bash
# View product timeline response
cat timeline_2460-3499.json | jq '.'

# View nested timeline response
cat nested_timeline_*.json | jq '.'
```

## Alternative: Run commands manually

If the script doesn't work, run these commands one by one:

### 1. Get Token
```bash
TOKEN=$(curl -s -k -X POST https://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' | jq -r '.token')
echo "Token: $TOKEN"
```

### 2. Test Product Timeline
```bash
curl -s -k "https://localhost:3001/api/timeline/2251-999" -H "Authorization: Bearer $TOKEN" | jq '.'
```

### 3. Test Nested Timeline
```bash
curl -s -k "https://localhost:3001/api/order-tracking/19/timeline" -H "Authorization: Bearer $TOKEN" | jq '.'
```

## What to Share

After running the test, share:
1. The complete terminal output
2. Or the contents of the JSON files:
   - `cat timeline_2251-999.json`
   - `cat nested_timeline_*.json`

## Expected Output

The test will show:
- ✅ Login successful with token
- ✅ Product timeline with events and summary
- ✅ Nested timeline with dispatch details
- ✅ All key fields (customer, AWB, order_ref, etc.)

If any test fails, the script will show the error and status code.
