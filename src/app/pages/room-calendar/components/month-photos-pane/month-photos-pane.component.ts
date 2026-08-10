import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MonthPhoto {
  id: string;
  thumbnailUrl: string;
}

@Component({
  selector: 'app-month-photos-pane',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './month-photos-pane.component.html',
  styleUrl: './month-photos-pane.component.css',
  host: { class: 'photos-pane' },
})
export class MonthPhotosPaneComponent {
  monthLabel = input.required<string>();
  photos = input<MonthPhoto[]>([]);

  photoClick = output<MonthPhoto>();
}
