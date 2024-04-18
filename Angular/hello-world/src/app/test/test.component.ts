import { Component, OnInit } from '@angular/core';

@Component({
  selector: '[app-test]',
  standalone: true,
  imports: [],
  template: `<div>Inline Template</div>`,
  styles: [`div{
    color : red;
  }`] 
})
export class TestComponent implements OnInit{
  constructor(){

  }

  ngOnInit(){

  }
}
