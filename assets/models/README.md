# Models

No binary model assets are bundled with the repository. By default the scene uses
simple placeholder geometry and makes no network requests for GLB files.

To use real assets, add your own `hut_stylized.glb`, `tree_stylized.glb`, and other
models to this directory and set `window.USE_3D_MODELS = true` before the game
initialises. The models should be in GLB format and are typically subject to your
own licensing requirements.
