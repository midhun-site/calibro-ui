import { Component, signal, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  quickAction?: { label: string; route: string };
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.css'
})
export class AiChatComponent {
  private router = inject(Router);

  isOpen = input<boolean>(false);
  closeChat = output<void>();

  public userQuestionInput = signal<string>('');

  public defaultQuestions = signal<string[]>([
    'Workorders pending 4 last 3 days',
    'Which master calibration standards are due this month?',
    'How many equipment calibrations are in progress?',
    'Generate ISO 17025 certificate summary report',
    'Show overdue customer jobs & SLA warnings'
  ]);

  public chatMessages = signal<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: '👋 Hello Alex! I am **CaliBro AI Assistant** (Calibration & ISO 17025 Intelligence). Ask me anything about workorders, calibration schedules, pending equipment, or compliance status!',
      time: 'Just now'
    }
  ]);

  onClose() {
    this.closeChat.emit();
  }

  askQuestion(question: string) {
    if (!question || !question.trim()) return;

    const userMsgId = `user-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Append User Message
    this.chatMessages.update(msgs => [
      ...msgs,
      { id: userMsgId, sender: 'user', text: question.trim(), time: timeStr }
    ]);

    this.userQuestionInput.set('');

    // 2. Generate Intelligent Response
    const qLower = question.toLowerCase();
    let replyText = '';
    let quickNav: { label: string; route: string } | undefined = undefined;

    if (qLower.includes('workorder') || qLower.includes('pending') || qLower.includes('3 days') || qLower.includes('4')) {
      replyText = `📋 **4 Workorders Pending Over the Last 3 Days**:\n\n` +
        `1. **WO-2026-001** | Apex Global Energy | EQ-TEMP-002 (Precision Temp Calibrator) — *Overdue 3 days*\n` +
        `2. **WO-2026-003** | BioPharm Solutions | EQ-TORQ-012 (Digital Torque Wrench 1000Nm) — *Pending Tech*\n` +
        `3. **WO-2026-007** | Apex Medical Labs | EQ-DIM-014 (Vernier Height Gauge 600mm) — *Awaiting Master*\n` +
        `4. **WO-2026-011** | Dubai Electricity | EQ-VOLT-044 (High Voltage Probe 40kV) — *Pending Audit*`;
      quickNav = { label: 'Open Workorders Register', route: '/transactions/workorder' };
    } else if (qLower.includes('master') || qLower.includes('standard') || qLower.includes('due')) {
      replyText = `🔬 **Master Calibration Standards Recalibration Schedule (August 2026)**:\n\n` +
        `• **Fluke 8508A Reference Multimeter** (SN: 99201411) — Due: 19 Dec 2026\n` +
        `• **AC/DC Clamp Meter** (SN: MS-104928) — Due: 21 Oct 2026\n` +
        `• **Digital Multimeter 287** (SN: MS-549012) — Due: 03 Nov 2026`;
      quickNav = { label: 'View Master Lab List', route: '/qc/master-lab-list' };
    } else if (qLower.includes('progress') || qLower.includes('status') || qLower.includes('how many')) {
      replyText = `📊 **Real-time Calibration Laboratory Overview**:\n\n` +
        `• **In-Progress Calibrations:** 5 Workorders\n` +
        `• **Calibrated & Certified:** 6 Workorders\n` +
        `• **Pending Workorders:** 3 Items\n` +
        `• **Overdue Alerts:** 1 Instrument`;
      quickNav = { label: 'View Job Register', route: '/transactions/job-register' };
    } else if (qLower.includes('iso') || qLower.includes('cert') || qLower.includes('17025')) {
      replyText = `✅ **ISO/IEC 17025:2017 Audit & Certificate Summary**:\n\n` +
        `• Accredited Procedures: CAL-SOP-EC-01 Rev.4 & CAL-SOP-TMP-04 Rev.3\n` +
        `• Measurement Uncertainty: EA-4/02 (Coverage factor k=2, 95% Confidence Level)\n` +
        `• Traceability: SI System realized through NPL / EMI / NIST standards`;
      quickNav = { label: 'Generate Certificate', route: '/certificates/generate' };
    } else {
      replyText = `🔍 **Search Query Results for "${question}"**:\n\nFound 3 related records in CaliBro CRM databases. You can inspect active workorders, generate ISO 17025 certificates, or review master standards traceability.`;
      quickNav = { label: 'Go to Dashboard', route: '/dashboard' };
    }

    // 3. Append Assistant Response after short delay
    setTimeout(() => {
      this.chatMessages.update(msgs => [
        ...msgs,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickAction: quickNav
        }
      ]);
    }, 400);
  }

  formatText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  }

  navigateToRoute(route: string) {
    this.onClose();
    this.router.navigate([route]);
  }
}
