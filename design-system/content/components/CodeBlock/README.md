# CodeBlock

A code panel with filename header, copy button and Prism syntax highlighting in theme tokens.

## When to use

Use for configuration and commands users copy, such as MCP client setup. Use `TypographyCode` for short inline code.

## What the consumer provides

`CodeBlock.Header` with `CodeBlock.Filename` and `CodeBlock.CopyButton` (`code`), and `CodeBlock.Code` (`code`, optional `language`). Mount the app's toast provider for copy feedback.

## Key props

- `CodeBlock.Code language`: a Prism language such as `json`, `html` or `bash`; omit for plain text.
- `CodeBlock.CopyButton`: keeps the visible Copy label and the accessible name Copy code; locks repeat presses while the clipboard write is pending.

## Do / Don't

- Do rely on the one success or danger toast per copy attempt.
- Don't add a second copy control or inline copy status.
