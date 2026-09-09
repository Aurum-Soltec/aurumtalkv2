# IMOBI CRM — Frontend Branding Migration

Status: implemented in this customized fork.

Scope:
- Product-facing default name changed to `IMOBI CRM`.
- Supplied IMOBI logo added at `public/imobi-logo.png`.
- Primary accent changed to IMOBI purple `#7B3FA4`.
- Secondary identity tokens added for orange `#F57C00`, dark purple `#5E2D83`,
  lilac `#D8C2E8`, graphite `#4A4A4A`, and white.
- UI font changed from Atkinson Hyperlegible to Poppins.
- Login/access surface received a restrained purple/orange identity treatment.
- Sidebar logo sizing adjusted to the IMOBI wordmark.
- Product metadata changed to IMOBI CRM / CRM imobiliário.
- Internal technical names, database identifiers, protocol headers and historical
  documentation were intentionally preserved where they are not user-facing, to
  minimize fork delta and avoid breaking compatibility.

Validation performed in this package:
- source-level search for visible `DeskcommCRM` references under `app/` and
  `components/`;
- branding defaults/tests updated for the new product identity;
- design-system runtime ruler kept synchronized with CSS palette.

Full build/test execution still requires dependency installation (`pnpm install`)
in an environment with package registry access.
