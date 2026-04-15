# Switching / Bell Toy Sandbox

This repo contains small, reproducible toy-model scripts used to generate figures and sanity-checks for:
- orientation/progress Bell/CHSH toy models
- width sweeps for the Bell toy
- MZI-style switching “revisit” experiments (exploratory)

Outputs are saved into `./outputs/`.

## Quick start

Create a virtual environment and install minimal deps:

```bash
python -m venv .venv
source .venv/bin/activate
pip install numpy matplotlib