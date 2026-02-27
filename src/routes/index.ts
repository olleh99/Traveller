import { Express } from 'express';
import { RouteModule } from './types';
import fs from 'fs';
import path from 'path';

export class RouteRegistry {
  private app: Express;
  private routes: Map<string, RouteModule> = new Map();

  constructor(app: Express) {
    this.app = app;
  }

  async loadRoutes(): Promise<void> {
    const routeDir = path.join(__dirname);
    const folders = fs.readdirSync(routeDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const folder of folders) {
      const indexPath = path.join(routeDir, folder, 'index.ts');
      if (fs.existsSync(indexPath)) {
        const module = await import(indexPath);
        if (module.default && module.default.routes) {
          this.registerModule(folder, module.default);
        }
      }
    }
  }

  registerModule(name: string, module: RouteModule): void {
    this.routes.set(name, module);
    const prefix = module.prefix || '';

    module.routes.forEach(route => {
      const fullPath = prefix + route.path;
      const method = route.method.toLowerCase() as keyof Express;

      const handlers = [
        ...(route.middleware || []),
        route.handler
      ];

      (this.app[method] as any)(fullPath, ...handlers);
      console.log(`Registered: ${route.method} ${fullPath}`);
    });
  }

  getRoutes(): Map<string, RouteModule> {
    return this.routes;
  }
}