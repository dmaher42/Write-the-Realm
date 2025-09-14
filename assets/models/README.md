# Models

No binary model assets are bundled with the repository. By default the scene uses
simple placeholder geometry and makes no network requests for GLB files.

To use real assets, add your own `hut_stylized.glb`, `tree_stylized.glb`, and other
models to this directory and set `window.USE_3D_MODELS = true` before the game
initialises. The models should be in GLB format and are typically subject to your
own licensing requirements.

## Character Animations

Playable character models must include at least two animation clips:

* `Idle`
* `Walk`

When exporting from modeling tools such as Blender:

1. Create separate actions for each animation.
2. Name the actions exactly `Idle` and `Walk`.
3. Ensure the clips are included when exporting to GLB (e.g., enable *Include → Animations*).

The game looks for these clip names to drive movement. If a clip is missing, the
character will stay static — arms and legs will not move.
