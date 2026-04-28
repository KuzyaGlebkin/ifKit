import fs, { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const s = `## Context

Контейнер \`#ifk-settings-theme-font\` скрыт \`aria-hidden\`. Внутри — сегмент «Тема» (кнопки с \`tabindex="-1"\`) и ползунок «Шрифт» (\`tabindex="-1"\`). Ряд с пресетом акцентa (\`#ifk-settings-accent-row\`) визуально соседствует: для согласованного поведения в AT и Tab — \`aria-hidden="true"\` на обёртке ряда, \`tabindex="-1"\` на сегмент-кнопках (см. \`modal-focus-lock\`).

## Goals / Non-Goals

Цель: AT не включает ряд «Акцент» в чтение; фокус-ловушка модалки не зацикливает Tab на сегментах акцентa (как при скрытой «Тема»).

Вне scope: смена политики у «Тема+Шрифт»; вариант \`role="group"\` (отклонён в пользу подхода как у \`#ifk-settings-theme-font\`).

## Risks

С клавиатуры нельзя сфокусировать сегменты акцентa; мышью/тач — можно. Это согласовано с сегментами «Тема» в \`aria-hidden\`.
`
const spec = `## MODIFIED Requirements

### Requirement: Пресет акцентного цвета
Модалка SHALL содержать визуальную группу (сегментные кнопки в одной «рамке», контейнер \`ifk-segment-group\`) выбора **пресетов** акцентного цветa, соответствующих \`Settings.accent\` (см. \`user-settings\`). Активный пресет SHALL быть визуально выделен, как в группе «Тема», **в том числе без наведения указателя** на кнопку.

Контейнер ряда с пресетом акцентa (\`#ifk-settings-accent-row\`, подпись + сегмент-группа) SHALL иметь \`aria-hidden="true"\` (как \`#ifk-settings-theme-font\` для «Тема» и «Шрифт»), **чтобы** вспомогательные технологии **не** включали этот ряд в **ч**т**e**h**a**a**a

**NO**
`
// truncated - the tool might mess up. Simpler: write spec in a separate .md fragment file

void 0