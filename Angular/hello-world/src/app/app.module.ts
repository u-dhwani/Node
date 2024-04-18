import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { TestComponent } from './test/test.component';

@NgModule({
  declarations: [ // All components used by the application
    AppComponent,
    TestComponent
  ],
  imports: [
    CommonModule
  ],
  bootstrap:[AppComponent]
})
export class AppModule { }
