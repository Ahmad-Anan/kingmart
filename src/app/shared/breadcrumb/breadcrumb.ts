import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [BreadcrumbModule, RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
})
export class Breadcrumb {
  readonly items = input.required<MenuItem[]>();

  readonly home: MenuItem = {
    icon: 'pi pi-home',
    routerLink: ['/home'],
  };
}
