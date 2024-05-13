import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  styles:[`
    h3{
      color : dodgerblue
    }
  `]
})
export class AppComponent {
  showSecret = false;
  log = [];
  title = 'my-first-app';

  onToggleDetails(){
    this.showSecret = !this.showSecret;
    this.log.push(this.log.length + 1);
  }
}
