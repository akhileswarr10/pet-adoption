# Donation Rejection Debug Guide

## Issue: Shelters can't reject donations

### Step 1: Check User Role
Make sure you're logged in as a **shelter** user, not admin or regular user.

**Test Users:**
- Shelter 1: `shelter1@example.com` / `password123`
- Shelter 2: `shelter2@example.com` / `password123`

### Step 2: Check Donation Ownership
Shelters can only reject donations **to their shelter**.

**Database Check:**
```sql
SELECT d.id, d.status, d.shelter_id, u.name as shelter_name
FROM donations d
JOIN users u ON d.shelter_id = u.id
WHERE d.status = 'pending';
```

### Step 3: Test API Directly

**Manual API Test:**
```bash
# Get your JWT token from browser localStorage
# Then test the API:

curl -X PUT http://localhost:5000/api/donations/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "rejected", "admin_notes": "Test rejection"}'
```

### Step 4: Check Browser Console

1. Open **Developer Tools** (F12)
2. Go to **Console** tab
3. Try to reject a donation
4. Look for error messages

### Step 5: Check Network Tab

1. Open **Network** tab in Developer Tools
2. Try to reject a donation
3. Look for the PUT request to `/api/donations/:id`
4. Check the response status and error message

### Common Issues:

#### Issue 1: Wrong User Role
**Error:** "Insufficient permissions"
**Solution:** Login as shelter user

#### Issue 2: Wrong Shelter
**Error:** "You can only update donations to your shelter"
**Solution:** Only reject donations assigned to your shelter

#### Issue 3: Invalid Status
**Error:** "Validation failed"
**Solution:** Check that 'rejected' is a valid status

#### Issue 4: Network Error
**Error:** Network request failed
**Solution:** Check if backend server is running on port 5000

### Expected Flow:

1. **Login as shelter** → Get JWT token
2. **View pending donations** → Only see donations to your shelter
3. **Click Reject button** → Opens confirmation modal
4. **Confirm rejection** → Sends PUT request with status: 'rejected'
5. **Success** → Donation status updates to 'rejected'

### Debug Steps:

1. **Check login status**: Are you logged in as shelter?
2. **Check donation ownership**: Is the donation assigned to your shelter?
3. **Check browser console**: Any JavaScript errors?
4. **Check network requests**: Is the API call being made?
5. **Check API response**: What error is returned?
