// Ana sayfadaki gül bahçesi için: bir günün gülü ne kadar açmış?
// Haftanın en uzun çalışılan gününe (max) göre oranlanır:
// hiç çalışılmamış → "none" (yalnızca filiz), az → "bud" (gonca), orta → "half", çok → "full".
export function bloomStage(seconds, max) {
  if (!(seconds > 0) || !(max > 0)) return "none";
  const ratio = seconds / max;
  if (ratio < 0.34) return "bud";
  if (ratio < 0.75) return "half";
  return "full";
}
