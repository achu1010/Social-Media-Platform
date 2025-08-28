# Social Media Platform

A full-stack social media platform built with Node.js (Express + MongoDB) for the backend and React.js for the frontend.

## Features

### Backend (Node.js + Express + MongoDB)
- **User Authentication**: JWT-based authentication with registration and login
- **User Management**: User profiles with bio, profile pictures, and friend system
- **Posts System**: Create, read, and delete posts with optional images
- **Friends System**: Send/accept friend requests and manage friendships
- **Comments & Likes**: Interactive features for posts
- **Protected Routes**: JWT middleware for secured endpoints

### Frontend (React.js)
- **Responsive Design**: Built with Tailwind CSS for modern UI
- **Authentication Pages**: Login and registration forms with validation
- **Home Feed**: Display posts from user and friends in chronological order
- **Profile Pages**: View and edit user profiles
- **Friends Management**: Search users, send/accept friend requests
- **Real-time Updates**: Dynamic post interactions (likes, comments)
- **Context API**: Global state management for authentication

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

### Frontend
- React.js 18
- React Router Dom for navigation
- Context API for state management
- Axios for API calls
- Tailwind CSS for styling

## Project Structure

```
social-media-platform/
├── server/                 # Backend (Node.js + Express)
│   ├── models/            # Mongoose models
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── posts.js
│   ├── middleware/        # Custom middleware
│   │   └── auth.js
│   ├── server.js          # Express server setup
│   ├── package.json
│   └── .env               # Environment variables
├── client/                # Frontend (React.js)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context providers
│   │   ├── services/      # API services
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
├── package.json           # Root package.json with scripts
└── README.md
```

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current user profile

### User Routes (`/api/users`)
- `GET /:id` - Get user profile
- `PUT /:id` - Update user profile
- `POST /:id/friends` - Send/accept friend request
- `GET /:id/friends` - Get user's friends
- `GET /search/:query` - Search users
- `GET /me/friend-requests` - Get pending friend requests

### Post Routes (`/api/posts`)
- `POST /` - Create a new post
- `GET /feed/:id` - Get news feed for user
- `GET /user/:id` - Get posts by specific user
- `DELETE /:id` - Delete a post
- `POST /:id/like` - Like/unlike a post
- `POST /:id/comment` - Add comment to post
- `GET /:id` - Get single post

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd social-media-platform
```

### 2. Install dependencies
```bash
# Install root dependencies (concurrently)
npm install

# Install all dependencies (server + client)
npm run install-all
```

### 3. Environment Setup
Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socialmedia
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB installation
mongod
```

### 5. Run the application
```bash
# Start both frontend and backend concurrently
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Alternative: Run separately
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## Usage

1. **Registration**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Profile Setup**: Add bio and profile picture URL
4. **Create Posts**: Share text posts with optional images
5. **Find Friends**: Search for users and send friend requests
6. **Social Features**: Like and comment on posts from your feed
7. **Friend Management**: Accept/decline friend requests

## Database Schema

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  bio: String (optional),
  profilePicture: String (optional),
  friends: [ObjectId],
  friendRequests: [{ from: ObjectId, createdAt: Date }],
  sentFriendRequests: [{ to: ObjectId, createdAt: Date }]
}
```

### Post Model
```javascript
{
  userId: ObjectId (required),
  text: String (required),
  image: String (optional),
  likes: [ObjectId],
  comments: [{
    userId: ObjectId,
    text: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes middleware
- Input validation and sanitization
- CORS configuration
- Error handling middleware

## Development Notes

### Image Upload
Currently, the application uses URL-based image handling for profile pictures and posts. For production, consider implementing:
- File upload with multer
- Cloud storage integration (AWS S3, Cloudinary)
- Image optimization and resizing

### Deployment Considerations
- Set up environment variables for production
- Configure MongoDB Atlas for cloud database
- Build React app for production (`npm run build`)
- Set up reverse proxy (nginx) if needed
- Enable HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
