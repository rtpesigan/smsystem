import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] Starting authorization with email:", credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials")
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          console.log("[AUTH] User found:", !!user)
          
          if (!user) {
            console.log("[AUTH] User not found in database")
            return null
          }

          if (!user.password) {
            console.log("[AUTH] User has no password hash")
            return null
          }

          console.log("[AUTH] Comparing passwords...")
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log("[AUTH] Password valid:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("[AUTH] Password mismatch")
            return null
          }

          console.log("[AUTH] Authorization successful for:", credentials.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error("[AUTH] Error during authorization:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        (session.user as any).id = token.sub as string
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
        })
        if (dbUser) {
          (session.user as any).role = dbUser.role
        }
      }
      return session
    },
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}
