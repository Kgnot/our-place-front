import { afterNextRender, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileModalComponent } from './shared/components/profile-modal/profile-modal.component';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProfileModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('our-place');
  private userService = inject(UserService);

  constructor() {
    afterNextRender(() => {
      if (localStorage.getItem('op_token')) {
        this.userService.loadMe();
      }
    });
  }
}
