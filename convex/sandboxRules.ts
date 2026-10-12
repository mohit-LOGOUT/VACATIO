import { v } from "convex/values";
export const contextValidator = v.object({
  guestName: v.string(), propertyName: v.string(), arrivalDate: v.string(), departureDate: v.string(), guestCount: v.number(),
  checkInTime: v.string(), checkOutTime: v.string(), location: v.string(), directions: v.string(), entry: v.string(),
  parking: v.string(), houseRules: v.string(), idRequirements: v.string(),
});
export type SandboxContext = {
  guestName: string; propertyName: string; arrivalDate: string; departureDate: string; guestCount: number;
  checkInTime: string; checkOutTime: string; location: string; directions: string; entry: string;
  parking: string; houseRules: string; idRequirements: string;
};
export const sources = ["Booking", "Check-in / check-out", "Location / directions", "Entry instructions", "Parking", "House rules", "ID requirements", "Host answer"] as const;
export function validateContext(input: SandboxContext) {
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string" && (value.length > 2000 || value !== value.trim())) throw new Error(`Keep ${key} under 2,000 characters and remove extra spaces.`);
  }
  if (!input.guestName || !input.propertyName || !input.checkInTime || !input.checkOutTime || !input.location) throw new Error("Add the guest, property, location and check-in/out times.");
  const validDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
  if (!validDate(input.arrivalDate) || !validDate(input.departureDate) || input.departureDate <= input.arrivalDate) throw new Error("Use valid stay dates, with departure after arrival.");
  if (!Number.isInteger(input.guestCount) || input.guestCount < 1 || input.guestCount > 100) throw new Error("Guest count must be a whole number from 1 to 100.");
  if (![input.checkInTime, input.checkOutTime].every(t => /^([01]\d|2[0-3]):[0-5]\d$/.test(t))) throw new Error("Use valid check-in/out times.");
}
export const samples: SandboxContext[] = [
  { guestName: "Aarav Shah", propertyName: "Palm House, Goa", arrivalDate: "2026-10-23", departureDate: "2026-10-26", guestCount: 3,
    checkInTime: "15:00", checkOutTime: "11:00", location: "Fictional Palm Lane, Assagao, Goa", directions: "Turn left at the village bakery. Palm House is the second white villa on Palm Lane.", entry: "The caretaker meets you at the main gate after 3 pm. Share your arrival time here.", parking: "Free parking inside the gate for two cars.", houseRules: "No parties. Quiet hours are 10 pm to 8 am. Smoking is allowed only on the terrace.", idRequirements: "One of Aadhaar, PAN or passport for each guest. This fictional demo checks document names using clearly labelled sample files." },
  { guestName: "Meera Kapoor", propertyName: "Cedar Cottage, Manali", arrivalDate: "2026-11-06", departureDate: "2026-11-09", guestCount: 2,
    checkInTime: "14:00", checkOutTime: "10:00", location: "Fictional Cedar Path, Old Manali, Himachal Pradesh", directions: "Meet the caretaker beside the village bridge. The cottage is a five-minute uphill walk; vehicles cannot reach the entrance.", entry: "The caretaker hands you the keys at the cottage after 2 pm.", parking: "No parking at the cottage. A paid public car park is beside the village bridge; its price is not provided.", houseRules: "No parties or indoor smoking. Quiet hours are 9 pm to 7 am. Pets are not allowed.", idRequirements: "One of Aadhaar, PAN or passport for each guest. This fictional demo checks document names using clearly labelled sample files." },
];
