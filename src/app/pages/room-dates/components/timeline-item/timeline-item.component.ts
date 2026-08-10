import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WashiCardComponent } from '../../../../shared/components/washi-card/washi-card.component';
import { ImportantDate } from '../../../../models/important-date.model';
import { formatDate, getTimeInfo } from '../../../../utils/date.utils';

@Component({
  selector: 'app-timeline-item',
  standalone: true,
  imports: [CommonModule, WashiCardComponent],
  templateUrl: './timeline-item.component.html',
  styleUrl: './timeline-item.component.css',
})
export class TimelineItemComponent {
  date = input.required<ImportantDate>();
  index = input.required<number>();

  deleteDate = output<ImportantDate>();

  // Lógica de presentación derivada de los inputs
  isLeftSide = computed(() => this.index() % 2 === 0);
  isUpcoming = computed(() => getTimeInfo(this.date().eventDate).label === 'Days Away');

  // Exponemos las utils para el HTML
  formatDate = formatDate;
  getTimeInfo = getTimeInfo;

  onDelete() {
    this.deleteDate.emit(this.date());
  }
}
