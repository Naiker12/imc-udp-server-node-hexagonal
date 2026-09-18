/**
 * Entidad de dominio que representa a un paciente con peso y altura.
 * Contiene reglas de validación puras de negocio.
 */
export class Paciente {
  readonly peso: number;
  readonly altura: number;

  constructor(peso: number, altura: number) {
    if (typeof peso !== 'number' || isNaN(peso) || !isFinite(peso)) {
      throw new Error('El peso debe ser un número válido.');
    }
    if (typeof altura !== 'number' || isNaN(altura) || !isFinite(altura)) {
      throw new Error('La altura debe ser un número válido.');
    }

    if (peso <= 0 || peso > 500) {
      throw new Error('El peso debe ser mayor a 0 kg y menor o igual a 500 kg.');
    }

    // Si la altura se introduce en centímetros (ej: 175), se normaliza a metros (1.75)
    let alturaNormalizada = altura;
    if (alturaNormalizada > 3.0 && alturaNormalizada <= 300) {
      alturaNormalizada = alturaNormalizada / 100;
    }

    if (alturaNormalizada <= 0.3 || alturaNormalizada > 3.0) {
      throw new Error('La altura debe estar entre 0.3 m y 3.0 m (o entre 30 y 300 cm).');
    }

    this.peso = peso;
    this.altura = alturaNormalizada;
  }
}
