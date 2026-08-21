# VideoTube Backend

A comprehensive backend learning project for a YouTube-like video sharing platform built with Node.js, Express, and MongoDB.

## 📚 Project Overview

This is a learning project demonstrating full-stack backend development practices for a video streaming application similar to YouTube. It implements complete CRUD operations for various features including user authentication, video management, comments, likes, playlists, tweets, subscriptions, and dashboards.

**Author:** Muhammad Bilal Nasir  
**License:** ISC  
**Language:** JavaScript (100%)

## 🛠️ Tech Stack

### Core Framework
- **Express.js** (v5.2.1) - Web framework for Node.js
- **Node.js** - Runtime environment

### Database
- **MongoDB** - NoSQL database
- **Mongoose** (v9.4.1) - MongoDB object modeling

### Authentication & Security
- **JWT (jsonwebtoken)** (v9.0.3) - Token-based authentication
- **bcrypt** (v6.0.0) - Password hashing
- **cookie-parser** (v1.4.7) - Cookie middleware

### File Management
- **Multer** (v2.1.1) - File upload handling
- **Cloudinary** (v2.9.0) - Cloud storage for media files

### Utilities
- **dotenv** (v17.4.1) - Environment variable management
- **CORS** (v2.8.6) - Cross-origin resource sharing
- **Prettier** (v3.8.2) - Code formatting

### Development
- **nodemon** (v3.1.14) - Auto-reload during development

## 📁 Project Structure

```
src/
├── controllers/          # Business logic for each feature
│   ├── user.controller.js           # User authentication & profile management
│   ├── video.controller.js          # Video CRUD operations
│   ├── comment.controller.js        # Comment management
│   ├── like.controller.js           # Like/unlike functionality
│   ├── playlist.controller.js       # Playlist management
│   ├── tweet.controller.js          # Tweet/short update features
│   ├── subscription.controller.js   # Channel subscription logic
│   ├── dashboard.controller.js      # Analytics & statistics
│   └── healthcheck.controller.js    # Server health status
│
├── models/              # Database schemas
│   ├── user.model.js                # User data schema
│   ├── video.model.js               # Video metadata schema
│   ├── comment.model.js             # Comment schema
│   ├── like.model.js                # Like interactions schema
│   ├── playlist.model.js            # Playlist schema
│   ├── tweet.model.js               # Tweet/update schema
│   └── subscription.model.js        # Subscription relationships
│
├── routes/              # API endpoints
│   ├── user.routes.js               # User endpoints (register, login, profile)
│   ├── video.routes.js              # Video endpoints (CRUD)
│   ├── comment.routes.js            # Comment endpoints
│   ├── like.routes.js               # Like endpoints
│   ├── playlist.routes.js           # Playlist endpoints
│   ├── tweet.routes.js              # Tweet endpoints
│   ├── subscription.routes.js       # Subscription endpoints
│   ├── dashboard.routes.js          # Dashboard/analytics endpoints
│   └── healthcheck.routes.js        # Health check endpoint
│
├── middlewares/         # Custom middleware
│   ├── auth.middleware.js           # JWT authentication verification
│   └── multer.middleware.js         # File upload configuration
│
├── utils/               # Utility functions
│   ├── ApiError.js                  # Custom error class
│   ├── ApiResponse.js               # Standard API response format
│   ├── asyncHandler.js              # Async error handling wrapper
│   └── cloudinary.js                # Cloudinary integration
│
├── db/                  # Database configuration
│   └── index.js         # MongoDB connection setup
│
├── app.js               # Express app configuration
├── index.js             # Application entry point
└── constants.js         # Application constants
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance (local or cloud)
- Cloudinary account for media storage
- dotenv configuration

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Bilalnasir057558/Trying-Backend.git
   cd Trying-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create a .env file in the root directory
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=videotube
   CORS_ORIGIN=http://localhost:3000
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000`

## 📡 API Endpoints

### User Management (`/api/v1/users`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PATCH /avatar` - Update user avatar
- `PATCH /cover-image` - Update cover image

### Videos (`/api/v1/videos`)
- `GET /` - Get all videos
- `POST /` - Upload new video
- `GET /:id` - Get video details
- `PUT /:id` - Update video
- `DELETE /:id` - Delete video
- `PATCH /:id/views` - Increment video views
- `GET /:id/comments` - Get video comments

### Comments (`/api/v1/comments`)
- `POST /` - Add comment to video
- `GET /:id` - Get comment details
- `PUT /:id` - Update comment
- `DELETE /:id` - Delete comment

### Likes (`/api/v1/likes`)
- `POST /video/:id` - Like/unlike video
- `POST /comment/:id` - Like/unlike comment
- `POST /tweet/:id` - Like/unlike tweet
- `GET /videos` - Get liked videos
- `GET /comments` - Get liked comments

### Playlists (`/api/v1/playlists`)
- `POST /` - Create playlist
- `GET /` - Get user playlists
- `GET /:id` - Get playlist details
- `PUT /:id` - Update playlist
- `DELETE /:id` - Delete playlist
- `POST /:id/videos` - Add video to playlist
- `DELETE /:id/videos/:videoId` - Remove video from playlist

