import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';

@Component({
  templateUrl: './app.html',
  selector: 'app-root',
  imports: [RouterOutlet, Header],
})
export class App {}
