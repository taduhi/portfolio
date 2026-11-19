# Trần Đức Hiếu — Portfolio

VR Developer · Software Engineer. Static portfolio site (English and Vietnamese) published with GitHub Pages.

**Live:** https://taduhi.github.io/portfolio/

## Projects

- VR Supermarket
- Reverse Tide (Thế Giới Đảo Ngược)
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
    │   ├── css/            portrait.css
    │   ├── img/            portrait.jpg
    │   └── licenses/       Noto Sans (OFL), embedded in index.html
    └── media/
        ├── <project>/      cover.jpg, process.jpg, result.jpg (+ extra media)
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
