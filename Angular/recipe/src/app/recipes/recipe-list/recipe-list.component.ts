import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css'
})
export class RecipeListComponent implements OnInit {
  recipes = Recipes[] = [
    new RecipeListComponent('A Test Recipe','This is simply a test','../assets/img/burger.jpg'),
  ];
  constructor() { }
  ngOnInit() {

  }
}
