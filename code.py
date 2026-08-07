#!/usr/bin/env python3
import os

SKIP_DIRS = {
    'node_modules', '.git', '.expo', 'build', '.gradle',
    'Pods', 'DerivedData', '.cxx', 'build/generated',
    '__tests__', 'ios/Pods',
}
EXTENSIONS = {'.ts', '.tsx', '.js', '.jsx', '.xml', '.gradle', '.kt', '.properties', '.md'}
INCLUDE_FILES = {'Gemfile', 'package.json', 'metro.config.js', 'babel.config.js'}
ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'docs', 'code.md')

# Only walk these top-level dirs
ALLOW_PREFIXES = ('src/', 'android/app/src/', 'android/app/build.gradle', 'android/build.gradle',
                  'android/gradle.properties', 'android/settings.gradle', 'android/gradlew',
                  'android/gradlew.bat', 'android/gradle/wrapper/')

os.makedirs(os.path.join(ROOT, 'docs'), exist_ok=True)

entries = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    rel_dir = os.path.relpath(dirpath, ROOT)
    for f in filenames:
        ext = os.path.splitext(f)[1]
        if ext not in EXTENSIONS and f not in INCLUDE_FILES:
            continue
        rel = os.path.join(rel_dir, f) if rel_dir != '.' else f
        if not any(rel.startswith(p) for p in ALLOW_PREFIXES):
            continue
        full = os.path.join(dirpath, f)
        try:
            with open(full, 'r', errors='ignore') as fh:
                content = fh.read()
            entries.append((rel, content))
        except Exception:
            pass

entries.sort(key=lambda x: x[0])

with open(OUT, 'w') as out:
    out.write('# ARIN — Full Source Code\n\n')
    out.write(f'> {len(entries)} files\n\n---\n\n')
    for rel, content in entries:
        out.write(f'## `{rel}`\n\n')
        ext = os.path.splitext(rel)[1]
        lang = ext.lstrip('.')
        if lang in ('ts', 'tsx'): lang = 'typescript'
        elif lang in ('js', 'jsx'): lang = 'javascript'
        elif lang in ('kt',): lang = 'kotlin'
        elif lang in ('gradle',): lang = 'gradle'
        out.write(f'```{lang}\n{content}\n```\n\n---\n\n')

print(f'Wrote {len(entries)} files to {OUT}')
