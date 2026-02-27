import { RouteModule } from '../types';
import { Request, Response } from 'express';

const authRoutes: RouteModule = {
  prefix: '/api/auth',
  routes: [
    {
      path: '/register',
      method: 'POST',
      handler: async (req: Request, res: Response) => {
        const { username, email } = req.body;

        res.json({
          success: true,
          message: 'User registered successfully',
          data: { username, email }
        });
      },
      description: 'Register a new user',
      validation: {
        body: {
          username: 'string',
          password: 'string',
          email: 'string'
        }
      }
    },
    {
      path: '/login',
      method: 'POST',
      handler: async (req: Request, res: Response) => {
        const { username } = req.body;

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token: 'jwt-token-here',
            user: { username }
          }
        });
      },
      description: 'User login',
      validation: {
        body: {
          username: 'string',
          password: 'string'
        }
      }
    },
    {
      path: '/logout',
      method: 'POST',
      handler: async (_req: Request, res: Response) => {
        res.json({
          success: true,
          message: 'Logout successful'
        });
      },
      description: 'User logout'
    }
  ]
};

export default authRoutes;