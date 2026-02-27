import { Request, Response, NextFunction } from 'express';

export interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: RouteHandler;
  middleware?: Middleware[];
  description?: string;
  validation?: {
    params?: Record<string, any>;
    query?: Record<string, any>;
    body?: Record<string, any>;
  };
}

export type RouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export interface RouteModule {
  routes: RouteConfig[];
  prefix?: string;
}