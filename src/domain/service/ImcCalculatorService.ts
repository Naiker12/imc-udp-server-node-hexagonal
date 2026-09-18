import { Paciente } from '../model/Paciente.js';
import { ResultadoImc, CategoriaImc } from '../model/ResultadoImc.js';

/**
 * Servicio de dominio puro para el cálculo y categorización del IMC.
 * No tiene dependencias externas ni conoce nada sobre protocolos de red (UDP, HTTP, etc.).
 */
export class ImcCalculatorService {
  /**
   * Calcula el IMC a partir de un Paciente: IMC = peso / (altura ^ 2)
   * y clasifica según la tabla estándar de la OMS.
   */
  calcular(paciente: Paciente): ResultadoImc {
    const imc = paciente.peso / (paciente.altura * paciente.altura);

    let clasificacion: CategoriaImc;
    let interpretacion: string;

    if (imc < 18.5) {
      clasificacion = 'Bajo peso';
      interpretacion = 'Su peso está por debajo del rango saludable recomendado por la OMS. Se aconseja valoración nutricional.';
    } else if (imc < 25.0) {
      clasificacion = 'Normal (Peso saludable)';
      interpretacion = 'Su peso se encuentra dentro del rango óptimo y saludable según la OMS.';
    } else if (imc < 30.0) {
      clasificacion = 'Sobrepeso';
      interpretacion = 'Su peso se sitúa en rango de sobrepeso. Se sugiere actividad física y asesoría nutricional preventiva.';
    } else if (imc < 35.0) {
      clasificacion = 'Obesidad Clase I';
      interpretacion = 'Presenta obesidad de grado I (moderada). Se recomienda seguimiento médico y cambios en el estilo de vida.';
    } else if (imc < 40.0) {
      clasificacion = 'Obesidad Clase II';
      interpretacion = 'Presenta obesidad de grado II (severa). Existe riesgo cardiovascular elevado, consulte a un especialista.';
    } else {
      clasificacion = 'Obesidad Clase III';
      interpretacion = 'Presenta obesidad de grado III (muy severa o mórbida). Requiere atención médica y tratamiento multidisciplinario prioritario.';
    }

    return new ResultadoImc(imc, clasificacion, interpretacion);
  }
}
