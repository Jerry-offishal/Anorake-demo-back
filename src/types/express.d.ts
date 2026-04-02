// src/types/express.d.ts
import { User } from '../users/user.schema'; // ou ton type User

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
