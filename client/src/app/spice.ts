import { SpiceType } from './spice-type';

export interface Spice {
    _id?: string;
    label: string;
    type: SpiceType;
    selected?: boolean;
    image?: string;
    printed?: string[];
    toPrint?: string[];
    expirationDate?: string;
    epicesDeCru?: boolean;
    owner?: string;
    spicyLevel?: number;
}
