/// <reference types="../../../server/common/protocol" />

import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
// import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DFLAppComponent } from './dfl/app.component';
import { TabsModule, TabsetComponent } from 'ngx-bootstrap/tabs';  
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { CodeBrowserComponent } from './code-browser/code-browser.component';
import { HttpClientModule } from '@angular/common/http';
import { DalService } from './services/dal.service';

@NgModule({
	declarations: [
		DFLAppComponent,
		CodeBrowserComponent,
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		BrowserAnimationsModule,
		// RouterModule,
		CollapseModule.forRoot(),
		CommonModule,
		FormsModule,
		AppRoutingModule,
		TabsModule.forRoot(),
		AccordionModule.forRoot(),
		BsDropdownModule.forRoot(), ModalModule.forRoot()
	],
	exports: [],
	providers: [ DalService ],
	bootstrap: [DFLAppComponent]
})
export class AppModule { }