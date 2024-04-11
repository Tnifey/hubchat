import { component, html, use } from "maki";
import { repeat } from 'lit-html/directives/repeat.js';
import { $model, $models } from "./state";

component(() => {
    const models = use($models);
    const model = use($model);
    return () => html`
        <select
            class="p-2 rounded"
            .value=${model()}
            @change=${(e: Event) => model((e.target as HTMLSelectElement).value)}>
            ${repeat(models(), x => x, (name) => html`
                <option value=${name} ?selected=${name === model()}>${name}</option>
            `)}
        </select>
    `;
}).as('app-select-model');
