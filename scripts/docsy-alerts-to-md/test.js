#!/usr/bin/env node
/**
 * Sanity tests for convert.pl
 * Run: node test.js
 */

const assert = require('assert');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'convert.pl');
const tmpFile = path.join(__dirname, 'test-tmp.md');

function runConvert(input) {
  fs.writeFileSync(tmpFile, input);
  execSync(`perl "${scriptPath}" "${tmpFile}"`, { timeout: 5000 });
  const result = fs.readFileSync(tmpFile, 'utf8');
  fs.unlinkSync(tmpFile);
  return result;
}

// Test 1: Single-line alert
{
  const input = `{{% alert title="Note" %}} Inline content {{% /alert %}}`;
  const expected = `> [!NOTE]
>
> Inline content
`;
  const result = runConvert(input);
  assert.strictEqual(result, expected, 'Single-line alert failed');
  console.log('✓ Single-line alert');
}

// Test 2: Multi-line alert with blank lines
{
  const input = `{{% alert title=Note %}}

Some content here
spanning multiple lines.

{{% /alert %}}
`;
  const expected = `> [!NOTE]
>
> Some content here
> spanning multiple lines.
`;
  const result = runConvert(input);
  assert.strictEqual(result, expected, 'Multi-line alert failed');
  console.log('✓ Multi-line alert');
}

// Test 3: File with no alerts (passthrough)
{
  const input = `# Hello World

This is regular content.
No alerts here.
`;
  const result = runConvert(input);
  assert.strictEqual(result, input, 'Passthrough failed');
  console.log('✓ Passthrough (no alerts)');
}

// Test 4: Empty alert
{
  const input = `{{% alert title="Note" %}}

{{% /alert %}}
`;
  const expected = `> [!NOTE]
`;
  const result = runConvert(input);
  assert.strictEqual(result, expected, 'Empty alert failed');
  console.log('✓ Empty alert');
}

// Test 5: Alert with surrounding content
{
  const input = `Before alert.

{{% alert title="Note" %}}

Alert content.

{{% /alert %}}

After alert.
`;
  const expected = `Before alert.

> [!NOTE]
>
> Alert content.

After alert.
`;
  const result = runConvert(input);
  assert.strictEqual(result, expected, 'Alert with surrounding content failed');
  console.log('✓ Alert with surrounding content');
}

// Test 6: Skip alert containing tabpane
{
  const input = `{{% alert title="Note" %}}

Some content with a tabpane:

{{< tabpane text=true >}}
{{% tab "Example" %}}
Code here
{{% /tab %}}
{{< /tabpane >}}

{{% /alert %}}
`;
  const result = runConvert(input);
  assert.strictEqual(result, input, 'Alert with tabpane should be unchanged');
  console.log('✓ Skip alert containing tabpane');
}

// Test 7: Opening tag with inline content, closing tag on different line
{
  const input = `{{% alert title="Note" %}} Content starts here
and continues on the next line.
{{% /alert %}}
`;
  const expected = `> [!NOTE]
>
> Content starts here
> and continues on the next line.
`;
  const result = runConvert(input);
  assert.strictEqual(result, expected, 'Inline content with multi-line failed');
  console.log(
    '✓ Opening tag with inline content, closing tag on different line',
  );
}

// Test 8: Alert with inline content and code block
{
  const input = `{{% alert title="Note" %}} The annotations use Spring AOP.

In the following example:

\`\`\`java
@RestController
public class MyController {
    @GetMapping("/ping")
    public void aMethod() {
    }
}
\`\`\`

{{% /alert %}}
`;
  const expected = `> [!NOTE]
>
> The annotations use Spring AOP.
>
> In the following example:
>
> \`\`\`java
> @RestController
> public class MyController {
>     @GetMapping("/ping")
>     public void aMethod() {
>     }
> }
> \`\`\`
`;
  const result = runConvert(input);
  assert.strictEqual(result, expected, 'Alert with code block failed');
  console.log('✓ Alert with inline content and code block');
}

// Test 9: Unclosed alert (passthrough, don't hang)
{
  const input = `{{% alert title="Note" %}} This alert has no closing tag.

Some content here.
`;
  const result = runConvert(input);
  assert.strictEqual(result, input, 'Unclosed alert should passthrough');
  console.log('✓ Unclosed alert (passthrough)');
}

// Test 10: Inline content with closing tag on same line as last content and
// "Notes" title
{
  const input = `{{% alert title="Notes" %}} First line
second line
last line with closing tag. {{% /alert %}}
`;
  const expected = `> [!NOTE]
>
> First line
> second line
> last line with closing tag.
`;
  const result = runConvert(input);
  assert.strictEqual(result, expected, 'Inline closing tag failed');
  console.log('✓ Inline content with closing tag on same line as last content');
}

// Test 11: Alert with title="Warning"
{
  const input = `{{% alert color="warning" title="Warning" %}}

This component is intended for dev inner-loop, there is no plan to make it
production ready. Production environments should use something else.

{{% /alert %}}
`;
  const expected = `> [!WARNING]
>
> This component is intended for dev inner-loop, there is no plan to make it
> production ready. Production environments should use something else.
`;
  const result = runConvert(input);
  assert.strictEqual(result, expected, 'Alert with title="Warning" failed');
  console.log('✓ Alert with title="Warning"');
}

// Test 12: Alert with color="warning" only
{
  const input = `{{% alert color="warning" %}} Warning content here. {{% /alert %}}
`;
  const expected = `> [!WARNING]
>
> Warning content here.
`;
  const result = runConvert(input);
  assert.strictEqual(result, expected, 'Alert with color="warning" failed');
  console.log('✓ Alert with color="warning"');
}

// Test 13: Alert with no arguments defaults to NOTE
{
  const input = `{{% alert %}} This alert has no arguments. {{% /alert %}}

And some more text.`;
  const expected = `> [!NOTE]
>
> This alert has no arguments.

And some more text.`;
  const result = runConvert(input);
  assert.strictEqual(
    result,
    expected,
    'Alert without arguments should default to NOTE',
  );
  console.log('✓ Alert with no arguments defaults to NOTE');
}

// Test 14: Alert with color="success" and title
{
  const input = `{{% alert color="success" title="Pro tip" %}}

You can also run the \`fix\` commands locally.

{{% /alert %}}
`;
  const expected = `> [!TIP] Pro tip
>
> You can also run the \`fix\` commands locally.
`;
  const result = runConvert(input);
  assert.strictEqual(
    result,
    expected,
    'Alert with color="success" and title failed',
  );
  console.log('✓ Alert with color="success" and title');
}

// Test 15: Alert with title="Caution"
{
  const input = `{{% alert title="Caution" %}}

This feature has limitations.

{{% /alert %}}
`;
  const expected = `> [!CAUTION]
>
> This feature has limitations.
`;
  const result = runConvert(input);
  assert.strictEqual(result, expected, 'Alert with title="Caution" failed');
  console.log('✓ Alert with title="Caution"');
}

// Test 16: Alert with unsupported color (passthrough)
{
  const input = `{{% alert color="blue" %}} This alert has an unsupported color attribute. {{% /alert %}}`;
  const result = runConvert(input);
  assert.strictEqual(
    result,
    input,
    'Alert with unsupported color should be unchanged',
  );
  console.log('✓ Alert with unsupported color (passthrough)');
}

console.log('\nAll tests passed!');
