#!/usr/bin/env python3
"""Cut the bottle out of a studio photograph for the product page.

The page behind the bottle is the same near-black the catalogue card uses,
which changes what the matte has to be. Compositing over black gives
result = source x alpha, so any pixel below full opacity comes out darker
than the photograph — a soft ramp was quietly dimming the glass and the
label. Full opacity for anything with light in it reproduces the original
exactly, and the only thing keyed out is the true black backdrop, which the
page supplies itself.

The crop is fixed rather than detected. Every automatic bound tried here was
fooled by something: brightness finds the lit marble floor, which on the
red-wine bottles is brighter than the bottle; column mass finds the label
specular; column height finds the studio halo, which is as tall as the
bottle. Measured across all five photographs the setup is consistent to
within a couple of percent (centre 49.0-50.5%, subject width 24.6-32.5%,
top 4-7%), so a fixed window with margin is simpler and more predictable —
and a differently shot photograph will look wrong immediately, not subtly.
"""
import sys, numpy as np
from PIL import Image

CENTRE, HALF_W = 0.50, 0.22
TOP, BOTTOM = 0.02, 0.97

def cutout(src, dst, opaque_at=11.0):
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.float32)
    lum = 0.299*a[:,:,0] + 0.587*a[:,:,1] + 0.114*a[:,:,2]
    h, w = lum.shape

    # Lift the black point off whatever the corners actually are before the
    # ramp runs. Most of these photographs sit on a true 0, but one edited
    # copy in the set has a 22-level background, and feeding that straight
    # into the ramp would make its backdrop 80% opaque — a grey slab instead
    # of a cut-out bottle.
    corner = np.percentile(np.concatenate([
        lum[:40, :40].ravel(), lum[:40, -40:].ravel(),
        lum[-40:, :40].ravel(), lum[-40:, -40:].ravel()]), 80)
    lum = np.clip(lum - corner - 1.0, 0, None)

    # Opaque wherever there is any light at all. The threshold sits just
    # above the sensor floor, so the studio halo — which is real light in the
    # photograph, not an artefact — is kept at full strength exactly as shot.
    al = np.clip(lum / opaque_at, 0, 1)

    L, R = int(w*(CENTRE-HALF_W)), int(w*(CENTRE+HALF_W))
    T, B = int(h*TOP), int(h*BOTTOM)

    # A narrow feather at the crop window itself, so the cut never shows if
    # the frame edge happens to fall on lit floor. Kept tight: anything wider
    # starts fading the photograph rather than just its border.
    fade = int((B-T)*0.05)
    al[B-fade:B] *= np.linspace(1, 0, fade)[:, None]
    edge = int((R-L)*0.03)
    ramp = np.linspace(0, 1, edge)
    al[:, L:L+edge] *= ramp[None, :]
    al[:, R-edge:R] *= ramp[::-1][None, :]

    # Colour is passed through untouched — the page matches the photograph's
    # black, so there is nothing to compensate for.
    out = Image.fromarray(a.astype(np.uint8), 'RGB').convert('RGBA')
    out.putalpha(Image.fromarray((al*255).astype(np.uint8), 'L'))
    out = out.crop((L, T, R, B))
    out.save(dst, 'WEBP', quality=92, method=6, exact=True)
    return out.size

if __name__ == '__main__':
    # The threshold is an argument because one photograph needed it. The 1L
    # Blatina was shot with a far stronger backdrop glow than the rest, and at
    # the default the halo is real light by this tool's definition, so it came
    # through as a grey slab around the bottle. 120 keys it out and leaves the
    # bottle untouched. Pass it whenever a new photograph comes back haloed.
    opaque_at = float(sys.argv[3]) if len(sys.argv) > 3 else 11.0
    print('%-38s %s' % (sys.argv[2], cutout(sys.argv[1], sys.argv[2], opaque_at)))
