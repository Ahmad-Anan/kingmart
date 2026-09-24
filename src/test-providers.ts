import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';

// providers افتراضية لكل ملفات التست (بيقراها @angular/build:unit-test من providersFile في angular.json)
// HttpClientTesting عشان مفيش أي طلب حقيقي يروح للـ API أثناء التست
const testProviders: (Provider | EnvironmentProviders)[] = [
  provideRouter([]),
  provideHttpClient(),
  provideHttpClientTesting(),
  MessageService,
];

export default testProviders;
