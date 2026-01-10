export function PartialType<T>(classType: new () => T) {
  return classType as new () => Partial<T>;
}