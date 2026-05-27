import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

/**
 * Bootstrap da aplicação Angular com Ionic
 * Configura:
 * - Providers do Ionic Angular
 * - Router com lazy loading de módulos
 * - HttpClient para requisições HTTP
 * - IonicRouteStrategy para navegação otimizada
 * - Storage do Ionic para persistência de dados
 */
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    Storage,
  ],
});
