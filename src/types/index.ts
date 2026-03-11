import { UserRole } from "@prisma/client"

export interface Session {
  user: {
    id: string
    email: string
    name: string | null
    image: string | null
    role: UserRole
  }
  expires: string
}

export type DashboardUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
}