### Tweets (`/api/v1/tweets`)
- `POST /` - Create tweet
- `GET /` - Get user tweets
- `GET /:id` - Get tweet details
- `PUT /:id` - Update tweet
- `DELETE /:id` - Delete tweet

### Subscriptions (`/api/v1/subscriptions`)
- `POST /:channelId` - Subscribe to channel
- `DELETE /:channelId` - Unsubscribe from channel
- `GET /subscribers/:channelId` - Get channel subscribers
- `GET /subscriptions/:userId` - Get user subscriptions

### Dashboard (`/api/v1/dashboard`)
- `GET /stats` - Get channel statistics
- `GET /videos` - Get dashboard videos

### Health Check (`/api/v1/healthcheck`)
- `GET /` - Server health status

## 🔑 Key Features

### Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Cookie-based session management
- Token expiration handling

### Media Management
- File upload via Multer
- Cloud storage integration with Cloudinary
- Multiple file format support

### Database Operations
- Mongoose schema validation
- Pagination support with `mongoose-aggregate-paginate-v2`
- Proper indexing for performance

### Error Handling
- Custom `ApiError` class for consistent error responses
- Global error middleware
- Async error wrapping with `asyncHandler`

### API Standards
- Consistent response format with `ApiResponse`
- Proper HTTP status codes
- Request validation

## 📝 Controllers Overview

### **user.controller.js** (12KB)
Handles all user-related operations:
- User registration and login
- Profile management
- Avatar and cover image uploads
- Password management

### **video.controller.js** (8KB)
Manages video operations:
- Video upload and storage
- Video metadata management
- View count tracking
- Video deletion

### **comment.controller.js** (3.7KB)
Handles comment functionality:
- Add comments to videos
- Edit and delete comments
- Comment retrieval

### **like.controller.js** (4.6KB)
Manages like/unlike operations:
- Like/unlike videos, comments, and tweets
- Track user likes
- Get liked items

### **playlist.controller.js** (5.6KB)
Playlist management:
- Create and manage playlists
- Add/remove videos from playlists
- Share playlists

### **subscription.controller.js** (4.2KB)
Subscription features:
- Subscribe/unsubscribe to channels
- Track subscriptions
- Get subscriber information

### **tweet.controller.js** (3.6KB)
Short update/tweet functionality:
- Create tweets
- Edit and delete tweets
- Tweet retrieval

### **dashboard.controller.js** (2.9KB)
Analytics and statistics:
- Channel statistics
- Video performance metrics
- Subscriber analytics

### **healthcheck.controller.js** (366 bytes)
Server monitoring:
- Health status endpoint

## 📊 Models Overview

Each model is designed with proper Mongoose schema:

- **User** - Stores user profile, credentials, and authentication data
- **Video** - Stores video metadata, thumbnail, duration, upload date
- **Comment** - Links comments to videos and users
- **Like** - Tracks likes on various content types
- **Playlist** - Organizes videos into user playlists
- **Tweet** - Stores short text updates
- **Subscription** - Manages channel subscriptions

## 🔐 Security Features

- **Authentication**: JWT tokens with expiration
- **Password Security**: bcrypt hashing (v6.0.0)
- **CORS**: Configured for secure cross-origin requests
- **Input Validation**: Request validation in controllers
- **Error Handling**: Comprehensive error handling middleware

## 🚦 Development Commands

- **Start development server:**
  ```bash
  npm run dev
  ```
  Uses nodemon for auto-reload with dotenv configuration

## 🎯 Learning Objectives

This project demonstrates:
- Building a scalable Node.js/Express backend
- MongoDB database design and relationships
- RESTful API architecture
- JWT authentication implementation
- File upload handling
- Error handling and middleware
- Environment configuration
- Code organization and best practices

## 📚 Dependencies Breakdown

| Package | Version | Purpose |
|---------|---------|---------|
| express | 5.2.1 | Web framework |
| mongoose | 9.4.1 | MongoDB ODM |
| jsonwebtoken | 9.0.3 | JWT authentication |
| bcrypt | 6.0.0 | Password hashing |
| multer | 2.1.1 | File uploads |
| cloudinary | 2.9.0 | Cloud storage |
| dotenv | 17.4.1 | Environment config |
| cors | 2.8.6 | CORS handling |
| cookie-parser | 1.4.7 | Cookie management |
| nodemon | 3.1.14 | Dev auto-reload |
| prettier | 3.8.2 | Code formatting |

## 🎓 Learning Path

1. **Setup & Configuration** - Start with index.js and app.js
2. **Database** - Review db/index.js for connection logic
3. **Models** - Study schema definitions in src/models/
4. **Middleware** - Understand auth and file upload handling
5. **Controllers** - Learn business logic implementation
6. **Routes** - See endpoint mapping
7. **Utils** - Examine helper functions and error handling

## 📧 Contact

**Author:** Muhammad Bilal Nasir

## 📄 License

This project is licensed under the ISC License.

---

**Note:** This is a learning project created for educational purposes to understand full-stack backend development with modern JavaScript tools and practices.
