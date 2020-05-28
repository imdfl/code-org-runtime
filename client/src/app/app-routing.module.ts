import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router
import { CodeBrowserComponent } from '@components/code-browser/code-browser.component';
import { PlaygroundComponent } from '@components/playground/playground.component';

const routes: Routes = [
	{ path: 'browse', component: CodeBrowserComponent },
	{ path: 'script/:name', component: PlaygroundComponent}
]; // sets up routes constant where you define your routes

// configures NgModule imports and exports
@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true } )],
	exports: [RouterModule]
})
export class AppRoutingModule { }
