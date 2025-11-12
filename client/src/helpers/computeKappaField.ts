import Decimal from "decimal.js";

export interface FieldConfig {
    size_kpc: number;       // half-width of square region (e.g., 1000 kpc)
    resolution: number;     // number of samples per dimension (e.g., 200)
    M_kg: string;
    b_kpc: number;
    k0: string;
    rho0: string;
    rho_gas: string;
    kv: string;
    vrel: string;           // m/s
    ridge_y0_kpc: number;
    ridge_sigma_kpc: number;
}

const G = new Decimal("6.674e-11");
const C = new Decimal("2.99792458e8");
const kpc = new Decimal("3.085677581e19");
const ARCSEC_PER_RAD = new Decimal("206264.806247");

export function computeLensingField(cfg: FieldConfig) {
    Decimal.set({ precision: 40 });

    const size_m = kpc.mul(cfg.size_kpc);
    const b_m = kpc.mul(cfg.b_kpc);

    const M = new Decimal(cfg.M_kg);
    const k0 = new Decimal(cfg.k0);
    const rho0 = new Decimal(cfg.rho0);
    const rho_gas = new Decimal(cfg.rho_gas);
    const kv = new Decimal(cfg.kv);
    const vrel = new Decimal(cfg.vrel);

    const alpha_GR = new Decimal(4).mul(G).mul(M).div(C.pow(2)).div(b_m);

    const data: number[][] = [];
    const N = cfg.resolution;

    for (let yi = 0; yi < N; yi++) {
        const row: number[] = [];
        const y = new Decimal(yi).div(N - 1).mul(size_m.mul(2)).minus(size_m);

        for (let xi = 0; xi < N; xi++) {
            // const x = new Decimal(xi).div(N - 1).mul(size_m.mul(2)).minus(size_m);
            // const R = x.pow(2).plus(y.pow(2)).sqrt().plus(1);

            // base curvature part
            const k_base = k0.mul(rho_gas.div(rho0).sqrt());

            // collision ridge (Gaussian along y)
            const dy = y.minus(kpc.mul(cfg.ridge_y0_kpc));
            const ridge_sigma = kpc.mul(cfg.ridge_sigma_kpc);
            const shear = vrel.div("1e-12").pow(3).mul(dy.div(ridge_sigma).pow(2).mul(-0.5).exp());
            const k_coll = kv.mul(shear).mul(rho_gas.div(rho0).sqrt());

            const kappa = k_base.plus(k_coll);

            const alpha_model = alpha_GR.mul(kappa.mul(b_m).div(2).exp());
            const alpha_arcsec = alpha_model.mul(ARCSEC_PER_RAD).toNumber();

            row.push(alpha_arcsec);
        }
        data.push(row);
    }

    return { data, size_kpc: cfg.size_kpc, resolution: cfg.resolution };
}
