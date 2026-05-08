import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-save-template-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Save selection as template</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" style="width: 100%">
        <mat-label>Template name</mat-label>
        <input
          matInput
          [(ngModel)]="nameModel"
          (keyup.enter)="confirm()"
          autofocus
          placeholder="e.g. LED + current limiter"
        />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!trimmed()" (click)="confirm()">
        Save
      </button>
    </mat-dialog-actions>
  `,
})
export class SaveTemplateDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<SaveTemplateDialogComponent, string>>(
    MatDialogRef,
  );

  nameModel = '';

  trimmed(): boolean {
    return this.nameModel.trim().length > 0;
  }

  confirm() {
    const value = this.nameModel.trim();
    if (!value) return;
    this.dialogRef.close(value);
  }

  cancel() {
    this.dialogRef.close();
  }
}
