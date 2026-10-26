# Modal

A dialog for forms and multi-step flows, with the shared 20px padding and 16px header/body/footer rhythm; the HeroUI Modal primitive.

## When to use

Use Modal for forms and confirmation flows. Use `ActionConfirmation` for a plain yes/no consequence prompt, `Popover` for contextual content, and `Dropdown` for action menus.

## What the consumer provides

Controlled `isOpen` / `onOpenChange` on `Modal.Backdrop`, the heading, body and footer actions. The app awaits its mutation and closes the dialog only after success.

## Key props

- Parts: `Modal.Backdrop` > `Modal.Container` (`size`: `sm`, `md`, `lg`) > `Modal.Dialog` > `Modal.Header` (`Modal.Heading`, `Modal.CloseTrigger`), `Modal.Body`, `Modal.Footer`.

## Do / Don't

- Do use the `secondary` input variant inside a modal, and Cancel as a `secondary` button.
- Do keep the close control inside the header; omit empty body or footer sections.
- Don't show a failed submission inline as well as in the toast; keep the draft and the dialog open.
