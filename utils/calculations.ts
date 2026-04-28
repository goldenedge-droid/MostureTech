/**
 * Moisture and Psychrometric Calculations
 */

// Saturated Vapor Pressure (Pa) using Arden Buck equation
export const calculateSVP = (tempC: number): number => {
  return 611.21 * Math.exp((18.678 - tempC / 234.5) * (tempC / (257.14 + tempC)));
};

// Actual Vapor Pressure (Pa)
export const calculateAVP = (tempC: number, rh: number): number => {
  return calculateSVP(tempC) * (rh / 100);
};

// Mixing Ratio (g/kg dry air)
export const calculateMixingRatio = (tempC: number, rh: number, pressurePa: number = 101325): number => {
  const avp = calculateAVP(tempC, rh);
  const ratio = 0.62198 * (avp / (pressurePa - avp));
  return ratio * 1000; // Convert to g/kg
};

// Mixing Ratio from Dew Point (g/kg)
export const calculateMixingRatioFromDP = (dpC: number, pressurePa: number = 101325): number => {
  const svpAtDP = calculateSVP(dpC); // Vapor pressure is SVP at dew point
  const ratio = 0.62198 * (svpAtDP / (pressurePa - svpAtDP));
  return ratio * 1000;
};

// Absolute Humidity (g/m³)
export const calculateAbsoluteHumidity = (tempC: number, rh: number): number => {
  const avp = calculateAVP(tempC, rh);
  const tempK = tempC + 273.15;
  const gasConstantWaterVapor = 461.5; // J/(kg·K)
  return (avp / (gasConstantWaterVapor * tempK)) * 1000; // Convert to g/m³
};

// Dew Point (°C)
export const calculateDewPoint = (tempC: number, rh: number): number => {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(rh / 100);
  return (b * alpha) / (a - alpha);
};

/**
 * Ducting Calculations
 */

export const calculateDuctVelocity = (airflowM3h: number, diameterMm: number): number => {
  const area = Math.PI * Math.pow(diameterMm / 2000, 2); // m^2
  return (airflowM3h / 3600) / area; // m/s
};

export const calculateDuctPressureDrop = (airflowM3h: number, diameterMm: number, lengthM: number): number => {
  const velocity = calculateDuctVelocity(airflowM3h, diameterMm);
  const diameterM = diameterMm / 1000;
  // f is friction factor, approx 0.02 for galvanized steel
  const f = 0.02;
  const rho = 1.204; // kg/m^3
  const deltaP = f * (lengthM / diameterM) * (rho * Math.pow(velocity, 2) / 2);
  return deltaP; // Pa
};

export const calculateBendLoss = (velocity: number, count90: number, count45: number): number => {
  const rho = 1.204; // kg/m^3
  const dynamicPressure = (rho * Math.pow(velocity, 2)) / 2;
  
  // Standard Zeta coefficients for smooth bends
  const zeta90 = 0.35; 
  const zeta45 = 0.18;
  
  return (count90 * zeta90 * dynamicPressure) + (count45 * zeta45 * dynamicPressure);
};

export const estimateDuctNoise = (velocity: number): number => {
  if (velocity <= 0) return 0;
  const baseNoise = 10 + 55 * Math.log10(velocity);
  return Math.max(15, baseNoise); // dB(A) floor
};

/**
 * Dehumidification Capacity
 */

export const calculateDehumCapacity = (
  airflowM3h: number,
  ambientMR: number,
  targetMR: number,
  internalLoadGh: number,
  isClosed: boolean
): number => {
  const rho = 1.202; // Standard air density kg/m3
  
  // Ventilation load is only relevant if ambient air is wetter than target
  const deltaMR = Math.max(0, ambientMR - targetMR);
  
  // For open systems, we process the full airflow from ambient to target
  // For closed systems, we typically process internal load plus infiltration/leakage
  // Here we use the airflow provided as the 'leakage/ventilation' rate to handle
  const airMoistureLoad = airflowM3h * rho * deltaMR; // g/h
  
  return airMoistureLoad + internalLoadGh;
};