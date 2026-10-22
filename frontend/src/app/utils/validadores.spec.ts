import { FormControl, FormGroup } from '@angular/forms';
import { coincideCon, fechaHoyISO, fechaNoFutura, mayorQueCero, soloEspacios } from './validadores';

describe('Validadores personalizados', () => {
  it('soloEspacios rechaza textos con solo espacios', () => {
    expect(soloEspacios(new FormControl('   '))).toEqual({ soloEspacios: true });
    expect(soloEspacios(new FormControl('Acetona'))).toBeNull();
  });

  it('mayorQueCero rechaza 0 y negativos', () => {
    expect(mayorQueCero(new FormControl(0))).toEqual({ mayorQueCero: true });
    expect(mayorQueCero(new FormControl(-5))).toEqual({ mayorQueCero: true });
    expect(mayorQueCero(new FormControl(12.5))).toBeNull();
  });

  it('fechaNoFutura acepta hoy y rechaza fechas futuras', () => {
    expect(fechaNoFutura(new FormControl(fechaHoyISO()))).toBeNull();
    expect(fechaNoFutura(new FormControl('2999-01-01'))).toEqual({ fechaFutura: true });
  });

  it('coincideCon compara con otro campo del formulario', () => {
    const form = new FormGroup({
      clave: new FormControl('secreto1'),
      confirmar: new FormControl('otra', coincideCon('clave')),
    });
    form.controls.confirmar.updateValueAndValidity();
    expect(form.controls.confirmar.errors).toEqual({ noCoincide: true });
    form.controls.confirmar.setValue('secreto1');
    expect(form.controls.confirmar.errors).toBeNull();
  });
});
