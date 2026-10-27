# Widget

The shared card: a `surface-secondary` frame with an inset `surface` panel.

**Use for** forms and metrics. Use `Attributes` for read-only label/value cards.

**Props** parts `Header` (`Title`, `endContent`), `Content`, `Footer`, `Action`, `Legend`, `LegendItem` (`color`).

**Don't** put any table inside a widget, nest widgets or override their radii. Tables render directly and own their frame.
