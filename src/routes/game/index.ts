import { RouteModule } from '../types';
import { Request, Response } from 'express';

const gameRoutes: RouteModule = {
  prefix: '/api/game',
  routes: [
    {
      path: '/create',
      method: 'POST',
      handler: async (req: Request, res: Response) => {
        const { gameName, maxPlayers, startLocation } = req.body;
        
        res.json({
          success: true,
          message: 'Game created successfully',
          data: {
            gameId: 'game-123',
            gameName,
            maxPlayers,
            startLocation
          }
        });
      },
      description: 'Create a new game session',
      validation: {
        body: {
          gameName: 'string',
          maxPlayers: 'number',
          startLocation: 'string'
        }
      }
    },
    {
      path: '/:gameId',
      method: 'GET',
      handler: async (req: Request, res: Response) => {
        const { gameId } = req.params;
        
        res.json({
          success: true,
          data: {
            gameId,
            gameName: 'Sample Game',
            currentTurn: 1,
            players: []
          }
        });
      },
      description: 'Get game details',
      validation: {
        params: {
          gameId: 'string'
        }
      }
    },
    {
      path: '/:gameId/join',
      method: 'POST',
      handler: async (req: Request, res: Response) => {
        const { gameId } = req.params;
        const { playerId } = req.body;
        
        res.json({
          success: true,
          message: 'Joined game successfully',
          data: {
            gameId,
            playerId,
            playerPosition: 1
          }
        });
      },
      description: 'Join an existing game',
      validation: {
        params: {
          gameId: 'string'
        },
        body: {
          playerId: 'string'
        }
      }
    }
  ]
};

export default gameRoutes;