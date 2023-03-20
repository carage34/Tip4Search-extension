import {LOCALE_ID, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuHoverDirective } from '../directive/menu-hover.directive';
import {MatCard, MatCardModule} from "@angular/material/card";
import {HttpClientModule} from "@angular/common/http";
import localeFr from '@angular/common/locales/fr';
import {registerLocaleData} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    MenuHoverDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    HttpClientModule,
    MatButtonModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
