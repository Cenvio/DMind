import jwt from 'jsonwebtoken';
import 'dotenv/config';

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not set in environment variables")
}

const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET

export interface JWTPayload {
  userId: string
  email: string
  githubUsername: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export const generateTokens = (payload: JWTPayload): TokenPair => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })

  return { accessToken, refreshToken }
}

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}
