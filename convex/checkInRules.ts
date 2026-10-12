export function isReadyForCheckIn(input: {
  expectedGuestCount: number;
  requiredIdTypes: string[];
  acceptedTypesByGuest: string[][];
  arrivalInformationSentAt?: number;
  hasOpenEscalation: boolean;
}): boolean {
  return Number.isInteger(input.expectedGuestCount)
    && input.expectedGuestCount > 0
    && input.expectedGuestCount <= 100
    && input.acceptedTypesByGuest.length === input.expectedGuestCount
    && input.requiredIdTypes.length > 0
    && input.acceptedTypesByGuest.every(types => input.requiredIdTypes.every(type => types.includes(type)))
    && input.arrivalInformationSentAt !== undefined
    && !input.hasOpenEscalation;
}
