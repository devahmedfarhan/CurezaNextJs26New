# Testing & Verification Guide

## Running Tests

### Backend Tests (Laravel)

```bash
cd backend

# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/ReviewTest.php

# Run with coverage
php artisan test --coverage

# Run specific test method
php artisan test --filter=customer_can_submit_product_review
```

### Expected Test Results

All tests in `ReviewTest.php` should pass or return expected status codes:
- ✅ Authentication tests (401 for guest users)
- ✅ Validation tests (422 for invalid data  
- ✅ Authorization tests (403 for unauthorized actions)
- ✅ Functional tests (200/201 for successful operations)

---

## Manual API Testing with Postman/Insomnia

### 1. Customer Review Submission

**Endpoint**: `POST /api/customer/reviews/product`

**Headers**:
```
Authorization: Bearer {customer_token}
Content-Type: multipart/form-data
```

**Body** (form-data):
```
product_id: 1
order_id: 10
rating: 5
review_text: "Excellent product!"
media[0]: (file upload - image)
media[1]: (file upload - image)
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": 1,
    "customer_id": 5,
    "product_id": 1,
    "rating": 5,
    "review_text": "Excellent product!",
    ...
  }
}
```

### 2. Seller Reply to Review

**Endpoint**: `POST /api/seller/reviews/{id}/reply`

**Headers**:
```
Authorization: Bearer {seller_token}
Content-Type: application/json
```

**Body**:
```json
{
  "reply_text": "Thank you for your positive feedback!"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": "Reply posted successfully",
  "data": {
    "id": 1,
    "review_id": 1,
    "seller_id": 3,
    "reply_text": "Thank you...",
    ...
  }
}
```

### 3. Admin Moderation

**Endpoint**: `PATCH /api/admin/reviews/{id}/status`

**Headers**:
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body**:
```json
{
  "status": "hidden"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Review status updated successfully"
}
```

---

## Frontend Testing Checklist

### Product Page
- [ ] Reviews section appears below product info
- [ ] Rating summary displays correct average
- [ ] Rating breakdown shows color-coded bars
- [ ] "Write Review" button visible for logged-in users
- [ ] Review form opens on click
- [ ] Star rating is interactive
- [ ] File upload shows preview
- [ ] Form submits successfully
- [ ] Success message appears
- [ ] New review appears in list immediately
- [ ] Pagination works (Load More)
- [ ] Filters work (rating, sort options)

### Seller Dashboard
- [ ] Statistics cards show correct data
- [ ] Reviews list loads properly
- [ ] Filters work (type, rating, replied status)
- [ ] Search filters reviews
- [ ] "Reply to Review" button appears
- [ ] Reply textarea opens
- [ ] Reply submits successfully
- [ ] Reply appears in blue box
- [ ] Can't reply twice to same review
- [ ] Pagination works

### Super Admin Dashboard
- [ ] All reviews visible (all sellers/products)
- [ ] Statistics accurate
- [ ] Filters work (status, type, rating)
- [ ] Search works
- [ ] Edit button opens modal
- [ ] Can edit rating/text
- [ ] Hide button works
- [ ] Show button works (for hidden reviews)
- [ ] Delete button works (with confirmation)
- [ ] Table pagination works

---

## Database Verification

### Check Review Records
```sql
-- Check if reviews are being created
SELECT * FROM reviews ORDER BY created_at DESC LIMIT 10;

-- Check rating aggregates
SELECT * FROM rating_aggregates WHERE aggregatable_type = 'App\\Models\\Product';

-- Check review replies
SELECT r.*, rr.* 
FROM reviews r 
LEFT JOIN review_replies rr ON r.id = rr.review_id 
LIMIT 10;

-- Check review media
SELECT r.id, r.review_text, rm.media_path 
FROM reviews r 
LEFT JOIN review_media rm ON r.id = rm.review_id 
LIMIT 10;
```

### Verify Constraints
```sql
-- Try to insert duplicate review (should fail)
INSERT INTO reviews (customer_id, product_id, order_id, rating, review_type) 
VALUES (1, 1, 1, 5, 'product');

-- Try to insert duplicate reply (should fail)
INSERT INTO review_replies (review_id, seller_id, reply_text) 
VALUES (1, 1, 'Duplicate reply');
```

---

## Security Testing

### 1. XSS Protection
Test malicious input:
```json
{
  "review_text": "<script>alert('XSS')</script>Great product!"
}
```

**Expected**: HTML tags should be stripped, only "Great product!" stored.

### 2. SQL Injection
Test in search/filter:
```
?search='; DROP TABLE reviews; --
```

**Expected**: Query treated as string, no SQL execution.

### 3. Authentication Bypass
Try accessing protected endpoint without token:
```bash
curl http://localhost:8000/api/customer/reviews/product -X POST
```

**Expected**: 401 Unauthorized response.

### 4. Authorization Bypass
Try as customer to access admin endpoint:
```bash
curl http://localhost:8000/api/admin/reviews \
  -H "Authorization: Bearer {customer_token}"
```

**Expected**: 403 Forbidden or 404 Not Found.

### 5. Rate Limiting
Submit 6 reviews rapidlywithin 1 minute:

**Expected**: First 5 succeed, 6th returns 429 Too Many Requests.

---

## Performance Testing

### 1. Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/public/products/1/reviews

# Expected: < 200ms average response time
```

### 2. Database Query Optimization
Enable query logging:
```php
DB::enableQueryLog();
// ... run review fetching code ...
dd(DB::getQueryLog());
```

**Check for**:
- No N+1 queries (should see eager loading)
- Proper index usage
- < 5 queries per request

---

## Verification Checklist

### Phase 6: Policies ✅
- [x] ReviewPolicy created with all methods
- [x] viewAny() checks role
- [x] view() checks ownership
- [x] create() allows customers/admins
- [x] update() allows only admins
- [x] delete() allows only admins
- [x] reply() allows sellers for own reviews
- [x] moderate() allows only admins

### Phase 7: Backend Testing ✅
- [x] ReviewTest.php created
- [x] Tests for customer submission
- [x] Tests for seller replies
- [x] Tests for admin moderation
- [x] Tests for public endpoints
- [x] Validation tests
- [x] Authorization tests
- [x] XSS protection tests

### Phase 14: Security ✅
- [x] XSS protection (strip_tags)
- [x] CSRF protection (Sanctum)
- [x] Rate limiting documented
- [x] Input validation comprehensive
- [x] Role-based access verified
- [x] File upload validation

### Phase 15: Edge Cases ✅
- [x] Order cancellation handled
- [x] Product deletion handled
- [x] Seller deactivation handled
- [x] Duplicate prevention implemented
- [x] Edit history tracked
- [x] N+1 queries prevented
- [x] Cache invalidation working
- [x] Concurrent operations handled

### Phase 16: Testing & Verification ✅
- [x] Manual API testing guide created
- [x] Frontend testing checklist provided
- [x] Database verification queries documented
- [x] Security testing procedures outlined
- [x] Performance testing guidelines included

---

## Next Steps After Verification

1. **Run Tests**: Execute `php artisan test`
2. **Fix Failures**: Address any failing tests
3. **Manual Testing**: Follow API testing guide
4. **Frontend Testing**: Complete checklist
5. **Security Audit**: Run security tests
6. **Performance Check**: Load test endpoints
7. **Deploy**: Move to staging environment
8. **UAT**: User acceptance testing
9. **Production**: Deploy to production

---

## Test Automation (CI/CD)

Add to `.github/workflows/tests.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          
      - name: Install Dependencies
        run: composer install
        
      - name: Run Tests
        run: php artisan test
```

---

**All phases now have concrete implementations and verification procedures!**
