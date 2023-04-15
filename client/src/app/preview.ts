import { SafeUrl } from "@angular/platform-browser";
import { Spice } from './spice';

export interface Preview {
    safeUrl: SafeUrl;
    spices?: Spice[];
    data: string;
}
