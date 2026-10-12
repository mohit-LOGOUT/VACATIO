import { v, ConvexError } from 'convex/values';
export const propertyFields = {
  name:v.string(), address:v.string(), checkInTime:v.string(), checkOutTime:v.string(), timeZone:v.string(),
  parkingDetails:v.optional(v.string()), entryInstructions:v.string(), houseRules:v.string(), requiredIdTypes:v.array(v.string()),
  description:v.optional(v.string()), propertyType:v.optional(v.string()), guestCapacity:v.optional(v.number()),
  bedrooms:v.optional(v.number()), beds:v.optional(v.number()), bathrooms:v.optional(v.number()),
  amenities:v.optional(v.array(v.string())), directions:v.optional(v.string()), notes:v.optional(v.string()),
};
export const propertyInput=v.object(propertyFields);
export function validateProperty(p: Record<string,unknown>) {
  if(typeof p.name!=='string'||!p.name.trim()||p.name.length>250)throw new ConvexError('Enter a property name of up to 250 characters.');
  for(const [key,value]of Object.entries(p)){
    if(typeof value==='string'&&value.length>12000)throw new ConvexError(`${key} is too long.`);
    if(Array.isArray(value)&&(value.length>100||value.some(x=>typeof x!=='string'||x.length>1000)))throw new ConvexError(`${key} has too many or overly long entries.`);
    if(typeof value==='number'&&(!Number.isFinite(value)||value<0||value>10000))throw new ConvexError(`${key} must be a non-negative number.`);
  }
  for(const key of ['checkInTime','checkOutTime'])if(p[key]&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(p[key])))throw new ConvexError('Use a valid 24-hour time, or leave it blank when unknown.');
}
export function missingFields(p:Record<string,unknown>){return ['address','checkInTime','checkOutTime','entryInstructions','houseRules','requiredIdTypes','guestCapacity','amenities'].filter(k=>p[k]===undefined||p[k]===''||(Array.isArray(p[k])&&p[k].length===0));}
