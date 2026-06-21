import { prisma } from '../config/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import AppError from '../middlewares/AppError.js'
import { OAuth2Client } from 'google-auth-library'

// Google OAuth client setup
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

// Generate JWT token for a user
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Register a new user
const registerUser = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new AppError('Email already registered', 409)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword }
  })

  const token = generateToken(user.id)

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }
}

// Login existing user
const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }

  // Google user trying to login with password
  if (!user.password) {
    throw new AppError('Please login with Google', 401)
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401)
  }

  const token = generateToken(user.id)

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }
}

// Get user profile by ID
const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true
    }
  })

  if (!user) {
    throw new AppError('User not found', 404)
  }

  return user
}

// Handle Google login — all three cases handled
const googleLogin = async (code) => {
  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)

  // Verify and get user info from Google token
  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID
  })

  const { name, email, picture, sub: googleId } = ticket.getPayload()

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email }
  })

  if (user) {
    // Existing normal user — link Google account
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { email },
        data: { googleId, avatar: picture }
      })
    }
  } else {
    // New user — create with Google info
    user = await prisma.user.create({
      data: {
        name,
        email,
        googleId,
        avatar: picture
      }
    })
  }

  const token = generateToken(user.id)

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    }
  }
}

export { registerUser, loginUser, getUserById, googleLogin }