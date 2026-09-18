/**
 * Categorías del Índice de Masa Corporal según la Organización Mundial de la Salud (OMS).
 */
export type CategoriaImc =
  | 'Bajo peso'
  | 'Normal (Peso saludable)'
  | 'Sobrepeso'
  | 'Obesidad Clase I'
  | 'Obesidad Clase II'
  | 'Obesidad Clase III';

/**
 * Objeto de valor (Value Object) que encapsula el resultado del cálculo de IMC.
 */
export class ResultadoImc {
  readonly imc: number;
  readonly clasificacion: CategoriaImc;
  readonly interpretacion: string;

  constructor(imc: number, clasificacion: CategoriaImc, interpretacion: string) {
    this.imc = Number(imc.toFixed(2));
    this.clasificacion = clasificacion;
    this.interpretacion = interpretacion;
  }
}
