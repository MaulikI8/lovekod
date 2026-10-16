import re
import glob
import sys

ALLOWED_FILES = {
    'src/styles/tokens.css',
    'src/components/TiharLights.jsx',
    'src/components/GarlandDivider.jsx',
    'src/components/Icons.jsx',
}

NAMED_WHITE = re.compile(r'\btext-white\b|\bcolor:\s*white\b', re.IGNORECASE)

violations = []

files = []
for ext in ('jsx', 'js', 'css', 'ts', 'tsx'):
    files.extend(glob.glob(f'src/**/*.{ext}', recursive=True))

for fpath in sorted(files):
    norm_path = fpath.replace('\\', '/')
    if norm_path in ALLOWED_FILES or 'index.css.bak' in norm_path or 'skiper37.jsx' in norm_path:
        continue

    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            for lnum, line in enumerate(f, 1):
                clean_line = line.strip()
                if clean_line.startswith('/*') or clean_line.startswith('//') or clean_line.startswith('*') or 'data:image/svg' in clean_line:
                    continue
                if NAMED_WHITE.search(clean_line):
                    violations.append((norm_path, lnum, "Disallowed raw white keyword", clean_line[:90]))
    except Exception:
        pass

if violations:
    print(f"FAILED: Found {len(violations)} raw color violation(s):")
    for v in violations[:15]:
        print(f"  {v[0]}:{v[1]} - {v[2]} in: {v[3]}")
    sys.exit(1)
else:
    print("SUCCESS: Zero unauthorized white keywords found in components.")
    sys.exit(0)
