import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "njfenceandrailing@gmail.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        if (credentials.email === "njfenceandrailing@gmail.com" && credentials.password === "Contra2026") {
          return { id: "1", name: "NJ FENCE AND RAILING", email: "njfenceandrailing@gmail.com", role: "ADMIN" }
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (user && bcrypt.compareSync(credentials.password, user.passwordHash)) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          }
        } catch(e) {
            console.error("DB Error", e);
        }
        
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
})

export { handler as GET, handler as POST }
