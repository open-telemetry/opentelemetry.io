import os

root_dir = 'content/en/docs'
# Order matters: longest paths first
replacements = [
    ('/docs/collector/custom-collector', '/docs/collector/extend/ocb'),
    ('/docs/collector/building/receiver', '/docs/collector/extend/custom-component/receiver'),
    ('/docs/collector/building/connector', '/docs/collector/extend/custom-component/connector'),
    ('/docs/collector/building/authenticator-extension', '/docs/collector/extend/custom-component/extension/authenticator'),
    ('/docs/collector/building/', '/docs/collector/extend/custom-component/'),
    ('/docs/collector/building', '/docs/collector/extend/custom-component'),
]

for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith('.md'):
            filepath = os.path.join(subdir, file)
            try:
                with open(filepath, 'r') as f:
                    lines = f.readlines()

                modified = False
                new_lines = []
                for line in lines:
                    # Skip alias lines
                    if line.strip().startswith('aliases:'):
                        new_lines.append(line)
                        continue

                    original_line = line
                    for old, new in replacements:
                        if old in line:
                            line = line.replace(old, new)

                    if line != original_line:
                        modified = True
                    new_lines.append(line)

                if modified:
                    with open(filepath, 'w') as f:
                        f.writelines(new_lines)
                    print(f"Updated {filepath}")
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

