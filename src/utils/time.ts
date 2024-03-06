import { yellow } from "../../deps.ts";

export function renderTimeDelta(delta: number): string {
  const sinces = [delta];
  const sinceUnits = ["milli"];
  if (sinces[0] >= 1000) {
    sinces.push(Math.floor(sinces[0] / 1000));
    sinces[0] = sinces[0] % 1000;
    sinceUnits.push("second");
  }
  if (sinces[1] >= 60) {
    sinces.push(Math.floor(sinces[1] / 60));
    sinces[1] = sinces[1] % 60;
    sinceUnits.push("minute");
  }

  if (sinces[2] >= 60) {
    sinces.push(Math.floor(sinces[2] / 60));
    sinces[2] = sinces[2] % 60;
    sinceUnits.push("hour");
  }

  if (sinces[3] >= 24) {
    sinces.push(Math.floor(sinces[3] / 24));
    sinces[3] = sinces[3] % 24;
    sinceUnits.push("day");
  }

  if (sinces.length > 1) {
    // remove millis if there are already seconds
    sinces.shift();
    sinceUnits.shift();
  }

  sinces.reverse();
  sinceUnits.reverse();
  let sinceStr = "";
  for (let x = 0; x < sinces.length; x++) {
    const since = sinces[x];
    let sinceUnit = sinceUnits[x];
    if (since === 0) continue;
    if (sinceStr) {
      sinceStr += ", ";
    }
    if (sinces[x] > 1) {
      sinceUnit += "s";
    }
    sinceStr += `${since} ${sinceUnit}`;
    if (x === 0) {
      sinceStr = yellow(sinceStr);
    }
  }
  return sinceStr;
}
