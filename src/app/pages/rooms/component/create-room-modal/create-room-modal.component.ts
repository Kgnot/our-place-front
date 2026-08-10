import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { CreateRoomPayload, RelationshipType } from '../../../../models/room.model';

@Component({
  selector: 'app-create-room-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './create-room-modal.component.html',
})
export class CreateRoomModalComponent {
  isOpen = input<boolean>(false);
  relationshipTypes = input<RelationshipType[]>([]);
  isSaving = input<boolean>(false);

  saveRoom = output<CreateRoomPayload>();
  closeModal = output<void>();

  newName = signal('');
  newType = signal('');
  newDate = signal<string | null>(null);

  constructor() {
    // Reinicia el formulario cada vez que se abre el modal
    effect(() => {
      if (this.isOpen()) {
        this.newName.set('');
        this.newDate.set(null);
        if (this.relationshipTypes().length > 0) {
          this.newType.set(this.relationshipTypes()[0].code);
        }
      }
    });
  }

  onSave() {
    if (!this.newName().trim()) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';

    this.saveRoom.emit({
      name: this.newName(),
      relationshipTypeCode: this.newType(),
      anniversaryDate: this.newDate(),
      timezone: timezone,
    });
  }
}
