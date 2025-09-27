# StatusXSmoakland Backend Contracts

## API Contracts

### Authentication & Users
- `POST /api/auth/register` - User registration with law enforcement verification
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Membership & Subscriptions
- `GET /api/membership/tiers` - Get membership tier details
- `POST /api/membership/subscribe` - Subscribe to membership tier
- `PUT /api/membership/upgrade` - Upgrade membership
- `GET /api/membership/status` - Get current membership status

### Products & Inventory
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/admin/products` - Add new product (admin only)
- `PUT /api/admin/products/:id` - Update product (admin only)
- `DELETE /api/admin/products/:id` - Delete product (admin only)
- `GET /api/admin/inventory` - Get inventory status (admin only)
- `PUT /api/admin/inventory/:id` - Update inventory (admin only)

### Daily Deals
- `GET /api/deals/daily` - Get current daily deals
- `POST /api/admin/deals/generate` - Generate daily deals (admin only)

### Orders & Cart
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart` - Get cart items
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order

### Wictionary
- `GET /api/wictionary` - Get dictionary terms (premium only)
- `GET /api/wictionary/search` - Search dictionary terms
- `POST /api/wictionary/suggest` - Suggest new term

## Mock Data to Replace

### From mock.js:
1. **mockProducts** → Database Products collection
2. **mockDailyDeals** → Database DailyDeals collection
3. **mockUserProfile** → Database Users collection
4. **mockWictionary** → Database Wictionary collection
5. **mockInventory** → Database Inventory collection

## Backend Implementation Plan

### 1. Database Models (MongoDB)
```javascript
// User Model
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  membershipTier: String, // 'basic' | 'premium'
  memberSince: Date,
  isLawEnforcement: Boolean, // false required
  preferences: {
    categories: [String],
    vendors: [String],
    priceRange: [Number],
    deliveryArea: String
  },
  orderHistory: [ObjectId], // references to orders
  wictionaryAccess: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Product Model
{
  _id: ObjectId,
  name: String,
  category: String, // 'flower', 'edibles', 'concentrates'
  price: Number,
  originalPrice: Number,
  image: String,
  description: String,
  thc: String,
  vendor: String,
  inStock: Boolean,
  rating: Number,
  reviews: Number,
  createdAt: Date,
  updatedAt: Date
}

// DailyDeal Model
{
  _id: ObjectId,
  productId: ObjectId,
  discount: Number,
  validUntil: Date,
  reason: String,
  isActive: Boolean,
  createdAt: Date
}

// Order Model
{
  _id: ObjectId,
  userId: ObjectId,
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: String, // 'pending', 'confirmed', 'delivered'
  deliveryAddress: String,
  createdAt: Date,
  updatedAt: Date
}

// Wictionary Model
{
  _id: ObjectId,
  term: String,
  definition: String,
  category: String,
  etymology: String,
  createdAt: Date
}

// Inventory Model
{
  _id: ObjectId,
  productId: ObjectId,
  quantity: Number,
  lowStockThreshold: Number,
  lastRestocked: Date,
  vendor: String
}
```

### 2. Authentication System
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes middleware
- Law enforcement verification tracking

### 3. Business Logic
- **Daily Deals Generator**: Automatic deal creation based on inventory levels
- **Membership Access Control**: Premium features locked behind membership tiers
- **Inventory Management**: Stock tracking and low-stock alerts
- **Order Processing**: Cart to order conversion

### 4. Frontend Integration Points

#### Replace Mock Data:
1. **Header.jsx**: User profile from `GET /api/auth/profile`
2. **ProductGrid.jsx**: Products from `GET /api/products`
3. **DailyDeals.jsx**: Deals from `GET /api/deals/daily`
4. **Wictionary.jsx**: Terms from `GET /api/wictionary`

#### Add API Calls:
1. **Authentication Flow**: Login/register integration
2. **Cart Functionality**: API calls for cart operations
3. **Order Placement**: Checkout process
4. **Real-time Updates**: Product availability, deal timers

### 5. Admin Features
- Inventory management dashboard
- Product CRUD operations
- Daily deal generation controls
- User management

## Security & Protection
- Rate limiting on authentication endpoints
- Input validation and sanitization
- CORS configuration for production
- Environment variable protection
- Screenshot protection remains frontend-only

## Integration Workflow
1. Implement backend models and routes
2. Test endpoints with Postman/curl
3. Replace mock data imports in frontend components
4. Update frontend state management
5. Add loading states and error handling
6. Test full user flow end-to-end