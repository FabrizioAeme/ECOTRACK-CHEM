import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function fechaHoyISO(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export const soloEspacios: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value;
  return typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0
    ? { soloEspacios: true }
    : null;
};

export const mayorQueCero: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value;
  return valor !== null && valor !== '' && Number(valor) <= 0 ? { mayorQueCero: true } : null;
};

export const fechaNoFutura: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value as string | null;
  return valor && valor > fechaHoyISO() ? { fechaFutura: true } : null;
};

export function coincideCon(otroCampo: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const otro = control.parent?.get(otroCampo);
    return otro && control.value && control.value !== otro.value ? { noCoincide: true } : null;
  };
}
