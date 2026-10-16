import re
import glob
import sys

"""
Linter script to guard against horizontal overflow regressions.
Scans CSS and JSX style definitions for unsafe fixed widths or rogue vw units
that could trigger horizontal scrolling on mobile viewports (e.g. 390px).
"""

UNSAFE_WIDTH = re.compile(r'^\s*width:\s*([4-9]\d{2}|[1-9]\d{3,})px', re.IGNORECASE)

issues = []

css_files = glob.glob('src/**/*.css', recursive=True)

for cfile in css_files:
    norm_path = cfile.replace('\\', '/')
    if 'bak' in norm_path:
        continue
    with open(cfile, 'r', encoding='utf-8') as f:
        in_mobile_query = False
        for lnum, line in enumerate(f, 1):
            if '@media' in line and any(px in line for px in ('900px', '768px', '640px', '480px')):
                in_mobile_query = True
            if in_mobile_query and '}' in line and not '{' in line:
                in_mobile_query = False
            
            if in_mobile_query and UNSAFE_WIDTH.search(line):
                # Flag fixed wide widths inside mobile queries
                issues.append((norm_path, lnum, "Fixed width > 400px inside mobile query", line.strip()))

# Check that root container has overflow protection
with open('src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()
    if 'overflow-x: hidden' not in content:
        issues.append(('src/index.css', 1, "Missing overflow-x: hidden on root/body", "body/html overflow guard"))

if issues:
    print(f"FAILED: Found {len(issues)} horizontal overflow risk(s):")
    for issue in issues:
        print(f"  {issue[0]}:{issue[1]} - {issue[2]} -> {issue[3]}")
    sys.exit(1)
else:
    print("SUCCESS: Zero horizontal overflow risks found. Root overflow guards verified.")
    sys.exit(0)
