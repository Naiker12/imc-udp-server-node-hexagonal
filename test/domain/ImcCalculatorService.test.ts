import { describe, it, expect } from 'vitest';
import { Paciente } from '../../src/domain/model/Paciente.js';
import { ImcCalculatorService } from '../../src/domain/service/ImcCalculatorService.js';

describe('ImcCalculatorService & Paciente (Domain)', () => {
  const service = new ImcCalculatorService();

  it('debe calcular correctamente el IMC en categoría Normal', () => {
    // 70 kg / (1.75 m ^ 2) = 22.86
    const paciente = new Paciente(70, 1.75);
    const resultado = service.calcular(paciente);

    expect(resultado.imc).toBe(22.86);
    expect(resultado.clasificacion).toBe('Normal (Peso saludable)');
    expect(resultado.interpretacion).toContain('rango óptimo');
  });

  it('debe normalizar automáticamente la altura enviada en centímetros (175 cm -> 1.75 m)', () => {
    const paciente = new Paciente(70, 175);
    const resultado = service.calcular(paciente);

    expect(resultado.imc).toBe(22.86);
    expect(paciente.altura).toBe(1.75);
  });

  it('debe clasificar correctamente Bajo peso (< 18.5)', () => {
    // 45 kg / (1.65 m ^ 2) = 16.53
    const paciente = new Paciente(45, 1.65);
    const resultado = service.calcular(paciente);

    expect(resultado.imc).toBe(16.53);
    expect(resultado.clasificacion).toBe('Bajo peso');
  });

  it('debe clasificar correctamente Sobrepeso (25.0 - 29.9)', () => {
    // 85 kg / (1.72 m ^ 2) = 28.73
    const paciente = new Paciente(85, 1.72);
    const resultado = service.calcular(paciente);

    expect(resultado.imc).toBe(28.73);
    expect(resultado.clasificacion).toBe('Sobrepeso');
  });

  it('debe clasificar correctamente Obesidad Clase I (30.0 - 34.9)', () => {
    // 95 kg / (1.70 m ^ 2) = 32.87
    const paciente = new Paciente(95, 1.70);
    const resultado = service.calcular(paciente);

    expect(resultado.imc).toBe(32.87);
    expect(resultado.clasificacion).toBe('Obesidad Clase I');
  });

  it('debe clasificar correctamente Obesidad Clase II (35.0 - 39.9)', () => {
    // 110 kg / (1.70 m ^ 2) = 38.06
    const paciente = new Paciente(110, 1.70);
    const resultado = service.calcular(paciente);

    expect(resultado.imc).toBe(38.06);
    expect(resultado.clasificacion).toBe('Obesidad Clase II');
  });

  it('debe clasificar correctamente Obesidad Clase III (>= 40.0)', () => {
    // 130 kg / (1.65 m ^ 2) = 47.75
    const paciente = new Paciente(130, 1.65);
    const resultado = service.calcular(paciente);

    expect(resultado.imc).toBe(47.75);
    expect(resultado.clasificacion).toBe('Obesidad Clase III');
  });

  it('debe arrojar error de dominio cuando el peso es menor o igual a 0', () => {
    expect(() => new Paciente(0, 1.70)).toThrow('El peso debe ser mayor a 0 kg');
    expect(() => new Paciente(-10, 1.70)).toThrow('El peso debe ser mayor a 0 kg');
  });

  it('debe arrojar error de dominio cuando la altura es inválida', () => {
    expect(() => new Paciente(70, 0)).toThrow('La altura debe estar entre 0.3 m y 3.0 m');
    expect(() => new Paciente(70, 4.5)).toThrow('La altura debe estar entre 0.3 m y 3.0 m');
  });
});
