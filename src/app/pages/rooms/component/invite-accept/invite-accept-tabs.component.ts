import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TabMode = 'invite' | 'accept';

@Component({
  selector: 'app-invite-accept-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invite-accept-tabs.component.html',
  styleUrl: './invite-accept-tabs.component.css',
})
export class InviteAcceptTabsComponent {
  pendingCount = input<number>(0);
  activeTab = input<TabMode | null>(null);

  tabClick = output<TabMode>();

  onTabClick(mode: TabMode) {
    this.tabClick.emit(mode);
  }
}
