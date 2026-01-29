# MANUAL DATABASE BACKUP - INVENTORY DASHBOARD
## Final Delivery - 29th January 2026

### ✅ FOLDER ALREADY CREATED
- Location: `C:\Users\Admin\Desktop\inventory dashbord final devlivery at 29th jan`

### STEP-BY-STEP MANUAL BACKUP PROCESS

#### Step 1: Connect to Server
Open Command Prompt and run:
```cmd
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64
```

#### Step 2: Create Database Backup on Server
Once connected to server, run:
```bash
sudo mysqldump -u root -p'Admin@123' --single-transaction --routines --triggers inventory_db > inventory_db_final_backup.sql
```

#### Step 3: Check Backup File Size
```bash
ls -lh inventory_db_final_backup.sql
```
Expected size: 79-89 MB

#### Step 4: Exit SSH Connection
```bash
exit
```

#### Step 5: Download Backup to Local System
From your local Command Prompt:
```cmd
scp -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64:inventory_db_final_backup.sql "C:\Users\Admin\Desktop\inventory dashbord final devlivery at 29th jan\"
```

#### Step 6: Verify Local File
```cmd
dir "C:\Users\Admin\Desktop\inventory dashbord final devlivery at 29th jan\inventory_db_final_backup.sql"
```

#### Step 7: Clean Up Server (Optional)
```cmd
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "rm inventory_db_final_backup.sql"
```

### ALTERNATIVE: Use WinSCP or FileZilla
If command line continues to hang:
1. Download WinSCP (free SFTP client)
2. Connect using:
   - Host: 54.169.107.64
   - Username: ubuntu
   - Private key: C:\Users\Admin\e2c.pem
3. Navigate to /home/ubuntu/
4. Create backup using SSH terminal in WinSCP
5. Download the .sql file using GUI

### EXPECTED RESULT
- File: `inventory_db_final_backup.sql`
- Size: ~79-89 MB
- Location: Desktop folder created above
- Contains: Complete inventory_db database with all tables and data

### TROUBLESHOOTING
If commands hang:
- Try using shorter timeout: `ssh -o ConnectTimeout=10`
- Use WinSCP GUI instead of command line
- Check if server is responsive: `ping 54.169.107.64`

### FINAL DELIVERY CHECKLIST
- ✅ Folder created on Desktop
- ⏳ Database backup file (inventory_db_final_backup.sql)
- ⏳ Verify file size (79-89 MB expected)
- ⏳ Test file integrity (can be opened in text editor)