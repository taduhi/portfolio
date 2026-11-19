# Trần Đức Hiếu — Portfolio

VR Developer · Software Engineer. Static portfolio site (English and Vietnamese) published with GitHub Pages.

**Live:** https://taduhi.github.io/portfolio/

## Projects

- VR Supermarket
- MonoMates
- Self-hosted LLM for VR Characters
- OCR & Vision-Language Brand Identification
- Minesweeper AI Solver
- Tic-Tac-Toe n×n with Game AI

## Structure

```
.
├── index.html              redirects to duc-hieu/
├── .nojekyll
└── duc-hieu/
    ├── index.html          the portfolio (single page, no build step)
    ├── assets/
    │   ├── css/            portrait and refinement styles
    │   ├── js/             GSAP, ScrollTrigger and motion code
    │   ├── img/            portrait and social preview
    │   └── licenses/       Noto Sans (OFL), embedded in index.html
    └── media/
        ├── <project>/      screenshots, video and browser demo
        └── CREDITS.md      sources and licenses of third-party images
```

## Run locally

Open `duc-hieu/index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

then visit http://localhost:8000/.

## Credits

Third-party images and licenses are listed in [`duc-hieu/media/CREDITS.md`](duc-hieu/media/CREDITS.md).

The portfolio's animations use GSAP 3.15.1 and ScrollTrigger under the [GSAP Standard License](https://gsap.com/standard-license/).
