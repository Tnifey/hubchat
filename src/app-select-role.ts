import { component, html, use } from "maki";
import { repeat } from "lit-html/directives/repeat.js";
import { $role } from "./state";

component(() => {
    const roles = ['user', 'assistant', 'system'];
    const role = use($role);
    return () => html`
        <select
            class="p-2 rounded"
            .value=${role()}
            @change=${(e: Event) => role((e.target as HTMLSelectElement).value)}>
            ${repeat(roles, x => x, (name) => html`
                <option value=${name} ?selected=${name === role()}>${name}</option>
            `)}
        </select>
    `;
}).as('app-select-role');
