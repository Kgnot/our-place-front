import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pet } from '../../../../models/pet.model';

@Component({
  selector: 'app-pets-rail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pets-rail.component.html',
  styleUrl: './pets-rail.component.css',
})
export class PetsRailComponent {
  pets = input<Pet[]>([]);

  addPet = output<void>();
  selectPet = output<string>();
}
