import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { LoadingService } from './core/services/loading/loading';
import { Theme } from './core/services/theme/theme';
import { FooterComponent } from './layouts/footer/footer';
import { NavbarComponent } from './layouts/navbar/navbar';
import { Breadcrumb } from './shared/breadcrumb/breadcrumb';
import { BreadcrumbService } from './shared/breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, Breadcrumb, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('E-Commerce22');
  readonly themeService = inject(Theme);
  protected readonly breadcrumbService = inject(BreadcrumbService);
  protected readonly loadingService = inject(LoadingService);
}
